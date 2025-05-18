import { User } from "@/app/profile";
import { createSlice } from "@reduxjs/toolkit";

interface UserState {
  user: User;
}

const initialState: UserState = {
  user: {
    id: "",
    email: "",
    avatar: "",
    username: "",
    full_name: "",
  },
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    updateUser: (state, action: { payload: Partial<User> }) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
  },
});

export const { setUser, updateUser } = userSlice.actions;

export default userSlice.reducer;
