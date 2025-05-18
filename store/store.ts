import khataReducer from "@/features/khata/khataSlice";
import kharchaReducer from "@/features/kharcha/kharchaSlice";
import khataMembersReducer from "@/features/khata/membersSclice";
import notificationReducer from "@/features/notification/notificationSclice";
import userSlice from "@/features/user/userSclice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    user: userSlice,
    khata: khataReducer,
    kharcha: kharchaReducer,
    khata_members: khataMembersReducer,
    notification: notificationReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
