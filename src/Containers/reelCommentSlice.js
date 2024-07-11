import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const reelComment = createAsyncThunk(
  'comments/reelComment',
  async ({ reel_id, text }, thunkAPI) => {
    const token = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).token : null;
    const headers = { Authorization: `Bearer ${token}` };
    const payload={ reel_id, text }

    try {
      const response = await axios.post(
        'https://touchapp.org/api/reelComment',
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
    commentCount: 0
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(reelComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reelComment.fulfilled, (state, action) => {
        state.loading = false;
        const { data } = action.payload;
        if (data && data.length > 0) {
          const commentCount = data[0].comment_count;
          state.commentCount = commentCount; 
          state.data.push(data[0]);
        }
      })
      .addCase(reelComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      });
  },
});

export default commentsSlice.reducer;
