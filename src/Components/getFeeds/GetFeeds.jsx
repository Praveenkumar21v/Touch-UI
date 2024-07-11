import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { fetchFeeds } from "../../Containers/GetFeedsSlice";
import "./getfeeds.css";
import { IoChevronBackCircle, IoChevronForwardCircle } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa";
import { TbMessageCircle2 } from "react-icons/tb";
import { FaEye, FaUserFriends } from "react-icons/fa";
import { CiTimer } from "react-icons/ci";
import { Carousel } from "react-bootstrap";
import { IoVolumeMute } from "react-icons/io5";
import { GoUnmute } from "react-icons/go";
import { IoPlay } from "react-icons/io5";
import { IoIosPause } from "react-icons/io";
import { togglePostLike } from "../../Containers/PostLikeSlice";
import { toggleReelLike } from "../../Containers/reelLikeSlice";
import { IoSend } from "react-icons/io5";
import { Button, Modal, Alert } from "react-bootstrap";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { HiOutlineFaceSmile } from "react-icons/hi2";
import { postComment } from "../../Containers/PostCommentSlice";
import { FaHeart } from "react-icons/fa";
import { updateLikeStatus } from "../../Containers/PostLikeSlice";
import { useNavigate } from "react-router-dom";
import { TbComet } from "react-icons/tb";
import InfiniteScroll from "react-infinite-scroll-component";
import { reelComment } from "../../Containers/reelCommentSlice";
import "@flaticon/flaticon-uicons/css/all/all.css";
import { fetchComments } from "../../Containers/GetCommentsSlice";
import Spinner from "../Spinner/spinner";

const GetFeedDataComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {data: feedData = [], loading, loadingMore, error, hasMore} = useSelector((state) => state.getFeedsReducer, shallowEqual);

  const reelCommentCount = useSelector((state) => state.reelCommentReducer.commentCount);
  
  const Comments = useSelector((state) => state.getCommentsReducer.comments);

  const [showCollections, setShowCollections] = useState(false);
  const [collections, setCollections] = useState([]);
  const [showEcommerceCategories, setShowEcommerceCategories] = useState(false);
  const [ecommerceCategories, setEcommerceCategories] = useState([]);
  const videoRefs = useRef([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [likedPosts, setLikedPosts] = useState({});
  const [user, setUser] = useState(null);
  const [showUsernameAlert, setShowUsernameAlert] = useState(false);
  const [comments, setComments] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (showModal && selectedPost && selectedPost.comment_count > 0) {
      const postId = selectedPost.postid || selectedPost.reels_id;
      dispatch(fetchComments({ post_id: postId, offset: 0, limit: 100 }));
    }
  }, [showModal, dispatch, selectedPost]);

  useEffect(() => {
    dispatch(fetchFeeds({ offset: 0, limit: 10 }));
  }, [dispatch]);

  const fetchMoreData = () => {
    if (!loadingMore && hasMore) {
      setDataLoading(true);
      setTimeout(() => {
      dispatch(fetchFeeds({ offset: feedData.length, limit: 10 }));
      setDataLoading(false);
    }, 3000);
    }
  };
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      setUser(userData.user);
      if (userData.user && userData.user.username) {
        setShowUsernameAlert(true);
      }
    }
  }, []);


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
    if (showUsernameAlert) {
      const timeout = setTimeout(() => {
        setShowUsernameAlert(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [showUsernameAlert]);

  useEffect(() => {
    const storedLikedPosts = localStorage.getItem("likedPosts");
    if (storedLikedPosts) {
      setLikedPosts(JSON.parse(storedLikedPosts));
    }
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
  }, [likedPosts]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      videoRefs.current.forEach((video, index) => {
        if (!video) return;
        const card = video.closest(".wrapper-one");
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const isVisible =
          rect.top >= 0 &&
          rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight);
        if (isVisible) {
          video.play();
        } else {
          video.pause();
        }
      });
    };

    
    const handleVideoPause = (index) => {
      setIsVideoPlaying(false);
    };

    const handleVideoPlay = (index) => {
      setIsVideoPlaying(true);
    };

    window.addEventListener("scroll", handleVisibilityChange);
    videoRefs.current.forEach((video, index) => {
      if (video) {
        video.addEventListener("pause", () => handleVideoPause(index));
        video.addEventListener("play", () => handleVideoPlay(index));
      }
    });

    return () => {
      window.removeEventListener("scroll", handleVisibilityChange);
      videoRefs.current.forEach((video, index) => {
        if (video) {
          video.removeEventListener("pause", () => handleVideoPause(index));
          video.removeEventListener("play", () => handleVideoPlay(index));
        }
      });
    };
  }, []);

  const handlePlayVideo = (index) => {
    try {
      const video = videoRefs.current[index];
      if (video) {
        video.addEventListener(
          "canplay",
          () => {
            try {
              video.play();
            } catch (error) {
              console.error(`Error playing video at index ${index}:`, error);
            }
            pauseOtherVideos(index);
            setIsVideoPlaying(true);
          },
          { once: true }
        );
      }
    } catch (error) {
      console.error(`Error handling video playback at index ${index}:`, error);
    }
  };

  const pauseOtherVideos = (index) => {
    videoRefs.current.forEach((videoRef, i) => {
      if (videoRef && !videoRef.paused && i !== index) {
        videoRef.pause();
      }
    });
  };

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

  const playPause = async (index) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        try {
          await video.play();
          setIsVideoPlaying(true);
        } catch (error) {
          console.error("Failed to play video:", error);
        }
      } else {
        video.pause();
        setIsVideoPlaying(false);
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

  const handleCollectionClick = () => {
    setShowCollections((prevState) => !prevState);
    if (!showCollections) {
      const collectionsData = feedData.find(
        (item) => item.feed_type === "Investments"
      );
      if (collectionsData) {
        setCollections(collectionsData.collections || []);
        setShowEcommerceCategories(false);
      }
    }
  };
  const getFilter = (index) => {
    const filters = [
      "invert(31%) sepia(78%) saturate(1211%) hue-rotate(190deg) brightness(107%) contrast(106%)",
      "invert(75%) sepia(0%) saturate(7461%) hue-rotate(337deg) brightness(107%) contrast(106%)",
      "invert(72%) sepia(20%) saturate(7114%) hue-rotate(279deg) brightness(95%) contrast(89%)",
    ];
    return index < filters.length ? filters[index] : "";
  };

  const getFiltered = (index) => {
    const filter = [
      "invert(31%) sepia(78%) saturate(1211%) hue-rotate(190deg) brightness(107%) contrast(106%)",
      "invert(9%) sepia(92%) saturate(5370%) hue-rotate(342deg) brightness(115%) contrast(102%)",
      "invert(72%) sepia(20%) saturate(7114%) hue-rotate(279deg) brightness(95%) contrast(89%)",
      "invert(50%) sepia(85%) saturate(5562%) hue-rotate(43deg) brightness(109%) contrast(90%)",
      "invert(22%) sepia(98%) saturate(3039%) hue-rotate(344deg) brightness(89%) contrast(87%)",
    ];
    return index < filter.length ? filter[index] : "";
  };

  const colors = ["#1cb2e8", "#34c76a", "#d333d6"];
  const color = ["#1676ED", "#DC0530", "#E66ACE", "#98800D", "#FF5F1F"];

  const handleEcommerceCategoryClick = () => {
    setShowEcommerceCategories((prevState) => !prevState);

    if (showEcommerceCategories) {
      setEcommerceCategories([]);
    } else {
      const ecommerceCategoriesData = feedData.find(
        (item) => item.feed_type === "E-Commerce"
      );
      if (ecommerceCategoriesData) {
        setEcommerceCategories(
          ecommerceCategoriesData.ecommerce_category || []
        );
        setShowCollections(false);
      }
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
        [currentPostId]: prevComment[currentPostId] ? prevComment[currentPostId] + emojiObject.native : emojiObject.native,
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
    const feed = feedData.find(
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

  const handleShowComments = (post) => {
    setSelectedPost(post);
    setShowModal(true);
    setActiveCommentBox(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPost(null);
    setCommentText("");
  };

  const handleUserProfileClick = (userId) => {
    navigate("/post-user-profile", { state: { userId } });
  };

  const handleCommentUserProfileClick = (userId) => {
    navigate("/post-comment-user-profile", { state: { userId } });
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
    <>
      <Alert
        id="LoginAlert"
        show={showUsernameAlert}
        variant="info"
        className={showUsernameAlert ? "fadeIn" : "fadeOut"}
      >
        {user && `Welcome, ${user.username}`}&nbsp;{" "}
        <TbComet className="successCheck" />
      </Alert>
      <InfiniteScroll
        dataLength={feedData.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={dataLoading && <div style={{ display: 'flex', justifyContent: 'center' }}><Spinner /></div>}
        endMessage={
          <p style={{ textAlign: "center" }}>Yay! You have seen it all</p>
        }
      >
        <div className="feed-main-container">
          <div className="main-container">
            <div className="theme">
              {feedData.map((feed, index) => (
                <div
                  key={index}
                  className={`wrappers ${
                    highlightedPostId === feed.postid ||
                    highlightedPostId === feed.reels_id
                      ? "highlighted"
                      : ""
                  }`}
                >
                  {((feed.feed_type === "POST" &&
                    feed.post_file &&
                    JSON.parse(feed.post_file).some((file) => file.path)) ||
                    (feed.feed_type === "REEL" && feed.file_path)) && (
                    <div className="wrapper-one">
                      <div
                        className="UserProfileCursor"
                        onClick={() =>
                          handleUserProfileClick(feed.user_id || feed.userid)
                        }
                      >
                        <img
                          className="profilepicture"
                          src={feed.profile_pic}
                          alt="Profile"
                        />
                        <h5 className="usernames">{feed.username}</h5>
                      </div>
                      {feed.feed_type === "REEL" && (
                        <div className="video-container">
                          <video
                            ref={(ref) => (videoRefs.current[index] = ref)}
                            className="playVideo"
                            src={feed.file_path}
                            type="video/mp4"
                            autoPlay
                            muted
                            onPlay={() => {
                              setIsVideoPlaying(true);
                              handlePlayVideo(index);
                            }}
                            onPause={() => setIsVideoPlaying(false)}
                          />
                          <p
                            className="mute-button"
                            onClick={() => handleMute(index)}
                          >
                            {!isMuted ? <IoVolumeMute /> : <GoUnmute />}
                          </p>
                          <div className="play-pause-button">
                            <p
                              className="play-pause-btn"
                              onClick={() => playPause(index)}
                            >
                              {isVideoPlaying ? <IoIosPause /> : <IoPlay />}
                            </p>
                          </div>
                        </div>
                      )}
                      {feed.feed_type === "POST" && (
                        <div>
                          {feed.post_file &&
                            typeof feed.post_file === "string" &&
                            (JSON.parse(feed.post_file).length > 1 ? (
                              <Carousel
                                prevIcon={<IoChevronBackCircle size={50} />}
                                nextIcon={<IoChevronForwardCircle size={50} />}
                                wrap={false}
                                className="carousel"
                              >
                                {JSON.parse(feed.post_file).map(
                                  (file, fileIndex) => (
                                    <Carousel.Item key={fileIndex}>
                                      {file.post_type === "video" ? (
                                        <div className="video-container">
                                          <video
                                            ref={(ref) =>
                                              (videoRefs.current[index] = ref)
                                            }
                                            className="playVideo"
                                            src={file.path}
                                            type="video/mp4"
                                            autoPlay
                                            muted
                                            onPlay={() => {
                                              setIsVideoPlaying(true);
                                              handlePlayVideo(index);
                                            }}
                                            onPause={() =>
                                              setIsVideoPlaying(false)
                                            }
                                          />
                                          <p
                                            className="mute-button"
                                            onClick={() => handleMute(index)}
                                          >
                                            {isMuted ? (
                                              <IoVolumeMute />
                                            ) : (
                                              <GoUnmute />
                                            )}
                                          </p>
                                          <div className="play-pause-button">
                                            <p
                                              className="play-pause-btn"
                                              onClick={() => playPause(index)}
                                            >
                                              {isVideoPlaying ? (
                                                <IoIosPause />
                                              ) : (
                                                <IoPlay />
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      ) : (
                                        <img
                                          className="post-images"
                                          src={file.path}
                                          alt={`Post ${fileIndex}`}
                                        />
                                      )}
                                    </Carousel.Item>
                                  )
                                )}
                              </Carousel>
                            ) : (
                              JSON.parse(feed.post_file).map(
                                (file, fileIndex) => (
                                  <div
                                    key={fileIndex}
                                    className="post-image-container"
                                  >
                                    {file.type === "video" ? (
                                      <div className="video-container">
                                        <video
                                          ref={(ref) =>
                                            (videoRefs.current[index] = ref)
                                          }
                                          className="playVideo"
                                          src={file.path}
                                          type="video/mp4"
                                          autoPlay
                                          muted
                                          onPlay={() => {
                                            setIsVideoPlaying(true);
                                            handlePlayVideo(index);
                                          }}
                                          onPause={() =>
                                            setIsVideoPlaying(false)
                                          }
                                        />
                                        <p
                                          className="mute-button"
                                          onClick={() => handleMute(index)}
                                        >
                                          {isMuted ? (
                                            <IoVolumeMute />
                                          ) : (
                                            <GoUnmute />
                                          )}
                                        </p>
                                        <div className="play-pause-button">
                                          <p
                                            className="play-pause-btn"
                                            onClick={() => playPause(index)}
                                          >
                                            {isVideoPlaying ? (
                                              <IoIosPause />
                                            ) : (
                                              <IoPlay />
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    ) : (
                                      <img
                                        className="post-images"
                                        src={file.path}
                                        alt={`Post ${fileIndex}`}
                                      />
                                    )}
                                  </div>
                                )
                              )
                            ))}
                        </div>
                      )}
                      <div className="foot-count">
                        <div className="counts-container">
                          {feed.like_count !== null && (
                            <p
                              className={
                                feed.feed_type === "POST"
                                  ? "like-count"
                                  : "like-count-reel"
                              }
                              onClick={() =>
                                handleLike(
                                  feed.postid || feed.reels_id,
                                  likedPosts[feed.postid || feed.reels_id],
                                  feed.feed_type
                                )
                              }
                            >
                              {likedPosts[feed.postid || feed.reels_id] ? (
                                <FaHeart className={feed.feed_type==="POST"?"feed-like":"feed-likes"} id={feed.post_type==="image"? "feed-like" : "feed-likes"} color="red" />
                              ) : (
                                <FaRegHeart className={feed.feed_type==="POST"?"feed-like":"feed-likes"} id={feed.post_type==="image"? "feed-like" : "feed-likes"} />
                              )}
                            </p>
                          )}

                          {feed.comment_count !== null && (
                            <div className="comment-container">
                              <p
                                className={
                                  feed.feed_type === "POST"
                                    ? "comment-count"
                                    : "comment-count-reel"
                                }
                              >
                                <TbMessageCircle2
                                  className="feed-comment"
                                  onClick={() =>
                                    handleCommentClick(
                                      feed.feed_type === "POST"
                                        ? feed.postid
                                        : feed.reels_id
                                    )
                                  }
                                />
                              </p>
                            </div>
                          )}
                          {feed.view_count !== null && (
                            <p
                              className={
                                feed.feed_type === "POST"
                                  ? "visible-count"
                                  : "visible-count-reel"
                              }
                            >
                              <b className="numCount">{feed.view_count}</b>
                              <FaEye className="visible" />
                            </p>
                          )}
                          {feed.follower_count !== null && (
                            <p
                              className={
                                feed.feed_type === "POST"
                                  ? "follower-count"
                                  : "follower-count-reel"
                              }
                            >
                              {" "}
                              <b id="numCount" className="numCount">{feed.follower_count}</b>
                              <FaUserFriends className="follower" />
                            </p>
                          )}
                          {feed.feed_type === "POST" ? (
                            <p
                              className={`showComments ${
                                feed.feed_type === "POST" ? "post-comments" : ""
                              }`}
                              onClick={() => handleShowComments(feed)}
                            >
                              {feed.comment_count > 1
                                ? `View all ${feed.comment_count} comments`
                                : feed.comment_count === 1
                                ? "1 comment"
                                : "View Comments"}
                            </p>
                          ) : (
                            <p
                              className={`showComments ${
                                feed.feed_type === "REEL" ? "reel-comments" : ""
                              }`}
                              onClick={() => handleShowComments(feed)}
                            >
                              {reelCommentCount > 1
                                ? `View all ${reelCommentCount} comments`
                                : reelCommentCount === 1
                                ? "1 comment"
                                : "View Comments"}
                            </p>
                          )}
                        </div>
                      {activeCommentBox === (feed.postid || feed.reels_id) && (
                        <div className="highlight-background">
                          <textarea
                            className={feed.postid?"commentInput":"commentInputs"}
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
                          <div
                            className={`smile-container ${
                              feed.feed_type === "REEL"
                                ? "reel-smile"
                                : feed.feed_type === "POST"
                                ? "post-smile"
                                : "create-post-smile"
                            }`}
                          >
                            {feed.feed_type === "POST" &&
                              feed.post_file &&
                              typeof feed.post_file === "string" &&
                              JSON.parse(feed.post_file).length > 1 && (
                                <div
                                  className="multi-post-smile"
                                  onClick={() =>
                                    setShowEmojiPicker(!showEmojiPicker)
                                  }
                                >
                                  <HiOutlineFaceSmile />
                                </div>
                              )}

                            {feed.feed_type === "REEL" &&
                              feed.file_path &&
                              feed.file_path.length > 1 && (
                                <div
                                  className="multi-reel-smile"
                                  onClick={() =>
                                    setShowEmojiPicker(!showEmojiPicker)
                                  }
                                >
                                  <HiOutlineFaceSmile />
                                </div>
                              )}

                            {feed.feed_type === "POST" &&
                              feed.post_file &&
                              typeof feed.post_file === "string" &&
                              JSON.parse(feed.post_file).length === 1 && (
                                <div
                                  className="single-post-smile"
                                  onClick={() =>
                                    setShowEmojiPicker(!showEmojiPicker)
                                  }
                                >
                                  <HiOutlineFaceSmile />
                                </div>
                              )}

                            {feed.feed_type === "REEL" &&
                              feed.file_path &&
                              feed.file_path.length === 1 && (
                                <div
                                  className="single-reel-smile"
                                  onClick={() =>
                                    setShowEmojiPicker(!showEmojiPicker)
                                  }
                                >
                                  <HiOutlineFaceSmile />
                                </div>
                              )}
                          </div>

                          {showEmojiPicker && (
                            <div className={feed.postid?"emoji-picker-containers":"emoji-picker-containers-rw"}>
                              <Picker data={data} theme="dark" navPosition="bottom" skinTonePosition="search" previewPosition="none"
                      onEmojiSelect={(emojiObject) => handleEmojiSelect(emojiObject)}
                    />
                            </div>
                          )}
                        </div>
                      )}

                      {feed.caption && (
                        <p className="caption">{feed.caption}</p>
                      )}
                      {feed.description && (
                        <p className="description-one">{feed.description}</p>
                      )}
                      {feed.feed_type === "REEL" && (
                        <p className="reels-time">
                          {calculateTimeDifference(feed.timestamp)} <CiTimer />
                        </p>
                      )}
                      {feed.feed_type === "POST" && (
                        <p className="time">
                          {calculateTimeDifference(feed.created_timestamp)}{" "}
                          <CiTimer />
                        </p>
                      )}
                    </div>
                    </div>
                  )}

                  <Modal id="comment-top-modal" show={showModal} onHide={handleCloseModal} centered>
                    <Modal.Header closeButton>
                      <Modal.Title id="modal-close">{selectedPost?.title}Comments</Modal.Title>
                    </Modal.Header>
                    <Modal.Body id="modal-body">
                      <div className="modal-comment-container">
                        <div className="comment-scroll-container">
                        {selectedPost?.comment_count > 0 ? (
                          <div className="post-comments-section">
                             {Comments &&
                          Comments.map((comment,index) =>
                          
                          <div className="post-user-comment" key={index}>
                            <div className="post-user-info">
                            <div className="post-comment-profile"  onClick={() =>handleCommentUserProfileClick(comment.comment.userid || comment.comment.user_id)}>

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
                                {selectedPost?.comment_count === 0 && (
                                  <div className="no-post-comment-yet" >
                                    <i id="fi-fi" className="fi fi-rr-bookmark"></i>
                                    <h3 className="no-post-comment" id="no-comment">No comments yet</h3>
                                    <p className="para-post-no-comment" id="para-comm">
                                      Start the Conversation
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="feeds-no-comment-providers">
                                {selectedPost?.comment_count === 0 && (
                                  <div className="no-comment-yet" >
                                    <i id="fi-fo" className="fi fi-rr-bookmark"></i>
                                    <h3 className="no-comment" id="no-comment-one">No comments yet</h3>
                                    <p className="para-no-comment" id="para-comm-one">
                                      Start the Conversation
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        </div>
                      </div>
                    </Modal.Body>
                  </Modal>
                </div>
              ))}
            </div>

            {/* Collections */}
            <div className="right-side-row">
              <div className="collection-form">
                <button
                  className="collection-btn"
                  onClick={handleCollectionClick}
                >
                  <h2 className="collection-name">Collections</h2>
                </button>
                {showCollections && collections.length > 0 && (
                  <div>
                    {collections.map(({ id, category_name, image }, index) => (
                      <div key={id}>
                        <img
                          id="color-change-img"
                          src={image}
                          alt={category_name}
                          className="funds-img"
                          style={{ filter: getFilter(index) }}
                        />
                        <p
                          className="funds"
                          style={{ color: colors[index % colors.length] }}
                        >
                          {category_name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* E-Commerce Categories */}
              <div className="ecommerce">
                <button
                  className="ecommerce-btn"
                  onClick={handleEcommerceCategoryClick}
                >
                  <h2 className="ecommerce-name">E-Commerce</h2>
                </button>
                {showEcommerceCategories && ecommerceCategories.length > 0 && (
                  <div>
                    {ecommerceCategories.map(
                      ({ category_id, category_name, image }, index) => (
                        <div key={category_id}>
                          <img
                            className="ecommerce-img"
                            src={image}
                            alt={category_name}
                            style={{ filter: getFiltered(index) }}
                          />
                          <p
                            className="ecomm"
                            style={{ color: color[index % color.length] }}
                          >
                            {category_name}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </InfiniteScroll>
      {loadingMore && <p>Loading more...</p>}
    </>
  );
};

export default GetFeedDataComponent;
