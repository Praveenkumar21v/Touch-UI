import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchFeeds = createAsyncThunk(
  "feeds/fetchFeeds",
  async ({ offset, limit }, thunkAPI) => {
    try {
      const generatedToken = localStorage.getItem("userData")
        ? JSON.parse(localStorage.getItem("userData")).token
        : null;
        console.log("Token:", generatedToken);

        if (!generatedToken) {
          throw new Error("No token available");
        }
  
      const headers = { Authorization: `Bearer ${generatedToken}` };

      const response = await axios.post(
        "https://touchapp.org/api/getFeeds",
        { offset, limit },
        { headers }
      );


      return response.data.data;
    } catch (error) {
      console.error("API Error:", error.response ? error.response.data : error.message);
      return thunkAPI.rejectWithValue(error.response ? error.response.data : error.message);    }
  }
);

const getFeedsSlice = createSlice({
  name: "feeds",
  initialState: {
    data: [],
    loading: false,
    error: null,
    limit: 10,
    offset: 0,
    hasMore: true, 
    loadingMore: false, 
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeeds.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.loadingMore = false;
        state.error = null;
        state.data = [...state.data, ...action.payload];
        state.offset = state.data.length;
        state.hasMore = action.payload.length >= state.limit;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.error.message;
      });
  },
});


export default getFeedsSlice.reducer;
