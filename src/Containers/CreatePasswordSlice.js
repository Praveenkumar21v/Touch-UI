import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const resetPassword = createAsyncThunk(
  'passwordReset/reset',
  async ({ password, confirmPassword }, { rejectWithValue }) => {
    try {
      const confirmPwdCode = localStorage.getItem('confirmPwdCode');
      const response = await axios.post('https://touchapp.org/auth/confirmPassword', {
        password,
        confirm_password: confirmPassword,
        confirm_pwd_code: confirmPwdCode
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const passwordResetSlice = createSlice({
  name: 'passwordReset',
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {},
  
  extraReducers: (builder) => {
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});


export default passwordResetSlice.reducer;
