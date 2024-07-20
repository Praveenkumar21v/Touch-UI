import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import Logo from './Logo.png'

const Home = () => {
  return (
    <div id="main">
      <div id="box1"></div>
      <div id="box2">
        <div id="text">
          Welcome To <br/>
          Touch UI 
        </div>
      </div>
      <div id="box3">
        <div id="container">
          <div id="logo">
            <img src={Logo} alt="Logo" />
          </div>
          <div id="menu">
            <ul>
              <li className="list-item"><Link to="/login">Login</Link></li>
              <li className="list-item"><Link to="/Registeration">Signup</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
