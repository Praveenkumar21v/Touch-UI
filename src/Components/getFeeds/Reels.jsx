import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { fetchFeeds } from "../../Containers/GetFeedsSlice";
import "./getfeeds.css";
import { FaRegHeart, FaEye, FaUserFriends } from "react-icons/fa";
import { TbMessageCircle2 } from "react-icons/tb";
import { CiTimer } from "react-icons/ci";
import Logo from "../Home/Logo.png";
import { Modal, Button } from "react-bootstrap";
import { HiHome } from "react-icons/hi";
import { PiMonitorPlayFill } from "react-icons/pi";
import { FaCamera } from "react-icons/fa";
import { Offcanvas } from "react-bootstrap";
import { Navbar } from "react-bootstrap";
import { IoMdLogOut } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { IoVolumeMute } from "react-icons/io5";
import { GoUnmute } from "react-icons/go";
import { toggleReelLike } from "../../Containers/reelLikeSlice";
import { IoSend } from "react-icons/io5";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { HiOutlineFaceSmile } from "react-icons/hi2";
import { reelComment } from "../../Containers/reelCommentSlice";
import { FaHeart } from "react-icons/fa";
import { updateLikeStatus } from "../../Containers/PostLikeSlice";
import CreateNewPost from "../getFeeds/CreatePost";
import { fetchComments } from "../../Containers/GetCommentsSlice";
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css'; 
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Reels = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {data: feedData = [],loading,error,} = useSelector((state) => state.getFeedsReducer || {}, shallowEqual);
  const reelCommentCount = useSelector((state) => state.reelCommentReducer.commentCount);
  const Comments = useSelector((state) => state.getCommentsReducer.comments);

  const [discoverReels, setDiscoverReels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [stream, setStream] = useState(null);
  const [isCameraOpened, setCameraOpened] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [selectedFileA, setSelectedFileA] = useState(null);
  const [selectedFileB, setSelectedFileB] = useState(null);
  const [fileOption, setFileOption] = useState(1);
  const [fileBVisible, setFileBVisible] = useState(false);
  const [fileBButtonClicked, setFileBButtonClicked] = useState(false);
  const videoRefs = useRef([]);
  const [isMuted, setIsMuted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [likedPosts, setLikedPosts] = useState({});
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (showCommentModal && selectedPost && selectedPost.comment_count > 0) {
      const reelId = selectedPost.id;
      console.log(reelId);
      dispatch(fetchComments({ post_id: reelId, offset: 0, limit: 100 }))
    }
  }, [showCommentModal, dispatch, selectedPost]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      setUser(userData.user);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchFeeds({ offset: 0, limit: 0 }));
    const storedLikedPosts = localStorage.getItem("likedPosts");
    if (storedLikedPosts) {
      setLikedPosts(JSON.parse(storedLikedPosts));
    }
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
  }, [likedPosts]);

  useEffect(() => {
    const discoverReelsData = feedData.find(
      (item) => item.feed_type === "discover"
    );
    if (discoverReelsData) {
      setDiscoverReels(discoverReelsData.discover_reels || []);
    }
  }, [feedData]);

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
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observer = new IntersectionObserver(handleIntersection, options);

    videoRefs.current.forEach((video) => {
      observer.observe(video);
    });

    return () => {
      observer.disconnect();
    };
  }, [discoverReels]);

  const handleIntersection = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const currentVideo = entry.target;
        const hasBeenPlayed = currentVideo.dataset.played === "true";
        const wasMuted = currentVideo.dataset.muted === "true";

        if (!hasBeenPlayed || wasMuted) {
          currentVideo.play();
          currentVideo.dataset.played = true;
        }

        videoRefs.current.forEach((video) => {
          if (video !== currentVideo && !video.paused) {
            video.pause();
          }
        });
      } else {
        entry.target.pause();
      }
    });
  };

  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true);
      document.removeEventListener("click", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
    };
  }, []);

  const handleMute = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      video.muted = !video.muted;
      video.dataset.muted = video.muted;
      setIsMuted(!isMuted);
      const updatedVideoRefs = [...videoRefs.current];
      updatedVideoRefs[index] = video;
      videoRefs.current = updatedVideoRefs;
    }
  };

  const handlePlayVideo = (index) => {
    if (!userInteracted) {
      pauseOtherVideos(index);
    }
    const video = videoRefs.current[index];
    if (video && video.paused) {
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {})
            .catch((error) => {
              console.error("Error playing video:", error);
              if (
                error.name === "NotAllowedError" ||
                error.name === "NotSupportedError"
              ) {
                console.log("Autoplay not allowed or not supported");
              }
            });
        }
      } catch (error) {
        console.error("Error playing video:", error);
      }
    }
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

  const pauseOtherVideos = (index) => {
    videoRefs.current.forEach((videoRef, i) => {
      if (i !== index && !videoRef.paused) {
        videoRef.pause();
      }
    });
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
    if (fileOption !== 1) {
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      setCameraOpened(true);
      setCapturedPhoto(null);

      const videoElement = document.getElementById("cameraPreview");
      if (videoElement) {
        videoElement.srcObject = mediaStream;
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
    handleOpenModal();
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

  const handleRetake = () => {
    setCapturedPhoto(null);
    handleOpenCamera();
  };

  const handleShowFileB = () => {
    setFileBVisible(true);
    setFileBButtonClicked(true);
    setSelectedFileA(false);
  };


  const handleLogout = () => {
    confirmAlert({
      title: "Confirm Logout",
      message: "Are you sure you want to log out?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            toast.success("Logged out", { position: "top-center", autoClose: 2000 });
            setTimeout(() => {
              navigate("/login");
            }, 2500);          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleReelClick = () => {
    navigate("/reels");
  };

  const handlehomeClick = () => {
    navigate("/login-home");
  };

  const handleVideoLoad = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      video.autoplay = false;
    }
  };

  const handleUserProfileClick = (userId) => {
    console.log(userId);
    navigate("/reel-user-profile", { state: { userId } });
  };

  const handleLike = (reelId, isLiked, feedType) => {
    console.log("Liked post reels_id:", reelId);
    const updatedLikedPosts = { ...likedPosts, [reelId]: !isLiked };
    setLikedPosts(updatedLikedPosts);

    dispatch(toggleReelLike({ reelId: reelId, reactionId: isLiked ? 0 : 1 }))
      .then((response) => {
        const { like_count } = response;
        dispatch(
          updateLikeStatus({
            reelId,
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
          [reelId]: isLiked,
        }));
      });
  };

  const handleCommentClick = (reelId) => {
    setActiveCommentBox((prevActiveCommentBox) =>
      prevActiveCommentBox === reelId ? null : reelId
    );
    setHighlightedPostId(reelId);
    setShowEmojiPicker(false);

  };

  const handleEmojiSelect = (emojiObject) => {
    const currentPostId = highlightedPostId;
    if (emojiObject && currentPostId) {
      setCommentText((prevComment) => ({
        ...prevComment,
        [currentPostId]: prevComment[currentPostId] ? prevComment[currentPostId] + emojiObject.native : emojiObject.native,
      }));
    }
  };

  const handleInputChange = (reelId, event) => {
    const { value } = event.target;
    setCommentText((prevComments) => ({
      ...prevComments,
      [reelId]: value,
    }));
  };

  const handleShowComments = (reel) => {
    setSelectedPost(reel);
    setShowCommentModal(true);
    setActiveCommentBox(reel.reels_id);
  };

  const handleCommentSubmit = () => {
    const reelId = highlightedPostId;
    const comment = commentText[reelId];

    dispatch(reelComment({ reel_id: reelId, text: comment }))
      .then((response) => {
        console.log("Comment response:", response);
        const { data } = response.payload;
        if (data && data.length > 0) {
          const { commentData, userInfo, comment_count } = data[0];
          if (commentData && userInfo && userInfo.length > 0) {
            const newComment = {
              id: commentData[0].id,
              text: commentData[0].text,
              timestamp: commentData[0].timestamp,
              user: userInfo[0],
              reel_id: reelId,
            };

            setComments((prevComments) => [...prevComments, newComment]);
            setCommentText({ ...commentText, [reelId]: "" });
            setSelectedPost((prevSelectedPost) => ({
              ...prevSelectedPost,
              comment_count,
            }));
          }
        } else {
          console.error("Error: No data returned in the response");
        }
      })
      .catch((error) => {
        console.error("Error posting comment:", error);
      });
  };

  const handleCommentCloseModal = () => {
    setShowCommentModal(false);
    setSelectedPost(null);
    setCommentText("");
    setActiveCommentBox(null);
  };


  const handleCommentUserProfileClick = (userId) => {
    navigate("/reel-comment-user-profile", { state: { userId } });
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (error) {
    return <div className="container">Error: {error}</div>;
  }

  if (!feedData.length) {
    return <div className="container">No data available</div>;
  }

  return (
    <div className="reel-main-container">
      <div className="instagram-home">
      <ToastContainer />
        <Navbar className="nav">
          <Navbar.Brand href="#home">
            <div id="imagelogo">
              <img id="LoginLogo" src={Logo} alt="logo" />
            </div>
            <div id="t1">
              <h3 className="text-center top" id="header">
                TouchUi
              </h3>
            </div>
          </Navbar.Brand>
        </Navbar>
        <aside
          className={`sidebar ${
            window.innerWidth <= 767 ? "mobile-sidebar" : ""
          }`}
        >
          <div className="sidebar-item" id="base" onClick={handlehomeClick}  title="Home">
            <HiHome className="sidebar-icon" id="home1" />
            <span className="Home">Home</span>
          </div>
          <div className="sidebar-item" onClick={handleCreatePostClick} title="Create">
            <FaCamera className="sidebar-icon" id="create1" />
            <span className="Create">Create </span>
          </div>
          <div className="sidebar-item" onClick={handleReelClick} title="Reels">
            <PiMonitorPlayFill className="sidebar-icon" id="reel1" />
            <span className="Reels">Reels</span>
          </div>
          <div className="sidebar-item" onClick={handleProfileClick} title="Profile">
            <img
              src={user?.profile_pic}
              alt={user?.username}
              className="sidebar-icon"
              id="profile1"
            />
            <span className="Profile">Profile</span>
          </div>
          <div className="sidebar-item" onClick={handleLogout} title="Logout">
            <IoMdLogOut className="sidebar-icon" id="logout" />
            <span className="Logout">Logout</span>
          </div>
        </aside>

        <div className="main-content">
          <main className="feed">
            <Modal id="reel-cam-modal" show={showModal} onHide={handleCloseModal} >
            <Modal.Header closeButton className="modal-header">
              <Modal.Title className="modal-title">Create Post</Modal.Title>
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
                  <video id="cameraPreview" autoPlay playsInline className="camera-preview"></video>
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
                        <button onClick={handleCameraCloseMod}>
                          Close Camera
                        </button>
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
          </main>
        </div>
        <Offcanvas />
      </div>

      <div className="main-container">
        <div className="theme">
          {discoverReels.map((reel, index) => (
            <div
              key={index}
              className={`wrappers ${
                highlightedPostId === reel.reels_id ? "highlighted" : ""
              }`}
            >
              <div className="wrapper-one playVideoWrapper">
                <div
                  className="UserProfileCursor"
                  onClick={() => handleUserProfileClick(reel.userid)}
                >
                  <img
                    className="profilepicture"
                    src={reel.profile_pic}
                    alt="Profile"
                  />
                  <h5 className="usernames">{reel.username}</h5>
                </div>
                <div className="video-container">
                  <video
                    loop
                    muted
                    className="playVideo"
                    type="video/mp4"
                    src={reel.file_path}
                    controls={false}
                    ref={(ref) => (videoRefs.current[index] = ref)}
                    onPlay={() => handlePlayVideo(index)}
                    onLoad={() => handleVideoLoad(index)}
                  />
                  <div
                    className="video-overlays"
                    onClick={() => handlePlayVideo(index)}
                  >
                    <p
                      className="mute-button"
                      onClick={() => handleMute(index)}
                    >
                      {!isMuted ? <IoVolumeMute /> : <GoUnmute />}
                    </p>
                  </div>
                </div>
                <div className="foot-count">
                  <div className="counts-container">
                    {reel.like_count !== null && (
                      <p
                        onClick={() =>
                          handleLike(
                            reel.reels_id,
                            likedPosts[reel.reels_id],
                            reel.reels_id
                          )
                        }
                      >
                        {likedPosts[reel.reels_id] ? (
                          <FaHeart className="feed-likes" id= "feed-likes" color="red" />
                        ) : (
                          <FaRegHeart className="feed-likes" id= "feed-likes"/>
                        )}
                      </p>
                    )}
                    {reel.comment_count !== null && (
                      <div className="comment-container">
                        <p className="comment-count">
                          <TbMessageCircle2
                            className="feed-comment"
                            onClick={() => handleCommentClick(reel.reels_id)}
                          />
                        </p>
                      </div>
                    )}

                    {reel.view_count !== null && (
                      <p>
                        <b className="numCount">{reel.view_count}</b>
                        <FaEye className="visible" />
                      </p>
                    )}
                    {reel.follower_count !== null && (
                      <p>
                        <b className="numCount" id="num">{reel.follower_count}</b>
                        <FaUserFriends className="follower" />
                      </p>
                    )}

                    <p
                      id="showComments"
                      className={`showComments ${reel.reels_id}`}
                      onClick={() => handleShowComments(reel)}
                    >
                      {reelCommentCount > 1
                        ? `View all ${reelCommentCount} comments`
                        : reelCommentCount === 1
                        ? "1 comment"
                        : "View Comments"}
                    </p>
                  </div>
                  {activeCommentBox === reel.reels_id && (
                    <div className="highlight-background">
                      <textarea
                        className="commentInputs"
                        placeholder="Write your comment..."
                        value={commentText[highlightedPostId] || ""}
                        onChange={(event) =>
                          handleInputChange(highlightedPostId, event)
                        }
                        onKeyPress={(event) => {
                          if (event.key === "Enter") {
                            handleCommentSubmit();
                          }
                        }}
                      />
                      {commentText && (
                        <Button
                          className="comment-submit-btn"
                          onClick={handleCommentSubmit}
                        >
                          <IoSend />
                        </Button>
                      )}
                      <div className="reelSmileContainer">
                        <div
                          className="smile"
                          id="reel-smile-icon"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <HiOutlineFaceSmile />
                        </div>
                      </div>

                      {showEmojiPicker && (
                            <div className="emoji-picker-containers-reel">
                              <Picker data={data} theme="dark" navPosition="bottom" skinTonePosition="search" previewPosition="none"
                      onEmojiSelect={(emojiObject) => handleEmojiSelect(emojiObject)}
                    />
                            </div>
                          )}
                    </div>
                  )}
                  <p className="time" id="Time">
                    {calculateTimeDifference(reel.timestamp)} <CiTimer />
                  </p>
                  {reel.description && (
                    <p className="caption" id="reel-cap">{reel.description}</p>
                  )}
                  <Modal
                    id="reel-modal"
                    show={showCommentModal}
                    onHide={handleCommentCloseModal}
                    centered
                  >
                    <Modal.Header closeButton>
                      <Modal.Title id="modal-title">{selectedPost?.title} Comments</Modal.Title>
                    </Modal.Header>
                    <Modal.Body id="modal-body-one">
                    <div className="modal-comment-container">
                        <div className="comment-scroll-container">
                        {selectedPost?.comment_count > 0 ? (
                          <div className="post-comments-section">
                             {Comments &&
                          Comments.map((comment,index) =>
                          
                          <div className="post-user-comment" key={index}>
                            <div className="post-user-info">
                            <div className="post-comment-profile" onClick={() =>handleCommentUserProfileClick(comment.comment.userid || comment.comment.user_id)}>
                            <img
                                    className="post-comment-profile-user"
                                    src={comment.comment.profile_pic}
                                    alt="Profile"
                                    
                                  />
                                  <div className="post-user-details">
                                    <p className="post-comment-username-user">
                                      {comment.comment.username}
                                    </p>
                                   </div>
                                   <div className="post-text-sec">
                                   <p className="post-comment-text-user">
                                {comment.comment.comment}
                              </p>
                              </div>
                            </div>
                            <div className="post-time-sec">
                              <p className="post-comment-timestamp-user">
                              {calculateTimeDifference(
                                comment.comment.timestamp
                              )}
                            </p>
                              </div>
                               </div>
                            </div>
                          )}
                             </div>
                        ):(
                          <div className="caption-comment">
                            {selectedPost?.caption || selectedPost?.description ? (
                              <div className="no-post-comment-provider ">
                                  <div className="no-post-comment-yet">
                                    <i id="fi" className="fi fi-rr-bookmark"></i>
                                    <h3 className="no-post-comment">No comments yet</h3>
                                    <p className="para-post-no-comment">
                                      Start the Conversation
                                    </p>
                                  </div>
                               
                              </div>
                            ) : (
                              <div className="no-reel-comment-providers">
                                  <div className="no-comment-yet">
                                    <i id="fi" className="fi fi-rr-bookmark"></i>
                                    <h3 className="no-comment">No comments yet</h3>
                                    <p className="para-no-comment">
                                      Start the Conversation
                                    </p>
                                  </div>
                              </div>
                            )}
                          </div>
                        )}
                        </div>
                      </div>
                    </Modal.Body>
                  </Modal>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reels;
