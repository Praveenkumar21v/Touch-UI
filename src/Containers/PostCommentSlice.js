import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const postComment = createAsyncThunk(
  'comments/postComment',
  async ({ post_id, text }, thunkAPI) => {
    const token = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).token : null;
    const headers = { Authorization: `Bearer ${token}` };
    const payload={ post_id, text }

    try {
      const response = await axios.post(
        'https://touchapp.org/api/postComment',
        payload,
        { headers }
      );
      console.log(response.data);
      return response.data;
      
    } catch (error) {
      console.error('API Error:', error.response.data);
      return thunkAPI.rejectWithValue(error.response.data);    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postComment.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload.data[0]);
            })
      .addCase(postComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      });
  },
});

export default commentsSlice.reducer;
