import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const togglePostLike = createAsyncThunk(
  "likes/togglePostLike",
  async ({ userId,LikeId, reactionId }) => {
    const token = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).token : null;
    const headers = { Authorization: `Bearer ${token} ` };
    const payload = {user_id: userId, post_id: LikeId, reaction_id: reactionId }
    try {
      const response = await axios.post(
        "https://touchapp.org/api/postLike",
        payload,
        { headers }
      );
      console.log(response.data);  
      return response.data;
        } 
        catch (error) {
      return error.response.data;
    }
  }
);

const postLikeSlice = createSlice({
  name: "likes",
  initialState: {
    loading: false,
    error: null,
    likes: {},
    likeCounts: {},
  },
  reducers: { 
    updateLikeStatus(state, action) {
    const { LikeId, reactionId, likeCount } = action.payload;
    state.likes[LikeId] = reactionId === 1;
    state.likeCounts[LikeId] = likeCount;
  },
},


  extraReducers: (builder) => {
    builder
      .addCase(togglePostLike.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePostLike.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const { post_id, reaction_id, like_count } = action.payload;
        state.likes[post_id] = reaction_id === 1;
        state.likeCounts[post_id] = like_count;
      })
      .addCase(togglePostLike.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload.message : "Network error";
      });
  },
});

export const { updateLikeStatus } = postLikeSlice.actions;
export default postLikeSlice.reducer;
