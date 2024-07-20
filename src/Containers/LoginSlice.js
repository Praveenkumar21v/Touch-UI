import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://touchapp.org/auth/login",
        credentials
      );
      localStorage.setItem(
        "userData",
        JSON.stringify({
          token: response.data.data.token,
          user: response.data.data.user,
        })
      );
      console.log(response.data.data.token)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const LoginSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loginloading: false,
    loginerror: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("userData");
      state.user = null;
      state.loginloading = false;
      state.loginerror = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loginloading = true;
        state.loginerror = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginloading = false;
        state.user = action.payload;
        state.loginerror = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loginloading = false;
        state.loginerror = action.payload;
        state.user = null;
      });
  },
});

export const { logout } = LoginSlice.actions;
export const loginActions = LoginSlice.actions;
export default LoginSlice.reducer;
