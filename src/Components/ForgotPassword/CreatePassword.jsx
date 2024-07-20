import React, { useState, useEffect } from "react";
import { Button, Card, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetPassword } from "../../Containers/CreatePasswordSlice";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "./CreatePassword.css";
import create from "./Reset password-pana.png";
import logo from "../Home/Logo.png";
import { FaCheckCircle } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import { IoChevronBackCircleOutline } from "react-icons/io5";

const CreatePassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const confirmPwdCode = localStorage.getItem("confirmPwdCode");

  const handleCreatePassword = async (e) => {
    e.preventDefault();

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    if (!passwordRegex.test(password)) {
      setFormErrors("enter your password in format [Abcd@123]");
      return;
    }

    if (password !== confirmPassword) {
      setFormErrors("Passwords do not match");
      return;
    }

    try {
      const response = await dispatch(
        resetPassword({ password, confirmPassword, confirmPwdCode })
      );

      if (response.payload && response.payload.status === 200) {
        setShowSuccessAlert(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setShowErrorAlert(true);
      }
    } catch (error) {
      setShowErrorAlert(true);
    }
  };

  const handleTogglePasswordVisibility = (passwordType) => {
    if (passwordType === "password") {
      setShowPassword(!showPassword);
    } else if (passwordType === "confirmPassword") {
      setShowConfirmPassword(!showConfirmPassword);
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
    <div className="container-fluid containCard">
      <div className="row">
        <div className="col-md-6 ">
          <img
            src={create}
            alt="Registration"
            className="img-fluid password-image"
          />
        </div>
        <div className="col-md-6 scrolls" id="backdropone">
          <Card>
            <Card.Header className="border-dark" id="card-header">
              <h3 className="text-center" id="header">
                TouchUi
              </h3>
            </Card.Header>
            <Card.Title>
              <h2 className="text-center" id="passkey">
                Create Password
              </h2>
            </Card.Title>
            <Card.Body>
              <div className="logos" id="logo1">
                <img src={logo} alt="logo" id="card-logo-one"/>
              </div>
              <Form onSubmit={handleCreatePassword}>
                <Form.Group>
                  <Form.Label id="key">Create Password</Form.Label>
                  <Form.Control
                    style={{
                      background: "black",
                      outline: "none",
                      boxShadow: "none",
                      color: "white",
                    }}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="range"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div
                    className="password-toggle-icon-one"
                    onClick={() => handleTogglePasswordVisibility("password")}
                  >
                    {showPassword ? (
                      <AiOutlineEye />
                    ) : (
                      <AiOutlineEyeInvisible />
                    )}
                  </div>
                </Form.Group>
                <Form.Group>
                  <Form.Label id="key1" style={{ color: "white" }}>
                    Confirm Password
                  </Form.Label>
                  <Form.Control
                    style={{
                      background: "black",
                      outline: "none",
                      boxShadow: "none",
                      color: "white",
                    }}
                    type={showConfirmPassword ? "text" : "password"}
                    id="range1"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <div
                    className="password-toggle-icon-one"
                    onClick={() =>
                      handleTogglePasswordVisibility("confirmPassword")
                    }
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEye />
                    ) : (
                      <AiOutlineEyeInvisible />
                    )}
                  </div>
                </Form.Group>
                {formErrors && <p className="text-danger">{formErrors}</p>}
                <Button type="submit" variant="primary" id="createKey">
                  Create Password
                </Button>
              </Form>
              <IoChevronBackCircleOutline id='backed-one' type="submit" onClick={handleBack}/>

              <Alert
                id="successAlert"
                show={showSuccessAlert}
                variant="success"
                className={showSuccessAlert ? "fadeIn" : "fadeOut"}
              >
                Password reset successful{" "}
                <FaCheckCircle className="successCheck" />
              </Alert>

              <Alert
                id="errorAlert"
                show={showErrorAlert}
                variant="danger"
                className={showErrorAlert ? "fadeIn" : "fadeOut"}
              >
                Failed to reset password{" "}
                <RxCrossCircled className="errorCross" />
              </Alert>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreatePassword;
