import { createSlice } from "@reduxjs/toolkit";

interface KhataState {
  id: string;
  name: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  cover_image?: string;
  created_by: string;
  description: string;
  users: {
    full_name: string;
    avatar: string;
  };
}

const initialState: KhataState[] = [];

const khataSlice = createSlice({
  name: "khata",
  initialState,
  reducers: {
    setKhata: (state, action) => {
      return action.payload;
    },
    addKhata: (state, action) => {
      state.push(action.payload);
    },
    removeKhata: (state, action) => {
      return state.filter((khata) => khata.id !== action.payload.id);
    },
    updateKhata: (state, action) => {
      const index = state.findIndex((khata) => khata.id === action.payload.id);
      if (index !== -1) {
        state[index] = { ...state[index], ...action.payload };
      }
    },
    addAllKhata: (state, action) => {
      return action.payload;
    },
  },
});

export const { setKhata, addKhata, removeKhata, updateKhata, addAllKhata } =
  khataSlice.actions;
export default khataSlice.reducer;
