import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchFeeds = createAsyncThunk('feeds/fetchFeeds', async ({ offset, limit }, thunkAPI) => {
    const token = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).token : null;
    console.log('Token:', token);
    const headers = { Authorization: `Bearer ${token}` };
    console.log(offset);
    console.log(limit);
    try {
        const response = await axios.post('https://touchapp.in/api/getFeeds', { offset, limit }, { headers });
        console.log(response.data);
       
        return response.data.data;
    } catch (error) {
        console.error('API Error:', error.response.data);
        return thunkAPI.rejectWithValue(error.response.data);    }
});

const getFeedsSlice = createSlice({
    name: 'feeds',
    initialState: {
        data: [],
        loading: false,
        error: null,
        limit: 10,
        offset: 0,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFeeds.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFeeds.fulfilled, (state, action) => {
                state.loading = false;
                if (action.meta.arg.offset > 0) {
                    state.data = [...state.data, ...action.payload];
                    state.offset += action.payload.length; 
                  } else {
                    state.data = action.payload;
                    state.offset = action.payload.length; 
                  }
                })  
            .addCase(fetchFeeds.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export default getFeedsSlice.reducer;
