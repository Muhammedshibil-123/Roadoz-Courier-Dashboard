import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,          // { id, username, email }
  accessToken: null,
  isAuthenticated: false,
  loading: true,       // true while the app does the initial /token/refresh/ check
  loadingCount: 0,     // counts in-flight API calls (for global loading spinner)
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Called after successful login / OTP verification
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.loading = false;
    },

    // Called on logout or auth failure
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
    },

    // Called once the initial refresh check is done (even if it fails)
    finishInitialLoad: (state) => {
      state.loading = false;
    },

    // Global loading overlay counter
    startFetching: (state) => {
      state.loadingCount += 1;
    },
    stopFetching: (state) => {
      state.loadingCount = Math.max(0, state.loadingCount - 1);
    },
  },
});

export const {
  setCredentials,
  logout,
  finishInitialLoad,
  startFetching,
  stopFetching,
} = authSlice.actions;

export default authSlice.reducer;