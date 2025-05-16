import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Kharcha } from "@/app/(kharcha)/kharcha/[id]";

interface KharchaState {
  kharcha: Kharcha[];
}

const initialState: KharchaState = {
  kharcha: [],
};

const kharchaSlice = createSlice({
  name: "kharcha",
  initialState,
  reducers: {
    setKharcha: (state, action: PayloadAction<Kharcha[]>) => {
      state.kharcha = action.payload;
    },

    addKharcha: (state, action: PayloadAction<Kharcha>) => {
      state.kharcha.push(action.payload);
    },

    removeKharcha: (state, action: PayloadAction<{ id: string }>) => {
      state.kharcha = state.kharcha.filter(
        (kharcha) => kharcha.id !== action.payload.id
      );
    },
    updateKharcha: (
      state,
      action: PayloadAction<Partial<Kharcha> & { id: string }>
    ) => {
      const index = state.kharcha.findIndex(
        (kharcha) => kharcha.id === action.payload.id
      );
      if (index !== -1) {
        state.kharcha[index] = {
          ...state.kharcha[index],
          ...action.payload,
        };
      }
    },
  },
});

export const { setKharcha, addKharcha, removeKharcha, updateKharcha } =
  kharchaSlice.actions;

export default kharchaSlice.reducer;
