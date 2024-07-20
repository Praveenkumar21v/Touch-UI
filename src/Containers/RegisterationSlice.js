import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const signup=createAsyncThunk("registeration/signup",async(registrationData,{ rejectWithValue })=>{
  try{
    const response= await axios.post('https://touchapp.org/auth/register',registrationData, )
   const{user,token}=response.data.data;
    localStorage.setItem('token',token);
    console.log(response.data.data.token);
    return {user,token};
  } catch (error) {
    return rejectWithValue(error.response.data);  }
})

const RegisterationSlice = createSlice({
  name: "registeration",
  initialState: {
    user: null,
    token:null,
    error: null,
    loading: false,
  },

  reducers: {},
extraReducers:(builder)=>{
  builder
  .addCase(signup.pending,(state)=>{
    state.loading=true;
    state.error=null;
  })
  .addCase(signup.fulfilled,(state,action)=>{
    state.loading=false;
    state.user=action.payload.user;
    state.token = action.payload.token;
  })
  .addCase(signup.rejected,(state,action)=>{
    state.loading = false;
    state.error = action.payload.message;
  })
}


});

export default RegisterationSlice.reducer;
