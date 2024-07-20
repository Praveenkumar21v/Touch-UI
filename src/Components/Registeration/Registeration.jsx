import React, { useState,useEffect } from "react";
import { Form, Button, Card,Alert } from "react-bootstrap";
import { useDispatch, useSelector,shallowEqual } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signup } from "../../Containers/RegisterationSlice";
import { IoMdMale, IoMdFemale } from "react-icons/io";
import { IoMaleFemale } from "react-icons/io5";
import socialMedia from './Social media-cuate (1)-Photoroom.png-Photoroom.png'
import './registeration.css';
import Logo from '../Home/Logo.png';
import { Link } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import { IoWarning } from "react-icons/io5";

const Registration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.RegisterReducer||{},shallowEqual);

  const [registrationData, setRegistrationData] = useState({
    full_name: "",
    mobile: "",
    password:"",
    user_name: "",
    gender: "",
    countryCode: "91",
    udid: "7567567567",
    fcm_token: "456456456456456",
    dob:'',
    image:null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [registrationError, setRegistrationError] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
const [showWarningAlert,setShowWarningAlert]=useState(false);

  const validateForm = () => {
    const errors = {};
    const nameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com)$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,16}$/;
    const usernameRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,16}$/;

    if (!registrationData.full_name.trim()) {
      errors.full_name = "Full Name is required";
    } else if (!nameRegex.test(registrationData.full_name)) {
      errors.full_name =
        "Full Name should contain only alphabets with single space between words";
    }

    if (!registrationData.mobile.trim()) {
      errors.mobile = "Email is required";
    } else if (!emailRegex.test(registrationData.mobile)) {
      errors.mobile = "Invalid email format (e.g., example@example.com)";
    }

    if (!registrationData.password.trim()) {
      errors.password = "Password is required";
    } else if (!passwordRegex.test(registrationData.password)) {
      errors.password = "Password must 5-8 characters (e.g.,Abcd@123) ";
    }

    if (!registrationData.user_name.trim()) {
      errors.user_name = "Username is required";
    } else if (!usernameRegex.test(registrationData.user_name)) {
      errors.user_name = "Username must 5-8 characters (e.g.,Abcd@13k)";
    }

    if (!registrationData.dob.trim()) {
      errors.dob = "Date of Birth is required";
    } else {
      const dobDate = new Date(registrationData.dob);
      const currentDate = new Date();
      const ageDiff = currentDate.getFullYear() - dobDate.getFullYear();

      if (ageDiff < 5) {
        errors.dob = "Age must be above 5 years from today";
      }
    }

    if (!registrationData.gender.trim()) {
      errors.gender = "Gender is required";
    }


    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleGenderChange = (value) => {
    setRegistrationData({
      ...registrationData,
      gender: value,
    });
  };

  const handlePhotoUpload = (e) => {
    const photoFile = e.target.files[0];
    setRegistrationData((prevData) => ({
      ...prevData,
      image: photoFile,
    }));
  };

  const handleSuccessfulRegisteration=(userData)=>{
    localStorage.setItem('userData',JSON.stringify(userData));
    setShowSuccessAlert(true);
    setTimeout(() => {
      navigate('/registeration-verify') 
       }, 3000);    ;
  }


  const handleRegistration = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const formData = new FormData();
  formData.append('full_name', registrationData.full_name);
  formData.append('mobile', registrationData.mobile);
  formData.append('password', registrationData.password);
  formData.append('user_name', registrationData.user_name);
  formData.append('gender', registrationData.gender);
  formData.append('countryCode', registrationData.countryCode);
  formData.append('udid', registrationData.udid);
  formData.append('fcm_token', registrationData.fcm_token);
  formData.append('dob', registrationData.dob);
  if (registrationData.image) {
    formData.append('image', registrationData.image);
  }
  
    try {
      const userData = await dispatch(signup(formData));
      const payload = userData?.payload;
  
      if (payload) {
        const { status, errors, token } = payload;
  
        if (token) {
          console.log('Registration successful:', userData);
          setShowSuccessAlert(true);
          handleSuccessfulRegisteration(userData);
        } else if (status === 422) {
          const warningMessage = errors.map((error) => error.msg).join(', ');
          console.log('Warning response:', warningMessage);
          setShowWarningAlert(true);
          setRegistrationError(warningMessage);
        } else {
          console.log('Other error response:', payload);
          setShowErrorAlert(true);
          setRegistrationError("Registration failed. Please try again later.");
        }
      } else {
        throw new Error('Invalid response payload');
      }
    } catch (error) {
      console.error('Error Registration Data:', error);
      setShowErrorAlert(true);
      setRegistrationError("An unexpected error occurred. Please try again later.");
    }
  };
  
  useEffect(() => {
    let successTimeout, warningTimeout, errorTimeout;
  
    if (showSuccessAlert) {
      successTimeout = setTimeout(() => setShowSuccessAlert(false), 3000);
    }
    if (showWarningAlert) {
      warningTimeout = setTimeout(() => setShowWarningAlert(false), 3000);
    }
    if (showErrorAlert) {
      errorTimeout = setTimeout(() => setShowErrorAlert(false), 3000);
    }
  
    return () => {
      clearTimeout(successTimeout);
      clearTimeout(warningTimeout);
      clearTimeout(errorTimeout);
    };
  }, [showSuccessAlert, showWarningAlert, showErrorAlert]);
  
  useEffect(() => {
    if (showSuccessAlert || showWarningAlert || showErrorAlert) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showSuccessAlert, showWarningAlert, showErrorAlert]);
  
  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    if (month < 10) {
      month = `0${month}`;
    }
    if (day < 10) {
      day = `0${day}`;
    }

    return `${year}-${month}-${day}`;
  };
 
  return (
    <div className="container-fluid registration-background">
      <div className="row">
      <div className="col-md-6 ">
          <img
            src={socialMedia}
            alt="Registration"
            className="img-fluid registration-image"
          />
        </div>

        <div className="col-md-6 scroll">
          <Card id="move">
          <Card.Header className="border-dark">
            
              <h3
                className="text-center mt-4 touch"
                id="header"
                style={{ color: "rgb(108, 106, 106)" }}
              >
                Touch UI
              </h3>
            </Card.Header>
            <Card.Title>
              <h2 className="text-center text-white mt-3 ">Complete profile</h2>
              <p className="text-center text-secondary para">
                Just a few things to get started!
              </p>
            </Card.Title>

            <Card.Body id="card-body">
            <div className="logo">
                <img src={Logo} alt="logo"/>
              </div>
              <Form onSubmit={handleRegistration}>
                <Form.Group controlId="full_name">
                <Form.Label id="form-name">What's your name?</Form.Label>
                  <Form.Control
                  className="Text"
                    type="text"
                    name="full_name"
                    placeholder="Enter your full name"
                    value={registrationData.full_name}
                    onChange={handleInputChange}
                    style={{
                      background: "black",
                      outline: "none",
                      boxShadow: "none",
                      color: "white",
                    }}
                  />
                  {formErrors.full_name && (
                    <p id="errorFullName" className="text-danger">{formErrors.full_name}</p>
                  )}
                </Form.Group>

                
                <Form.Group controlId="mobile">
                  <Form.Label id="form-mail">What's your email</Form.Label>
                  <Form.Control
                  className="Text"
                    type="text"
                    name="mobile"
                    placeholder="@ enter your email"
                    value={registrationData.mobile}
                    onChange={handleInputChange}
                    style={{
                      background: "black",
                      outline: "none",
                      boxShadow: "none",
                      color: "white",
                    }}
                  />
                  {formErrors.mobile && (
                    <p id="errorMobile" className="text-danger">{formErrors.mobile}</p>
                  )}
                </Form.Group>

                <Form.Group controlId="password">
                  <Form.Label id="form-password">Password</Form.Label>
                  <Form.Control
                    className="Text"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={registrationData.password}
                    onChange={handleInputChange}
                    style={{
                      background: "black",
                      outline: "none",
                      boxShadow: "none",
                      color: "white",
                    }}
                  />
                   <div
                      className="password-toggle-icons"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <AiOutlineEye />
                      ) : (
                        <AiOutlineEyeInvisible />
                      )}
                    </div>
                  {formErrors.password && (
                    <p id="errorPassword" className="text-danger">{formErrors.password}</p>
                  )}
                   
                </Form.Group>

                <Form.Group controlId="user_name">
                  <Form.Label id="form-user-name">User Name</Form.Label>
                  <Form.Control
                    className="Text"
                    type="text"
                    name="user_name"
                    placeholder="Enter your user name"
                    value={registrationData.user_name}
                    onChange={handleInputChange}
                    style={{
                      background: "black",
                      outline: "none",
                      boxShadow: "none",
                      color: "white",
                    }}
                  />
                  {formErrors.user_name && (
                    <p id="errorUserName" className="text-danger">{formErrors.user_name}</p>
                  )}
                </Form.Group>

                <Form.Group controlId="image">
                  <Form.Label id="form-photo">Photo (optional)</Form.Label>
                  <Form.Control
                    className="Text"
                    type="file"
                    name="image"
                    onChange={handlePhotoUpload}
                    accept="image/&"
                    style={{
                      background: "black",
                      outline: "none",
                      boxShadow: "none",
                      color: "white",
                    }}
                  />
                  {formErrors.photo && (
                    <p id="errorPhoto" className="text-danger">{formErrors.photo}</p>
                  )}
                </Form.Group>

                <Form.Group controlId="dob">
                  <Form.Label id="form-dob">Date of Birth</Form.Label>
                  <Form.Control
                    className="Text"
                    type="date"
                    name="dob"
                    value={registrationData.dob}
                    onChange={handleInputChange}
                    max={getMinDate()}
                    style={{
                      background: "black",
                      outline: "none",
                      boxShadow: "none",
                      color: "white",
                    }}
                  />
                  {formErrors.dob && (
                    <p id="errorDob" className="text-danger">{formErrors.dob}</p>
                  )}
                </Form.Group>

                <Form.Group controlId="gender">
                  <Form.Label id="form-gender">What's your gender?</Form.Label>

                  <div className="gender">
                    <div
                      onClick={() => handleGenderChange("male")}
                      className="gender-icon"
                    >
                      <IoMdMale
                        id="male"
                        className={`icon ${
                          registrationData.gender === "male" ? "selected" : ""
                        }`}
                      />
                      <span className="label">Male</span>
                    </div>
                    <div
                      onClick={() => handleGenderChange("female")}
                      className="gender-icon"
                    >
                      <IoMdFemale
                        id="female"
                        className={`icon ${
                          registrationData.gender === "female" ? "selected" : ""
                        }`}
                      />
                      <span className="label">Female</span>
                    </div>
                    <div
                      onClick={() => handleGenderChange("other")}
                      className="gender-icon"
                    >
                      <IoMaleFemale
                        id="other"
                        className={`icon ${
                          registrationData.gender === "other" ? "selected" : ""
                        }`}
                      />
                      <span className="label">Other</span>
                    </div>
                  </div>
                  {formErrors.gender && (
                    <p id="errorGender" className="text-danger">{formErrors.gender}</p>
                  )}
                </Form.Group>


                <Form.Group controlId="countryCode" >
                  <Form.Label id="form-countryCode">Country Code</Form.Label>
                  <Form.Control
                    className="Text"
                    type="text"
                    name="countryCode"
                    placeholder="Enter your country code"
                    value={registrationData.countryCode}
                    onChange={handleInputChange}
                    style={{
                      background: "black",
                      outline: "none",
                      boxShadow: "none",
                      color: "white",
                    }}
                    disabled
                  />

                </Form.Group>

                <Button  type="submit" id="buttons" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </Button>
              </Form>
              {registrationError && <p className="regError" style={{ color: "red" }}>{registrationError}</p>}
              {error && <p  style={{ color: "red" }}>{error}</p>}
            </Card.Body>
            <Alert id="successAlert" show={showSuccessAlert} variant="success" className={showSuccessAlert ? 'fadeIn' : 'fadeOut'}>
    Registeration Successful <FaCheckCircle className="successCheck" />
  </Alert>

  <Alert id="warningAlert" show={showWarningAlert} variant="warning" className={showWarningAlert ? 'fadeIn' : 'fadeOut'}>
  {registrationError}  <IoWarning  className="warningShield"/>
          </Alert>

  <Alert id="errorAlert" show={showErrorAlert} variant="danger" className={showErrorAlert ? 'fadeIn' : 'fadeOut'}>
  Registeration Failed <RxCrossCircled className="errorCross"/>
          </Alert>
          </Card>
          <div className="alreadyRegistered">
                  <Link to="/login" className="textone">
                    <span id="login">Already have an account?</span>{" "}
                    <span className="accounts"> Login</span>
                  </Link>
                </div>
                <br/>       
        </div>
      </div>
    </div>
  );
};

export default Registration;