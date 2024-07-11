import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async ({ post_id, offset, limit }, { rejectWithValue }) => {
    const token = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).token : null;

    try {
      const response = await axios.post(
        "https://touchapp.org/api/getComments",
        { post_id, offset, limit },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.message;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(
          error.response.data.errors[0]?.msg || "API Error"
        );
      }
      return rejectWithValue("Network error");
    }
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState: {
    loading: false,
    error: null,
    comments: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.comments = action.payload[0].comments;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Network error";
      });
  },
});

export default commentsSlice.reducer;
