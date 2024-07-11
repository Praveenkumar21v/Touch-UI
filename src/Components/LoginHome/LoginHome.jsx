import React, { useState }  from "react";
import Logo from "../Home/Logo.png";
import "./LoginHome.css";
import { Modal, Button } from "react-bootstrap";
import { HiHome } from "react-icons/hi2";
import { PiMonitorPlayFill } from "react-icons/pi";
import { FaCamera } from "react-icons/fa";
import GetFeedDataComponent from "../getFeeds/GetFeeds";
import { Offcanvas } from "react-bootstrap";
import { useNavigate } from "react-router-dom";  
import { Navbar } from "react-bootstrap";
import { IoMdLogOut } from "react-icons/io";
import CreateNewPost from "../getFeeds/CreatePost";
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css'; 
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {logout} from "../../Containers/LoginSlice"
import { useDispatch } from "react-redux";

const LoginHome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  const [showModal, setShowModal] = useState(false);
  const [stream, setStream] = useState(null);
  const [isCameraOpened, setCameraOpened] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [selectedFileA, setSelectedFileA] = useState(null);
  const [selectedFileB, setSelectedFileB] = useState(null);
  const [fileOption, setFileOption] = useState(1);
  const [fileBVisible, setFileBVisible] = useState(false);
  const [fileBButtonClicked, setFileBButtonClicked] = useState(false);
  const [user, setUser] = useState(null);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  React.useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      setUser(userData.user);
    } 
  }, []);

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


  const handleLogout = () => {
    confirmAlert({
      title: "Confirm Logout",
      message: "Are you sure you want to log out?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            dispatch(logout());
            toast.success("Logged out", { position: "top-center", autoClose: 2000 });
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

  const handleProfileClick = () => {
    navigate("/profile");    
  };

  const handleReelClick = () => {
    navigate("/reels");
  };

  const handlehomeClick = () => {
    navigate("/login-home");
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

  const handleRefresh=()=>{
    window.location.reload();
  }

  return (
    <div className="instagram-home">
      <ToastContainer />
      <Navbar className="nav">
        <Navbar.Brand>
          <div className="login-home-logo" onClick={handleRefresh}>
          <div id="imagelogo">
            <img id="LoginLogo" src={Logo} alt="logo" />
          </div>
          <div id="t1">
            <h3 className="text-center top" id="header">
              TouchUi
            </h3>
          </div>
          </div>
        </Navbar.Brand>
      </Navbar>
      <aside
        className={`sidebar ${
          window.innerWidth <= 767 ? "mobile-sidebar" : ""
        }`}
      >
        <div className="sidebar-item" id="base" onClick={handlehomeClick} title="Home">
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
        <img src={user?.profile_pic} alt={user?.username} className="sidebar-icon" id="profile1" /> 
          <span className="Profile">Profile</span>
        </div>
        <div className="sidebar-item" id="log" onClick={handleLogout} title="Logout">
          <IoMdLogOut className="sidebar-icon" id="logout" />
          <span className="Logout">Logout</span>
        </div>
      </aside>

      <div className="main-content">
        <main className="feed">
          <GetFeedDataComponent />

          <Modal id="cam-modal" show={showModal} onHide={handleCloseModal} className="modal">
            <Modal.Header closeButton className="modal-header">
              <Modal.Title className="modal-title" id="create-post">Create Post</Modal.Title>
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
  );
}

export default LoginHome;
