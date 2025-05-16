import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface NoteState {
  id: string;
  title: string;
  content: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const initialState: NoteState[] = [];

const noteSlice = createSlice({
  name: "note",
  initialState,
  reducers: {
    addAllNotes: (state, action: PayloadAction<NoteState[]>) => {
      return action.payload;
    },
    addNote: (state, action: PayloadAction<NoteState>) => {
      state.push(action.payload);
    },
    removeNote: (state, action: PayloadAction<NoteState>) => {
      return state.filter((note) => note.id !== action.payload.id);
    },
    updateNote: (state, action: PayloadAction<NoteState>) => {
      const index = state.findIndex((note) => note.id == action.payload.id);
      console.log(index);
      if (index !== -1) {
        state[index] = { ...state[index], ...action.payload };
      }
    },
  },
});

export const { addNote, removeNote, updateNote, addAllNotes } =
  noteSlice.actions;
export default noteSlice.reducer;
