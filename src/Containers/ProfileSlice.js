import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchProfileInfo = createAsyncThunk(
  "profile/fetchProfileInfo",
  async (profile_id,{rejectWithValue} ) => {
    const token = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).token : null;
    console.log("Request data:", { profile_id });
    try {
      const response = await axios.post(
        "https://touchapp.org/api/profileinfo",
        { profile_id },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data.message[0];
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.errors[0].msg);
      }
      return rejectWithValue("Network error");
        }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    loading: false,
    error: null,
    userInfo: null,
    postInfo:[], 
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.userInfo = action.payload.userInfo;
        state.postInfo = action.payload.postInfo; 
      })
      .addCase(fetchProfileInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Network error";
      });
  },
});

export default profileSlice.reducer;
