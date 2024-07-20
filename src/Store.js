import { configureStore, combineReducers } from "@reduxjs/toolkit";
import registerationReducer from "./Containers/RegisterationSlice";
import loginReducer from "./Containers/LoginSlice";
import getFeedsReducer from "./Containers/GetFeedsSlice";
import createPostReducer from "./Containers/CreatePostsSlice";
import PostLikesReducer from "./Containers/PostLikeSlice";
import reelLikesReducer from "./Containers/ReelLikeSlice";
import PostCommentReducer from "./Containers/PostCommentSlice";
import reelCommentReducer from "./Containers/ReelCommentSlice";
import ForgotPasswordReducer from "./Containers/ForgotPasswordSlice";
import resetPasswordReducer from "./Containers/CreatePasswordSlice";
import ProfileReducer from "./Containers/ProfileSlice";
import getCommentsReducer from "./Containers/GetCommentsSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

const rootReducer = combineReducers({
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
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["loginReducer", "ProfileReducer"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };
