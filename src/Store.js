import { configureStore } from "@reduxjs/toolkit";
import registerationReducer from "./Containers/RegisterationSlice";
import loginReducer from "./Containers/LoginSlice";
import getFeedsReducer from './Containers/GetFeedsSlice';
import createPostReducer from './Containers/CreatePostsSlice';
import PostLikesReducer from './Containers/PostLikeSlice';
import reelLikesReducer from "./Containers/reelLikeSlice";
import PostCommentReducer from "./Containers/PostCommentSlice";
import reelCommentReducer from "./Containers/reelCommentSlice";
import ForgotPasswordReducer from "./Containers/ForgotPasswordSlice";
import resetPasswordReducer from "./Containers/CreatePasswordSlice";
import ProfileReducer from "./Containers/ProfileSlice";
import getCommentsReducer from "./Containers/GetCommentsSlice";

const store = configureStore({
  reducer: {
    registerationReducer,
    loginReducer,
    getFeedsReducer,
    createPostReducer,
    PostLikesReducer,
    reelLikesReducer,
    PostCommentReducer,
    reelCommentReducer,
    ForgotPasswordReducer,
    resetPasswordReducer,
    ProfileReducer,
    getCommentsReducer,
  },
});

export default store;
