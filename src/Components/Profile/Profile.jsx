import React, { useEffect, useState } from "react";
import "./profile.css";
import Logo from "../Home/Logo.png";
import { useNavigate } from "react-router-dom";
import {
  IoChevronBackCircle,
  IoChevronBackCircleOutline,
  IoChevronForwardCircle,
} from "react-icons/io5";
import { fetchProfileInfo } from "../../Containers/ProfileSlice";
import { useDispatch, useSelector } from "react-redux";
import { GiTwoCoins } from "react-icons/gi";
import { Button, Modal } from "react-bootstrap";
import { FaRegHeart } from "react-icons/fa";
import { TbMessageCircle2 } from "react-icons/tb";
import { CiTimer } from "react-icons/ci";
import { togglePostLike } from "../../Containers/PostLikeSlice";
import { toggleReelLike } from "../../Containers/reelLikeSlice";
import { FaHeart } from "react-icons/fa";
import { updateLikeStatus } from "../../Containers/PostLikeSlice";
import { reelComment } from "../../Containers/reelCommentSlice";
import { postComment } from "../../Containers/PostCommentSlice";
import { HiOutlineFaceSmile } from "react-icons/hi2";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { IoSend } from "react-icons/io5";
import { FaCamera } from "react-icons/fa";
import { IoMdLogOut } from "react-icons/io";
import CreateNewPost from "../getFeeds/CreatePost";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchComments } from "../../Containers/GetCommentsSlice";
import { IoVolumeMute } from "react-icons/io5";
import { GoUnmute } from "react-icons/go";
import { FaPlay } from "react-icons/fa";

const Profile = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.ProfileReducer.userInfo);
  const posts = useSelector((state) => state.ProfileReducer.postInfo);
  const reelCommentCount = useSelector(
    (state) => state.reelCommentReducer.commentCount
  );
  const Comments = useSelector((state) => state.getCommentsReducer.comments);
  const dispatch = useDispatch();

  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [stream, setStream] = useState(null);
  const [isCameraOpened, setCameraOpened] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [selectedFileA, setSelectedFileA] = useState(null);
  const [selectedFileB, setSelectedFileB] = useState(null);
  const [fileOption, setFileOption] = useState(1);
  const [fileBVisible, setFileBVisible] = useState(false);
  const [fileBButtonClicked, setFileBButtonClicked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const videoRef = React.useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")) : null;
    const profile_id = userData ? userData.user.userid : null;

    if (profile_id) {
      console.log(profile_id)
      dispatch(fetchProfileInfo(profile_id));
    }
  }, [dispatch]);


  useEffect(() => {
    if (showModal && selectedPost && selectedPost.comment_count > 0) {
      const postId = selectedPost.postid || selectedPost.reels_id;
      dispatch(fetchComments({ post_id: postId, offset: 0, limit: 100 }));
    }
  }, [showModal, dispatch, selectedPost]);

  useEffect(() => {
    const storedComments = JSON.parse(localStorage.getItem("comments"));
    if (storedComments) {
      setComments(storedComments);
    }
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    const storedLikedPosts = localStorage.getItem("likedPosts");
    if (storedLikedPosts) {
      setLikedPosts(JSON.parse(storedLikedPosts));
    }
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
  }, [likedPosts]);

  const handleMuteToggle = () => {
    setIsMuted((prevState) => !prevState);
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setShowOverlay(true);
      } else {
        videoRef.current.play();
        setShowOverlay(false);
      }
      setIsPlaying((prevState) => !prevState);
    }
  };

  const handlecaptureOpenModal = () => {
    setShowCaptureModal(true);
  };

  const handleCaptureCloseModal = () => {
    setShowCaptureModal(false);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraOpened(false);
    setCapturedPhoto(null);
    setSelectedFileA(null);
    setSelectedFileB(null);
    setFileOption(1);
  };

  const handleOpenCamera = async () => {
    try {
      if (isCameraOpened) {
        handleCloseCamera();
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      setCameraOpened(true);
      setCapturedPhoto(null);

      const cameraElement = document.getElementById("cameraPreview");
      if (cameraElement) {
        cameraElement.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const handleChooseFile = (event) => {
    const file = event.target.files[0];
    if (fileOption === 1) {
      setSelectedFileA(file);
      setFileOption(2);
    } else if (fileOption === 2) {
      setSelectedFileB(file);
    }
    if (isCameraOpened) {
      handleCloseCamera();
    }
  };

  const handleCloseCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraOpened(false);
  };

  const handleCameraCloseMod = () => {
    setCameraOpened(false);
    const cameraElement = document.getElementById("cameraPreview");
    if (cameraElement && cameraElement.srcObject) {
      const tracks = cameraElement.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      cameraElement.srcObject = null;
    }
  };

  const handleCreatePostClick = () => {
    handlecaptureOpenModal();
  };

  const handleCapturePhoto = () => {
    if (!isCameraOpened) {
      return;
    }

    const imageElement = document.getElementById("cameraPreview");
    console.log("Video Element:", imageElement);

    const canvas = document.createElement("canvas");
    canvas.width = imageElement.videoWidth;
    canvas.height = imageElement.videoHeight;
    console.log("Canvas Dimensions:", canvas.width, "x", canvas.height);

    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    const photoData = canvas.toDataURL("image/jpeg");
    console.log("Captured Photo Data:", photoData);

    setCapturedPhoto(photoData);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraOpened(false);
  };

  const handleLogout = () => {
    confirmAlert({
      title: "Confirm Logout",
      message: "Are you sure you want to log out?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            toast.success("Logged out", {
              position: "top-center",
              autoClose: 2000,
            });
            setTimeout(() => {
              navigate("/login");
            }, 2500);
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    handleOpenCamera();
  };

  const handleShowFileB = () => {
    setFileBVisible(true);
    setFileBButtonClicked(true);
    setSelectedFileA(false);
  };

  const calculateTimeDifference = (timestamp) => {
    const postDate = new Date(parseInt(timestamp));
    const currentDate = new Date();
    const differenceInMilliseconds = currentDate - postDate;

    if (differenceInMilliseconds < 60000) {
      return "Just now";
    }

    const seconds = Math.floor(differenceInMilliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) {
      return `${years} year${years > 1 ? "s" : ""} ago`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
    }
  };

  const handleLike = (postId, isLiked, feedType) => {
    const updatedLikedPosts = { ...likedPosts, [postId]: !isLiked };
    setLikedPosts(updatedLikedPosts);

    if (feedType === "POST") {
      dispatch(togglePostLike({ LikeId: postId, reactionId: isLiked ? 0 : 1 }))
        .then((response) => {
          const { like_count } = response;
          dispatch(
            updateLikeStatus({
              postId,
              likeStatus: !isLiked,
              likeCount: like_count,
              feedType,
            })
          );
        })
        .catch((error) => {
          console.error("Error toggling like:", error);
          setLikedPosts((prevLikedPosts) => ({
            ...prevLikedPosts,
            [postId]: isLiked,
          }));
        });
    } else if (feedType === "REEL") {
      dispatch(toggleReelLike({ reelId: postId, reactionId: isLiked ? 0 : 1 }))
        .then((response) => {
          const { like_count } = response;
          dispatch(
            updateLikeStatus({
              postId,
              likeStatus: !isLiked,
              likeCount: like_count,
              feedType,
            })
          );
        })
        .catch((error) => {
          console.error("Error toggling reel like:", error);
          setLikedPosts((prevLikedPosts) => ({
            ...prevLikedPosts,
            [postId]: isLiked,
          }));
        });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPost(null);
    setCurrentMediaIndex(0);
    setCommentText("");
    setShowEmojiPicker(false);
    setActiveCommentBox(null);
    setHighlightedPostId(null);
    setComments([]);
  };

  const handlePostClick = (post, index) => {
    setSelectedPost(post);
    setShowModal(true);
    setCurrentMediaIndex(0);
  };

  const handleNextMedia = () => {
    if (
      selectedPost.post_file &&
      currentMediaIndex < JSON.parse(selectedPost.post_file).length - 1
    ) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentMediaIndex(currentMediaIndex + 1);
        setIsTransitioning(false);
      }, 500);
    }
  };

  const handlePreviousMedia = () => {
    if (currentMediaIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentMediaIndex(currentMediaIndex - 1);
        setIsTransitioning(false);
      }, 500);
    }
  };

  const handleBack = () => {
    navigate("/login-home");
  };

  const handleCommentClick = (postId) => {
    setActiveCommentBox((prevActiveCommentBox) =>
      prevActiveCommentBox === postId ? null : postId
    );
    setHighlightedPostId(postId);
    setShowEmojiPicker(false);
  };

  const handleEmojiSelect = (emojiObject) => {
    const currentPostId = highlightedPostId;
    if (emojiObject && currentPostId) {
      setCommentText((prevComment) => ({
        ...prevComment,
        [currentPostId]: prevComment[currentPostId]
          ? prevComment[currentPostId] + emojiObject.native
          : emojiObject.native,
      }));
    }
  };

  const handleInputChange = (postId, event) => {
    const { value } = event.target;
    setCommentText((prevComments) => ({
      ...prevComments,
      [postId]: value,
    }));
  };

  const handleCommentSubmit = () => {
    const postId = highlightedPostId;
    const comment = commentText[postId];
    const feed = posts.find(
      (feed) => feed.postid === postId || feed.reels_id === postId
    );

    if (!feed) {
      console.error("Feed not found for the given postId:", postId);
      return;
    }
    const feedType = feed.feed_type;

    if (feedType === "POST") {
      dispatch(postComment({ post_id: postId, text: comment }))
        .then((response) => {
          console.log("Comment response:", response);
          const { data } = response.payload;
          if (data && data.length > 0) {
            const { commentData, userInfo } = data[0];
            if (commentData && userInfo && userInfo.length > 0) {
              const newComment = {
                id: commentData[0].id,
                text: commentData[0].text,
                timestamp: commentData[0].timestamp,
                user: userInfo[0],
                post_id: postId,
              };

              setComments((prevComments) => [...prevComments, newComment]);
              setCommentText({ ...commentText, [postId]: "" });
            }
          } else {
            console.error("Error: No data returned in the response");
          }
        })
        .catch((error) => {
          console.error("Error posting comment:", error);
        });
    } else if (feedType === "REEL") {
      dispatch(reelComment({ reel_id: postId, text: comment }))
        .then((response) => {
          console.log("Comment response:", response);
          const { data } = response.payload;
          if (data && data.length > 0) {
            const { commentData, userInfo } = data[0];
            if (commentData && userInfo && userInfo.length > 0) {
              const newComment = {
                id: commentData[0].id,
                text: commentData[0].text,
                timestamp: commentData[0].timestamp,
                user: userInfo[0],
                reel_id: postId,
              };

              setComments((prevComments) => [...prevComments, newComment]);
              setCommentText({ ...commentText, [postId]: "" });
            }
          } else {
            console.error("Error: No data returned in the response");
          }
        })
        .catch((error) => {
          console.error("Error posting comment:", error);
        });
    } else {
      console.error("Invalid feed type:", feedType);
    }
  };

  const handleCommentUserProfileClick = (userId) => {
    navigate("/user-comment-profile", { state: { userId } });
  };

  return (
    <>
      <div>
        <div className="logo2" onClick={handleBack} title="Home">
          <img src={Logo} alt="logo" />
          <div id="text2">
            <h3 className="text2" id="header">
              TouchUi
            </h3>
          </div>
        </div>
        <div className="main-pvt-icons">
          <div
            className="cameras-icon"
            onClick={handleCreatePostClick}
            title="Create"
          >
            <FaCamera className="sidebar-icon" id="create1" />
          </div>
          <div
            className="logout-icon"
            id="log"
            onClick={handleLogout}
            title="Logout"
          >
            <IoMdLogOut className="sidebar-icon" id="Logout" />
          </div>
        </div>
      </div>
      <ToastContainer />

      <Modal
        id="profile-cam-modal"
        show={showCaptureModal}
        onHide={handleCaptureCloseModal}
        className="modal"
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title id="cam-title" className="modal-title">
            Create Post
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          {capturedPhoto ? (
            <div>
              <img
                src={capturedPhoto}
                alt="Captured"
                className="captured-image"
              />
            </div>
          ) : (
            <div>
              <video
                id="cameraPreview"
                autoPlay
                playsInline
                className="camera-preview"
              ></video>
              {!isCameraOpened && (
                <button onClick={handleOpenCamera}>
                  <FaCamera className="camera-icon" /> Open Camera
                </button>
              )}
              {isCameraOpened && (
                <div className="camera-options">
                  <div className="camera-buttons-container">
                    <button onClick={handleCapturePhoto}>
                      <FaCamera className="camera-icon" /> Capture Photo
                    </button>
                    <button onClick={handleCameraCloseMod}>Close Camera</button>
                  </div>
                </div>
              )}
              {(fileOption === 1 || selectedFileA) && (
                <div className="choose-file-container">
                  <input
                    id="fileA"
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/svg+xml, image/webp"
                    onChange={handleChooseFile}
                  />
                  {selectedFileA &&
                    (fileBButtonClicked ? null : (
                      <button className="addMore" onClick={handleShowFileB}>
                        {" "}
                        +1 More File{" "}
                      </button>
                    ))}
                </div>
              )}
              {fileOption === 2 && fileBVisible && (
                <div className="choose-file-container">
                  <input
                    id="fileB"
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/svg+xml, image/webp"
                    onChange={handleChooseFile}
                  />
                </div>
              )}
            </div>
          )}
          <CreateNewPost
            capturedPhoto={capturedPhoto}
            selectedFileA={selectedFileA}
            selectedFileB={selectedFileB}
            onCapturePhoto={handleCapturePhoto}
            onChooseFile={handleChooseFile}
          />
        </Modal.Body>

        <Modal.Footer className="modal-footer">
          {capturedPhoto && (
            <Button id="b3" onClick={handleRetake}>
              Retake
            </Button>
          )}

          <Button id="b1" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="cards">
        <div className="content">
          <div className="back">
            <div className="back-content">
              <svg
                stroke="#ffffff"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
                height="50px"
                width="50px"
                fill="#ffffff"
              ></svg>

              <img
                src={user?.profile_pic}
                alt={user?.username}
                id="cardProfile"
              />
              <h4 className="un">
                <span id="@">@</span>
                {user?.username}
              </h4>
              <p className="n">
                {user?.first_name} {user?.last_name}
              </p>
              <p id="bio">{user?.bio}</p>
              <div className="coinicon">
                <GiTwoCoins className="coinsone" />
                <p className="pointsone">{user?.points}</p>
              </div>
              <p className="accountType">Account Type: {user?.account_type}</p>
            </div>
          </div>

          <div className="front">
            <div className="back-button">
              <IoChevronBackCircleOutline id="back" onClick={handleBack} />
            </div>
            <div className="img">
              <div className="circle"></div>
              <div className="circle" id="right"></div>
              <div className="circle" id="bottom"></div>
            </div>
            <div className="front-content">
              <small className="badge">Profile Info</small>
              <div className="description">
                <div className="title">
                  <p className="titles">
                    <b>
                      {user?.email}
                      {user?.mobile}
                    </b>
                  </p>
                  <p className="titles">
                    <b>dob : {user?.dob}</b>
                  </p>
                  <p className="titles">
                    <b>gender : {user?.gender}</b>
                  </p>
                  <svg
                    fillRule="nonzero"
                    height="15px"
                    width="15px"
                    viewBox="0,0,256,256"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    xmlns="http://www.w3.org/2000/svg"
                  ></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="post-grid">
        {posts && posts.map((post, index) => {
          const postFiles = JSON.parse(post.post_file);
          const isMultipleFiles = postFiles.length > 1;

          if (post.feed_type === "POST" && post.post_type === "image") {
            return (
              <div
                key={index}
                className={`post-item ${
                  highlightedPostId === post.postid ||
                  highlightedPostId === post.reels_id
                    ? "highlighted"
                    : ""
                }`}
                onClick={() => handlePostClick(post)}
              >
                {post.post_file && post.post_file.length > 0 && (
                  <img
                    src={JSON.parse(post.post_file)[0].path}
                    alt={post.postid}
                    className="post-image"
                  />
                )}
                {isMultipleFiles && (
                  <div className="multiple-files-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 64 64"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M50 5.5H5.5V50H50V5.5Z"
                        fill="rgb(236, 233, 233)"
                      ></path>
                      <path
                        d="M53 13.99V53H14.01V58.5H58.5V13.99H53Z"
                        fill="rgb(236, 233, 233)"
                      ></path>
                    </svg>
                  </div>
                )}
              </div>
            );
          }

          if (
            (post.feed_type === "POST" && post.post_type === "video") ||
            post.feed_type === "REEL"
          ) {
            return (
              <div
                key={index}
                className="post-item"
                onClick={() => handlePostClick(post)}
              >
                {post.post_file && post.post_file.length > 0 && (
                  <video
                    src={JSON.parse(post.post_file)[0].path}
                    className="post-video"
                  ></video>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  style={{ fill: "#FFFFFF" }}
                  className="post-svg"
                >
                  <path d="M13.34 4.13L20.26 16H4v-1C4 9.48 8.05 4.92 13.34 4.13z" />
                  <path d="M33.26 16L22.57 16 15.57 4 26.26 4zM46 15v1H35.57l-7-12H35.26C41.08 4 46 8.92 46 15zM4 18v17c0 6.08 4.92 11 11 11h20c6.08 0 11-4.92 11-11V18H4zM31 32.19l-7.99 4.54C21.68 37.49 20 36.55 20 35.04v-9.08c0-1.51 1.68-2.45 3.01-1.69L31 28.81C32.33 29.56 32.33 31.44 31 32.19z" />
                </svg>
              </div>
            );
          }

          return null;
        })}
      </div>

      <div className="modalFlow">
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          size="lg"
          id="modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedPost ? selectedPost.title : "Loading..."}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedPost ? (
              <div className="modal-grid">
                <div
                  className={`modal-left ${
                    isTransitioning ? "modal-image-transition" : ""
                  }`}
                >
                  {" "}
                  {selectedPost.post_type === "image" ? (
                    <img
                      src={
                        JSON.parse(selectedPost.post_file)[currentMediaIndex]
                          .path
                      }
                      alt={selectedPost.postid}
                      className="media-modal"
                    />
                  ) : selectedPost.post_type === "video" ? (
                    <div className="video-container">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted={!isMuted}
                        onClick={handleVideoClick}
                        loop
                        src={
                          JSON.parse(selectedPost.post_file)[currentMediaIndex]
                            .path
                        }
                        className="video-media-modal"
                      />
                      {showOverlay && (
                        <div
                          className="profile-video-overlay"
                          onClick={handleVideoClick}
                        >
                          <FaPlay />
                        </div>
                      )}

                      <div className="video-controls">
                        <div
                          className="profile-mute-toggle"
                          onClick={handleMuteToggle}
                        >
                          {!isMuted ? <IoVolumeMute /> : <GoUnmute />}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                {selectedPost.post_file.length > 1 ? (
                  <div className="navigation-buttons">
                    {currentMediaIndex > 0 && (
                      <IoChevronBackCircle
                        onClick={handlePreviousMedia}
                        size={30}
                        className="modal-previous"
                      />
                    )}
                    {currentMediaIndex <
                      JSON.parse(selectedPost.post_file).length - 1 && (
                      <IoChevronForwardCircle
                        onClick={handleNextMedia}
                        size={30}
                        className="modal-next"
                      />
                    )}
                  </div>
                ) : (
                  ""
                )}
                <div className="modal-right">
                  {selectedPost?.caption || selectedPost?.description ? (
                    <div
                      className={
                        selectedPost?.comment_count === 0
                          ? "modal-profile-infos"
                          : "modal-profile-info"
                      }
                      id={
                        selectedPost?.post_file > 1
                          ? "modal-profile-multiple"
                          : "modal-profile-single"
                      }
                    >
                      <img
                        src={selectedPost?.profile_pic || ""}
                        alt={selectedPost?.username || ""}
                        className="modal-profile-pic"
                      />
                      <p className="modal-profile-username">
                        {selectedPost?.username || "Unknown User"}
                      </p>
                    </div>
                  ) : (
                    <div
                      className={
                        selectedPost?.comment_count === 0
                          ? "modal-profile-right"
                          : "modal-profile-ryt"
                      }
                    >
                      <img
                        src={selectedPost?.profile_pic || ""}
                        alt={selectedPost?.username || ""}
                        className="modal-profile-pic"
                      />
                      <p className="modal-profile-username">
                        {selectedPost?.username || "Unknown User"}
                      </p>
                    </div>
                  )}

                  <div className="modal-additional-info">
                    <div
                      className={
                        selectedPost?.comment_count > 0
                          ? "scrollable"
                          : "unscrollable"
                      }
                      id={
                        selectedPost.caption || selectedPost.description
                          ? "cap-scroll"
                          : "uncap-scroll"
                      }
                    >
                      <div
                        className={
                          selectedPost?.comment_count > 0
                            ? "Under-more"
                            : "Under-one"
                        }
                        id={
                          selectedPost.caption.length < 10
                            ? "cap-block-low"
                            : "cap-block-high"
                        }
                      >
                        {selectedPost?.caption || selectedPost?.description ? (
                          <>
                            <img
                              src={selectedPost?.profile_pic || ""}
                              alt={selectedPost?.username || ""}
                              className="caption-profile"
                            />
                            <p className="caption-profile-username">
                              {selectedPost?.username || "Unknown User"}
                            </p>
                          </>
                        ) : null}
                        {selectedPost?.caption && (
                          <p
                            id={
                              selectedPost.caption.length < 10
                                ? "caption"
                                : "caption-block-line"
                            }
                            className="caption"
                          >
                            {selectedPost.caption}
                          </p>
                        )}
                        {selectedPost?.description && (
                          <p
                            id={
                              selectedPost.description.length < 10
                                ? "description-one"
                                : "description-one-block-line"
                            }
                            className="description-one"
                          >
                            {selectedPost.description}
                          </p>
                        )}
                      </div>

                      {selectedPost?.comment_count > 0 ? (
                        <div
                          className={
                            selectedPost?.caption || selectedPost?.description
                              ? "comments-section"
                              : "comment-section"
                          }
                          id={
                            selectedPost.caption.length < 10
                              ? "caption-commSec-no"
                              : "caption-commSec-block-line-no"
                          }
                        >
                          {Comments &&
                            Comments.map((comment, index) => (
                              <div key={index}>
                                <div
                                  className="user-comment"
                                  id={
                                    JSON.parse(selectedPost?.post_file).length >
                                    1
                                      ? "more-file"
                                      : "singlefile"
                                  }
                                >
                                  <div className="user-info">
                                    <div className="comment-user-profile">
                                      <img
                                        className="comment-profile-user"
                                        src={comment.comment.profile_pic}
                                        alt="Profile"
                                        onClick={() =>
                                          handleCommentUserProfileClick(
                                            comment.comment.user_id ||
                                              comment.comment.userid
                                          )
                                        }
                                      />
                                      <div className="user-details">
                                        <p className="comment-username-user">
                                          {comment.comment.username}
                                        </p>
                                      </div>
                                      <div className="text-sec">
                                        <p className="comment-text-user">
                                          {comment.comment.comment}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="time-sec">
                                  <p className="comment-timestamp-user">
                                    {calculateTimeDifference(
                                      comment.comment.timestamp
                                    )}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="caption-comment">
                          {selectedPost?.caption ||
                          selectedPost?.description ? (
                            <div
                              id={
                                JSON.parse(selectedPost?.post_file).length > 1
                                  ? "more-files"
                                  : "singlefiles"
                              }
                            >
                              <div
                                className="no-comment-provider"
                                id={
                                  selectedPost.caption.length < 10
                                    ? "caption-no"
                                    : "caption-block-line-no"
                                }
                              >
                                {selectedPost?.comment_count === 0 && (
                                  <div className="no-comment-yet">
                                    <i
                                      id="fi"
                                      className="fi fi-rr-bookmark"
                                    ></i>
                                    <h3 className="no-comment">
                                      No comments yet
                                    </h3>
                                    <p className="para-no-comment">
                                      Start the Conversation
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div
                              id={
                                JSON.parse(selectedPost?.post_file).length > 1
                                  ? "more-filer"
                                  : "singlefiler"
                              }
                            >
                              <div className="no-comment-providers">
                                {selectedPost?.comment_count === 0 && (
                                  <div className="no-comment-yet">
                                    <i
                                      id="fi"
                                      className="fi fi-rr-bookmark"
                                    ></i>
                                    <h3 className="no-comment">
                                      No comments yet
                                    </h3>
                                    <p className="para-no-comment">
                                      Start the Conversation
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {selectedPost.caption.length < 10 ? (
                      <div className="cap-no-len">
                        {selectedPost?.caption || selectedPost?.description ? (
                          <div
                            className={
                              selectedPost?.comment_count === 0
                                ? "post-counters"
                                : "post-counters-with-comments"
                            }
                            id={
                              JSON.parse(selectedPost?.post_file).length > 1
                                ? "post-counters-multiple"
                                : "post-counters-single"
                            }
                          >
                            <div className="like-counter">
                              <p className="count-like-red">
                                {selectedPost?.like_count || 0}
                              </p>
                              {selectedPost?.like_count !== null && (
                                <p
                                  className={
                                    selectedPost?.feed_type === "POST"
                                      ? "like-count"
                                      : "like-count-reel"
                                  }
                                  onClick={() =>
                                    handleLike(
                                      selectedPost?.postid ||
                                        selectedPost?.reels_id,
                                      likedPosts[
                                        selectedPost?.postid ||
                                          selectedPost?.reels_id
                                      ],
                                      selectedPost?.feed_type
                                    )
                                  }
                                >
                                  {likedPosts[
                                    selectedPost?.postid ||
                                      selectedPost?.reels_id
                                  ] ? (
                                    <FaHeart className="like" color="red" />
                                  ) : (
                                    <FaRegHeart className="like" />
                                  )}
                                </p>
                              )}
                            </div>
                            <div className="comment-counter">
                              {selectedPost?.feed_type === "reel" ? (
                                <p className="count-like-red">
                                  {reelCommentCount}
                                </p>
                              ) : (
                                <p className="count-like-red">
                                  {selectedPost?.comment_count || 0}
                                </p>
                              )}

                              <TbMessageCircle2
                                className="comment"
                                onClick={() =>
                                  handleCommentClick(
                                    selectedPost?.feed_type === "POST"
                                      ? selectedPost?.postid
                                      : selectedPost?.reels_id
                                  )
                                }
                              />
                              <div className="post-timer">
                                {selectedPost?.feed_type === "REEL" && (
                                  <p className="reel-time" id="reel-time">
                                    {calculateTimeDifference(
                                      selectedPost?.timestamp
                                    )}{" "}
                                    <CiTimer id="reel-timer" />
                                  </p>
                                )}
                                {selectedPost?.feed_type === "POST" && (
                                  <p className="post-time" id="post-time">
                                    {calculateTimeDifference(
                                      selectedPost?.created_timestamp
                                    )}{" "}
                                    <CiTimer id="post-timer" />
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={
                              selectedPost?.comment_count === 0
                                ? "post-counter"
                                : "post-counter-with-comments"
                            }
                            id={
                              JSON.parse(selectedPost?.post_file).length > 1
                                ? "post-counters-muliple-with-comments"
                                : "post-counters-single-with-comments"
                            }
                          >
                            <div className="like-counter">
                              <p className="count-like-red">
                                {selectedPost?.like_count || 0}
                              </p>
                              {selectedPost?.like_count !== null && (
                                <p
                                  className={
                                    selectedPost?.feed_type === "POST"
                                      ? "like-count"
                                      : "like-count-reel"
                                  }
                                  onClick={() =>
                                    handleLike(
                                      selectedPost?.postid ||
                                        selectedPost?.reels_id,
                                      likedPosts[
                                        selectedPost?.postid ||
                                          selectedPost?.reels_id
                                      ],
                                      selectedPost?.feed_type
                                    )
                                  }
                                >
                                  {likedPosts[
                                    selectedPost?.postid ||
                                      selectedPost?.reels_id
                                  ] ? (
                                    <FaHeart className="like" color="red" />
                                  ) : (
                                    <FaRegHeart className="like" />
                                  )}
                                </p>
                              )}
                            </div>
                            <div className="comment-counter">
                              {selectedPost?.feed_type === "reel" ? (
                                <p className="count-like-red">
                                  {reelCommentCount}
                                </p>
                              ) : (
                                <p className="count-like-red">
                                  {selectedPost?.comment_count || 0}
                                </p>
                              )}

                              <TbMessageCircle2
                                className="comment"
                                onClick={() =>
                                  handleCommentClick(
                                    selectedPost?.feed_type === "POST"
                                      ? selectedPost?.postid
                                      : selectedPost?.reels_id
                                  )
                                }
                              />
                              <div className="post-timer">
                                {selectedPost?.feed_type === "REEL" && (
                                  <p className="reel-time" id="reel-time">
                                    {calculateTimeDifference(
                                      selectedPost?.timestamp
                                    )}{" "}
                                    <CiTimer id="reel-timer" />
                                  </p>
                                )}
                                {selectedPost?.feed_type === "POST" && (
                                  <p className="post-time" id="post-time">
                                    {calculateTimeDifference(
                                      selectedPost?.created_timestamp
                                    )}{" "}
                                    <CiTimer id="post-timer" />
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="cap-len">
                        {selectedPost?.caption || selectedPost?.description ? (
                          <div
                            className={
                              selectedPost?.comment_count === 0
                                ? "post-counters"
                                : "post-counters-with-comments"
                            }
                            id={
                              JSON.parse(selectedPost?.post_file).length > 1
                                ? "post-counters-multiple"
                                : "post-counters-single"
                            }
                          >
                            <div className="like-counter">
                              <p className="count-like-red">
                                {selectedPost?.like_count || 0}
                              </p>
                              {selectedPost?.like_count !== null && (
                                <p
                                  className={
                                    selectedPost?.feed_type === "POST"
                                      ? "like-count"
                                      : "like-count-reel"
                                  }
                                  onClick={() =>
                                    handleLike(
                                      selectedPost?.postid ||
                                        selectedPost?.reels_id,
                                      likedPosts[
                                        selectedPost?.postid ||
                                          selectedPost?.reels_id
                                      ],
                                      selectedPost?.feed_type
                                    )
                                  }
                                >
                                  {likedPosts[
                                    selectedPost?.postid ||
                                      selectedPost?.reels_id
                                  ] ? (
                                    <FaHeart className="like" color="red" />
                                  ) : (
                                    <FaRegHeart className="like" />
                                  )}
                                </p>
                              )}
                            </div>
                            <div className="comment-counter">
                              {selectedPost?.feed_type === "reel" ? (
                                <p className="count-like-red">
                                  {reelCommentCount}
                                </p>
                              ) : (
                                <p className="count-like-red">
                                  {selectedPost?.comment_count || 0}
                                </p>
                              )}

                              <TbMessageCircle2
                                className="comment"
                                onClick={() =>
                                  handleCommentClick(
                                    selectedPost?.feed_type === "POST"
                                      ? selectedPost?.postid
                                      : selectedPost?.reels_id
                                  )
                                }
                              />
                              <div className="post-timer">
                                {selectedPost?.feed_type === "REEL" && (
                                  <p className="reel-time" id="reel-time">
                                    {calculateTimeDifference(
                                      selectedPost?.timestamp
                                    )}{" "}
                                    <CiTimer id="reel-timer" />
                                  </p>
                                )}
                                {selectedPost?.feed_type === "POST" && (
                                  <p className="post-time" id="post-time">
                                    {calculateTimeDifference(
                                      selectedPost?.created_timestamp
                                    )}{" "}
                                    <CiTimer id="post-timer" />
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={
                              selectedPost?.comment_count === 0
                                ? "post-counter"
                                : "post-counter-with-comments"
                            }
                            id={
                              JSON.parse(selectedPost?.post_file).length > 1
                                ? "post-counters-muliple-with-comments"
                                : "post-counters-single-with-comments"
                            }
                          >
                            <div className="like-counter">
                              <p className="count-like-red">
                                {selectedPost?.like_count || 0}
                              </p>
                              {selectedPost?.like_count !== null && (
                                <p
                                  className={
                                    selectedPost?.feed_type === "POST"
                                      ? "like-count"
                                      : "like-count-reel"
                                  }
                                  onClick={() =>
                                    handleLike(
                                      selectedPost?.postid ||
                                        selectedPost?.reels_id,
                                      likedPosts[
                                        selectedPost?.postid ||
                                          selectedPost?.reels_id
                                      ],
                                      selectedPost?.feed_type
                                    )
                                  }
                                >
                                  {likedPosts[
                                    selectedPost?.postid ||
                                      selectedPost?.reels_id
                                  ] ? (
                                    <FaHeart className="like" color="red" />
                                  ) : (
                                    <FaRegHeart className="like" />
                                  )}
                                </p>
                              )}
                            </div>
                            <div className="comment-counter">
                              {selectedPost?.feed_type === "reel" ? (
                                <p className="count-like-red">
                                  {reelCommentCount}
                                </p>
                              ) : (
                                <p className="count-like-red">
                                  {selectedPost?.comment_count || 0}
                                </p>
                              )}

                              <TbMessageCircle2
                                className="comment"
                                onClick={() =>
                                  handleCommentClick(
                                    selectedPost?.feed_type === "POST"
                                      ? selectedPost?.postid
                                      : selectedPost?.reels_id
                                  )
                                }
                              />
                              <div className="post-timer">
                                {selectedPost?.feed_type === "REEL" && (
                                  <p className="reel-time" id="reel-time">
                                    {calculateTimeDifference(
                                      selectedPost?.timestamp
                                    )}{" "}
                                    <CiTimer id="reel-timer" />
                                  </p>
                                )}
                                {selectedPost?.feed_type === "POST" && (
                                  <p className="post-time" id="post-time">
                                    {calculateTimeDifference(
                                      selectedPost?.created_timestamp
                                    )}{" "}
                                    <CiTimer id="post-timer" />
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              "No post selected"
            )}
            {activeCommentBox ===
              (selectedPost?.postid || selectedPost?.reels_id) && (
              <div className="highlight-background">
                {selectedPost.caption.length < 10 ? (
                  <div className="cap-count-more">
                    <textarea
                      className={
                        selectedPost?.comment_count > 0
                          ? "have-comment-box"
                          : "no-comment-box"
                      }
                      id={
                        selectedPost?.caption || selectedPost?.description
                          ? "comment-inputs"
                          : "comment-input"
                      }
                      placeholder="Write your comment..."
                      value={
                        commentText[
                          selectedPost?.postid || selectedPost?.reels_id
                        ] || ""
                      }
                      onChange={(event) =>
                        handleInputChange(
                          selectedPost?.postid || selectedPost?.reels_id,
                          event
                        )
                      }
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          handleCommentSubmit();
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="cap-count-small">
                    <textarea
                      className={
                        selectedPost?.comment_count > 0
                          ? "have-comment-box"
                          : "no-comment-box"
                      }
                      id={
                        selectedPost?.caption || selectedPost?.description
                          ? "comment-inputs"
                          : "comment-input"
                      }
                      placeholder="Write your comment..."
                      value={
                        commentText[
                          selectedPost?.postid || selectedPost?.reels_id
                        ] || ""
                      }
                      onChange={(event) =>
                        handleInputChange(
                          selectedPost?.postid || selectedPost?.reels_id,
                          event
                        )
                      }
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          handleCommentSubmit();
                        }
                      }}
                    />
                  </div>
                )}

                {commentText && (
                  <Button
                    id="submit-comment"
                    className="comment-submit-btn"
                    onClick={handleCommentSubmit}
                  >
                    <IoSend />
                  </Button>
                )}
                <div
                  className={`smile-container ${
                    selectedPost?.feed_type === "REEL"
                      ? "reel-smiles"
                      : selectedPost.feed_type === "POST"
                      ? "post-smiles"
                      : "create-post-smiles"
                  }`}
                >
                  {JSON.parse(selectedPost?.post_file).length > 1 ? (
                    <div
                      className="more-cap-len-one"
                      id={
                        selectedPost.caption.length < 10
                          ? "smile-mark-cap"
                          : "smile-no-mark-cap"
                      }
                    >
                      <div
                        id="smiler"
                        className={
                          selectedPost.caption.length < 10
                            ? "smile-cap"
                            : "smile-no-cap"
                        }
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <HiOutlineFaceSmile />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="more-cap-len-zero"
                      id={
                        selectedPost.caption.length < 10
                          ? "smile-id-mark-cap"
                          : "smile-id-no-mark-cap"
                      }
                    >
                      <div
                        id="smiler"
                        className={
                          selectedPost.caption.length < 10
                            ? "smile-cap"
                            : "smile-no-cap"
                        }
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <HiOutlineFaceSmile />
                      </div>
                    </div>
                  )}
                </div>

                {showEmojiPicker && (
                  <div
                    className="emoji-picker-container"
                    id="emoji-picker-container"
                  >
                    <Picker
                      data={data}
                      theme="dark"
                      navPosition="bottom"
                      skinTonePosition="search"
                      previewPosition="none"
                      onEmojiSelect={(emojiObject) =>
                        handleEmojiSelect(emojiObject)
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default Profile;
