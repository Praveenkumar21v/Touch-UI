import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const createPost = createAsyncThunk('posts/createPost', async (postData,thunkAPI) => {
    const token = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).token : null;
    const headers = { Authorization: `Bearer ${token}` };

    try {
        const response = await axios.post('https://touchapp.org/api/createPost', postData, { headers });
        console.log(response.data);
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);    }
});

const postsSlice = createSlice({
    name: 'posts',
    initialState: {
        loading: false,
        error: null,
        data: [],
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createPost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(createPost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export default postsSlice.reducer;
