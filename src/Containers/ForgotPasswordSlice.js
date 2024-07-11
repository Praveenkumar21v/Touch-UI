import { createSlice,createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const forgotPasswordRequest = createAsyncThunk(
  'forgotPassword/requestOTP',
  async (mobile, { rejectWithValue }) => {
    try {
      const response = await axios.post('https://touchapp.org/auth/forgotPassword', { mobile });
      localStorage.setItem('confirmPwdCode', response.data.data.confirmPwdCode); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(forgotPasswordRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(forgotPasswordRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(forgotPasswordRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
  },
});
   

export const forgotPasswordActions = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;
