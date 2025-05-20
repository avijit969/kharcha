// selectors/userSelectors.ts
import { RootState } from "@/store/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectAuthUser = createSelector(
  (state: RootState) => state.user.user,
  (user) => user
);
