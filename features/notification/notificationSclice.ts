import { createSlice } from "@reduxjs/toolkit";

interface Notification {
  id: string;
  name: string;
  description: string;
  type: string;
  is_viewed: boolean;
}

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload.id
      );
    },
    updateNotification: (state, action) => {
      const index = state.notifications.findIndex(
        (notification) => notification.id === action.payload.id
      );
      if (index !== -1) {
        state.notifications[index] = {
          ...state.notifications[index],
          ...action.payload,
        };
      }
    },
    markNotificationAsViewed: (state, action) => {
      const index = state.notifications.findIndex(
        (notification) => notification.id === action.payload.id
      );
      if (index !== -1) {
        state.notifications[index].is_viewed = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setNotifications,
  addNotification,
  removeNotification,
  updateNotification,
  markNotificationAsViewed,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
