import { Tables } from "@/database.types";

export interface MemberBalance {
    userId: string;
    balance: number; // +ve means owed to, -ve means owes
}

export interface SimplifiedDebt {
    from: string; // Debtor
    to: string;   // Creditor
    amount: number;
}

export interface SettlementStats {
    totalSpent: number;
    userBalances: MemberBalance[];
    simplifiedDebts: SimplifiedDebt[];
}

export const calculateSettlements = (
    members: any[],
    expenses: any[],
    splits: Tables<'splits'>[],
    settlements: Tables<'settlements'>[]
): SettlementStats => {

    const balances: { [key: string]: number } = {};

    // Initialize balances
    members.forEach(m => {
        balances[m.id] = 0;
    });

    let totalSpent = 0;

    // 1. Process Expenses & Splits
    expenses.forEach(expense => {
        totalSpent += expense.amount || 0;
        
        // Payer gets credit (+)
        const payerId = expense.created_by;
        if (payerId) {
            balances[payerId] = (balances[payerId] || 0) + (expense.amount || 0);
        }

        // Splitters get debt (-)
        // Check if we have matching splits for this expense
        const expenseSplits = splits.filter(s => s.kharcha_id === expense.id);
        
        if (expenseSplits.length > 0) {
            expenseSplits.forEach(split => {
                balances[split.user_id] = (balances[split.user_id] || 0) - split.amount;
            });
        } else {
             // Fallback: If no splits found (legacy?), assume equal split among all members?
             // Or maybe skip? Better to verify data. For now, let's assume valid splits exist if created via app.
             // If not, maybe we shouldn't adjust balance or it's a "personal" expense not in a khata? 
             // But kharcha IS in a khata. 
             // Logic Update: If no splits, maybe it was just paid by payer? 
             // But if specific kharcha record exists, it usually implies shared. 
             // Let's rely on passed splits.
        }
    });

    // 2. Process Settlements
    settlements.forEach(settlement => {
        // Payer paid back -> Balance increases (+)
        balances[settlement.payer_id] = (balances[settlement.payer_id] || 0) + settlement.amount;
        
        // Payee received -> Balance decreases (-)
        balances[settlement.payee_id] = (balances[settlement.payee_id] || 0) - settlement.amount;
    });

    // 3. Simplify Debts
    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    Object.entries(balances).forEach(([id, amount]) => {
        // Fix precision issues
        const roundedAmount = Math.round(amount * 100) / 100;
        if (roundedAmount < -0.01) debtors.push({ id, amount: -roundedAmount }); // Store positive debt amount
        if (roundedAmount > 0.01) creditors.push({ id, amount: roundedAmount });
    });

    const simplifiedDebts: SimplifiedDebt[] = [];
    
    // Sort to optimize matching (optional, sometimes helps clean edges)
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let i = 0; // Debtor index
    let j = 0; // Creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const amount = Math.min(debtor.amount, creditor.amount);

        if (amount > 0) {
            simplifiedDebts.push({
                from: debtor.id,
                to: creditor.id,
                amount
            });
        }

        debtor.amount -= amount;
        creditor.amount -= amount;

        // precision handling
        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    const userBalances = Object.entries(balances).map(([userId, balance]) => ({
        userId,
        balance
    }));

    return {
        totalSpent,
        userBalances,
        simplifiedDebts
    };
};
