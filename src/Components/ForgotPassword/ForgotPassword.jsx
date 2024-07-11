import React, { useState,useEffect } from 'react'
import { Button,Card,Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import forgot from './Forgot password-cuate-Photoroom.png-Photoroom.png'
import './forgotPassword.css'
import Logo from '../Home/Logo.png';
import { FaCheckCircle } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import {forgotPasswordRequest } from '../../Containers/ForgotPasswordSlice';
import { useDispatch, } from 'react-redux';
import { IoChevronBackCircleOutline } from 'react-icons/io5';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate=useNavigate();

const [mobile,setMobile]=useState('');
const[formErrors,setFormErrors]=useState('');
const [showSuccessAlert, setShowSuccessAlert] = useState(false);
const [showErrorAlert, setShowErrorAlert] = useState(false);


const handleInputChange=(e)=>{
  setMobile(e.target.value);
  setFormErrors('');
}

const handleRequestOtp=async(e)=>{
  e.preventDefault();

    try {
      await dispatch(forgotPasswordRequest(mobile));
      setShowSuccessAlert(true);
      setTimeout(() => {
        navigate("/verifyOtp");
      }, 3000);
    } catch (error) {
      if (error.payload && error.payload.status === 422) {
        setFormErrors('User does not exist. Please check the mobile number.');
      } else {
        setFormErrors('Failed to request OTP. Please try again.');
      }
      setShowErrorAlert(true);
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
  navigate("/login");
};

  return (
<div className='container-fluid'>
      <div className='row'>
      <div className="col-md-6 ">
          <img
            src={forgot}
            alt="Registration"
            className="img-fluid registrations-images"
          />
        </div>
        <div className='col-md-6 scroll'>   
  
          <Card className='contain'>    
            <Card.Header >
            <h3
                className="text-center touch"
                id="header"
                style={{ color: "rgb(108, 106, 106)" }}
              >
                Touch UI
              </h3>
            </Card.Header>
            <Card.Title>
            <h2 className="text-center head">Forgot Password</h2>
            </Card.Title>
            <Card.Body>
            <div className="logo" id="logos">
                <img src={Logo} alt="logo"/>
              </div>

              <Form onSubmit={handleRequestOtp} id='form'>
                <Form.Group>
                <Form.Label id="emn">Enter Mobile Number</Form.Label>
                <Form.Control  id='text-input' type='text' name='mobile' placeholder='Enter your mobile number' value={mobile} onChange={handleInputChange} style={{background:"black", color:'white'}}/>
                </Form.Group>
                {formErrors && <p className="text-danger">{formErrors}</p>}

                <Button id='submits' type="submit" >
                  Request OTP
                </Button>
              </Form>
            <IoChevronBackCircleOutline id='backed' type="submit" onClick={handleBack}/>

            </Card.Body>

            <Alert id="successAlert" show={showSuccessAlert} variant="success" className={showSuccessAlert ? 'fadeIn' : 'fadeOut'}>
    OTP Sent Successfully <FaCheckCircle className="successCheck" />
  </Alert>

  <Alert id="errorAlert" show={showErrorAlert} variant="danger" className={showErrorAlert ? 'fadeIn' : 'fadeOut'}>
            Failed to Send OTP <RxCrossCircled className="errorCross"/>
          </Alert>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword;