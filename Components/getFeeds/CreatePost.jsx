import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "react-bootstrap";
import { createPost } from "../../Containers/CreatePostsSlice";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { HiOutlineFaceSmile } from "react-icons/hi2";

const CreateNewPost = ({ capturedPhoto, selectedFileA, selectedFileB }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.createPostReducer);

  const [postData, setPostData] = useState({
    post_type: "image",
    post_text: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (!capturedPhoto && !selectedFileA && !selectedFileB) {
      setShowEmojiPicker(false);
    }
  }, [capturedPhoto, selectedFileA, selectedFileB]);

  useEffect(() => {
    if (capturedPhoto) {
      setPostData((prevState) => ({
        ...prevState,
        post_fileA: capturedPhoto,
      }));
    }
  }, [capturedPhoto]);

  useEffect(() => {
    if (selectedFileA) {
      setPostData((prevState) => ({
        ...prevState,
        post_fileA: selectedFileA,
      }));
    }
  }, [selectedFileA]);

  useEffect(() => {
    if (selectedFileB) {
      setPostData((prevState) => ({
        ...prevState,
        post_fileB: selectedFileB,
      }));
    }
  }, [selectedFileB]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEmojiSelect = (emojiObject) => {
    setSelectedEmoji(emojiObject);
    if (selectedEmoji) {
      setPostData((prevState) => ({
        ...prevState,
        post_text: prevState.post_text + emojiObject.native,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("post_type", postData.post_type);
      formData.append("post_text", postData.post_text);
      let fileToUpload;
      if (capturedPhoto) {
        const blob = await fetch(capturedPhoto).then((res) => res.blob());
        fileToUpload = new File([blob], "captured_photo.jpg", {
          type: "image/jpeg",
        });
      } else {
        fileToUpload = postData.post_fileA;
      }
      if (fileToUpload) {
        formData.append("post_fileA", fileToUpload);
      }
      if (postData.post_fileB) {
        formData.append("post_fileB", postData.post_fileB);
      }

      await dispatch(createPost(formData)).unwrap();
      setPostData({
        post_type: "image",
        post_text: "",
        post_fileA: null,
        post_fileB: null,
      });
      window.location.reload();
    } catch (error) {
      setErrorMessage(`Failed to create post: ${error.message}`);
    }
  };

  return (
    <div>
      {capturedPhoto || selectedFileA || selectedFileB ? (
        <form onSubmit={handleSubmit}>
          <div>
            <textarea
              id="post_text"
              placeholder="Write a caption..."
              name="post_text"
              value={postData.post_text}
              onChange={handleInputChange}
            />
          </div>
          <Button id="b2" type="submit" disabled={loading}>
            Post
          </Button>
          <div className="smile-container">
            {capturedPhoto ? (
              <div
                id="Createsmile"
                className="smile"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <HiOutlineFaceSmile />
              </div>
            ) : selectedFileA ? (
              <div
                id="ChoosesmileA"
                className="smile"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <HiOutlineFaceSmile />
              </div>
            ) : selectedFileB ? (
              <div
                id="ChoosesmileB"
                className="smile"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <HiOutlineFaceSmile />
              </div>
            ) : (
              ""
            )}
          </div>
        </form>
      ) : null}
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {errorMessage && <p>{errorMessage}</p>}

      {showEmojiPicker && (
        <div
          id="emoji"
          className={
            selectedFileA
              ? "emoji-picker-containers-c"
              : selectedFileB
              ? "emoji-picker-containers-d"
              : capturedPhoto
              ? "emoji-picker-containers-e"
              : "emoji-picker-default"
          }
        >
          {" "}
          <Picker
            data={data}
            theme="dark"
            navPosition="bottom"
            skinTonePosition="search"
            previewPosition="none"
            onEmojiSelect={(emojiObject) => handleEmojiSelect(emojiObject)}
          />
        </div>
      )}
    </div>
  );
};

export default CreateNewPost;
