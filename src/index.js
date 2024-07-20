import React from "react";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store, persistor } from "./Store";
import Home from "./Components/Home/Home ";
import Registeration from "./Components/Registeration/Registeration";
import { createRoot } from "react-dom/client";
import Login from "./Components/Login/Login";
import ForgotPassword from "./Components/ForgotPassword/ForgotPassword";
import Verify from "./Components/ForgotPassword/Verify";
import CreatePassword from "./Components/ForgotPassword/CreatePassword";
import GetFeeds from "./Components/getFeeds/GetFeeds";
import LoginHome from "./Components/LoginHome/LoginHome";
import Profile from "./Components/Profile/Profile";
import RegVerify from "./Components/Registeration/RegisterationVerification";
import Reels from "./Components/getFeeds/Reels";
import CreatePost from "./Components/getFeeds/CreatePost";
import PostUserProfile from "./Components/Profile/PostUserProfile";
import ReelUserProfile from "./Components/Profile/ReelUserProfile";
import PostCommentProfile from "./Components/Profile/PostCommentProfile";
import ReelCommentProfile from "./Components/Profile/reelCommentProfile";
import Spinner from "./Components/Spinner/spinner";
import PrivateRoute from "./Components/PrivateRoute";
import { PersistGate } from "redux-persist/integration/react";
import Notfound from "./Components/Notfound/Notfound";

const root = createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Registeration" element={<Registeration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verifyOtp" element={<Verify />} />
          <Route path="/createPassword" element={<CreatePassword />} />
          <Route path="/registeration-verify" element={<RegVerify />} />

          <Route
            path="/login-home"
            element={
              <PrivateRoute>
                <LoginHome />
              </PrivateRoute>
            }
          />
          <Route
            path="/getFeed"
            element={
              <PrivateRoute>
                <GetFeeds />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/post-user-profile"
            element={
              <PrivateRoute>
                <PostUserProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/reel-user-profile"
            element={
              <PrivateRoute>
                <ReelUserProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/post-comment-user-profile"
            element={
              <PrivateRoute>
                <PostCommentProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/reel-comment-user-profile"
            element={
              <PrivateRoute>
                <ReelCommentProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/reels"
            element={
              <PrivateRoute>
                <Reels />
              </PrivateRoute>
            }
          />
          <Route
            path="/createPost"
            element={
              <PrivateRoute>
                <CreatePost />
              </PrivateRoute>
            }
          />
          <Route
            path="/spinner"
            element={
              <PrivateRoute>
                <Spinner />
              </PrivateRoute>
            }
          />

<Route path="*" element={<Notfound />}/>
        </Routes>
      </BrowserRouter>
    </PersistGate>
  </Provider>
);
