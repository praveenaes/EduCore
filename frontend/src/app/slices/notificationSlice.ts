import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { NotificationItem } from '../../types/notification';
import {
  getMyNotificationsApi,
  getUnreadCountApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from '../../services/notificationService';

interface NotificationState {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  total: 0,
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (
    params: { page?: number; limit?: number; search?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await getMyNotificationsApi(params);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch notifications'
      );
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUnreadCountApi();
      return response.data.data.unreadCount;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch unread count'
      );
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await markNotificationAsReadApi(notificationId);
      return notificationId;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to mark as read'
      );
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsAsReadApi();
      return true;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to mark all as read'
      );
    }
  }
);

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<any>) => {
      const newNotif: NotificationItem = {
        id: action.payload.id || new Date().toISOString(),
        notificationId: action.payload.id,
        userId: '',
        status: 'PENDING',
        notificationTitle: action.payload.title,
        notificationMessage: action.payload.message,
        notificationCreatedAt: action.payload.createdAt || new Date().toISOString(),
        metadata: action.payload.metadata,
        createdAt: new Date().toISOString(),
      };
      state.notifications.unshift(newNotif);
      state.unreadCount += 1;
      state.total += 1;
    },
    resetNotifications: (state) => {
      state.notifications = [];
      state.total = 0;
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.recipients;
        state.total = action.payload.total;
        if (action.payload.unreadCount !== undefined) {
          state.unreadCount = action.payload.unreadCount;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const item = state.notifications.find(
          (n) => n.id === action.payload || n.notificationId === action.payload
        );
        if (item && item.status !== 'READ') {
          item.status = 'READ';
          item.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.status = 'READ';
          n.readAt = new Date().toISOString();
        });
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, resetNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
