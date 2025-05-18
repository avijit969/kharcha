import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Member {
  id: string;
  full_name: string;
  avatar?: string;
  created_at?: string;
  role?: string;
  isAccepted?: boolean;
  expo_push_token?: string;
}

interface MembersState {
  khata_members: {
    khata_id: string;
    members: Member[];
  }[];
}

const initialState: MembersState = {
  khata_members: [],
};

const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    setMembers: (
      state,
      action: PayloadAction<{ khata_id: string; members: Member[] }>
    ) => {
      const existing = state.khata_members.find(
        (k) => k.khata_id === action.payload.khata_id
      );
      if (existing) {
        existing.members = action.payload.members;
      } else {
        state.khata_members.push({
          khata_id: action.payload.khata_id,
          members: action.payload.members,
        });
      }
    },
    addMember: (
      state,
      action: PayloadAction<{ khata_id: string; member: Member }>
    ) => {
      const khata = state.khata_members.find(
        (k) => k.khata_id === action.payload.khata_id
      );
      if (khata) {
        khata.members.push(action.payload.member);
      } else {
        state.khata_members.push({
          khata_id: action.payload.khata_id,
          members: [action.payload.member],
        });
      }
    },
    removeMember: (
      state,
      action: PayloadAction<{ khata_id: string; id: string }>
    ) => {
      const khata = state.khata_members.find(
        (k) => k.khata_id === action.payload.khata_id
      );
      if (khata) {
        khata.members = khata.members.filter(
          (member) => member.id !== action.payload.id
        );
      }
    },
    updateMember: (
      state,
      action: PayloadAction<{
        khata_id: string;
        id: string;
        updates: Partial<Member>;
      }>
    ) => {
      const khata = state.khata_members.find(
        (k) => k.khata_id === action.payload.khata_id
      );
      if (khata) {
        const index = khata.members.findIndex(
          (member) => member.id === action.payload.id
        );
        if (index !== -1) {
          khata.members[index] = {
            ...khata.members[index],
            ...action.payload.updates,
          };
        }
      }
    },
    updateAccepted: (
      state,
      action: PayloadAction<{
        khata_id: string;
        id: string;
        isAccepted: boolean;
      }>
    ) => {
      const khata = state.khata_members.find(
        (k) => k.khata_id === action.payload.khata_id
      );
      if (khata) {
        const index = khata.members.findIndex(
          (member) => member.id === action.payload.id
        );
        if (index !== -1) {
          khata.members[index].isAccepted = action.payload.isAccepted;
        }
      }
    },
  },
});

export const {
  setMembers,
  addMember,
  removeMember,
  updateMember,
  updateAccepted,
} = membersSlice.actions;

export default membersSlice.reducer;
