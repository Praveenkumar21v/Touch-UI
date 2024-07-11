import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const toggleReelLike = createAsyncThunk(
    "likes/toggleReelLike",
      async ({reelId, reactionId }) => {
        const token = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).token : null;
        const headers = { Authorization: `Bearer ${token} ` };
    const payload = {reel_id: reelId, reaction_id: reactionId }
    try {
      const response = await axios.post(
        "https://touchapp.org/api/reelLike",
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

const ReelLikeSlice = createSlice({
  name: "likes",
  initialState: {
    loading: false,
    error: null,
    likes: {},
    likeCounts: {},
  },
  reducers: { 
    updateLikeStatus(state, action) {
    const { reelId, reactionId, likeCount } = action.payload;
    state.likes[reelId] = reactionId === 1;
    state.likeCounts[reelId] = likeCount;
  },
},


  extraReducers: (builder) => {
    builder
      .addCase(toggleReelLike.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleReelLike.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const { reel_id, reaction_id, like_count } = action.payload;
        state.likes[reel_id] = reaction_id === 1;
        state.likeCounts[reel_id] = like_count;
      })
      .addCase(toggleReelLike.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload.message : "Network error";
      });
  },
});

export const { updateLikeStatus } = ReelLikeSlice.actions;
export default ReelLikeSlice.reducer;
