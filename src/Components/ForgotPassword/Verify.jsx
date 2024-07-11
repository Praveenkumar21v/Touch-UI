import React, { useState,useEffect } from "react";
import { Button, Card, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Verify.css'
import verify from './Authentication-cuate-Photoroom.jpg'
import verification from '../Home/Logo.png'
import { FaCheckCircle } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import { IoChevronBackCircleOutline } from "react-icons/io5";

const Verify = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [formErrors, setFormErrors] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("https://touchapp.org/auth/verifyOtp", {
        otp: otp.join(''), 
      });

      if (response.status === 200) {
        setFormErrors("");
        setShowSuccessAlert(true);
        setTimeout(() => {
          navigate("/createPassword");
        }, 2000);
      } else {
        setShowErrorAlert(true);
        setFormErrors("Invalid OTP. Please try again");
      }
    } catch (error) {
      setShowErrorAlert(true);
      setFormErrors("Failed to verify OTP. Please try again.");
    }
  };

  const handleInputChange = (index, value) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value === "") {
      if (index > 0) {
        document.getElementById(`otp-${index - 1}`).focus();
      }
    } else if (index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  useEffect(() => {
    if (showSuccessAlert) {
      const timeout = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [showSuccessAlert]);

  useEffect(() => {
    if (showErrorAlert) {
      const timeout = setTimeout(() => {
        setShowErrorAlert(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [showErrorAlert]);

  const handleBack = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="container-fluid">
      <div className="row">
      <div className="col-md-6 imageReg">
          <img
            src={verify}
            alt="Registration"
            className="img-fluid registrations-images"
          />
        </div>
        <div className='col-md-6 scroll'>
          <Card>
            <Card.Header>
            <h3
                className="text-center touch"
                id="header"
                style={{ color: "rgb(108, 106, 106)" }}
              >
                Touch UI
              </h3>
            </Card.Header>
            <Card.Title>
            <h3 className="text-center otp">Otp Verification</h3>
            </Card.Title>
            <Card.Body>
            <div className="logo" id="logoImgs">
              <img src={verification} alt="verification" />
              </div>
              <Form id="otpverify" onSubmit={handleVerifyOtp}>
                <Form.Group controlId="otp">
                  <Form.Label>Enter OTP</Form.Label>
                  <div className="otp-inputs">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        name={`otp-${index}`}
                        placeholder="0"
                        value={digit}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        maxLength={1}
                      />
                    ))}
                  </div>
                </Form.Group>
                {formErrors && <p className="text-danger">{formErrors}</p>}
                <Button  id="gives" type="submit" variant="primary">
                  Verify OTP
                </Button>
              </Form>
              <IoChevronBackCircleOutline id='backed' type="submit" onClick={handleBack}/>

            </Card.Body>
            <Alert id="successAlert" show={showSuccessAlert} variant="success" className={showSuccessAlert ? 'fadeIn' : 'fadeOut'}>
    OTP Verification Successful <FaCheckCircle className="successCheck" />
  </Alert>

  <Alert id="errorAlert" show={showErrorAlert} variant="danger" className={showErrorAlert ? 'fadeIn' : 'fadeOut'}>
            OTP Verification Failed<RxCrossCircled className="errorCross"/>
          </Alert>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Verify;
