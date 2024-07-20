import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './NotFound.css'; 

const NotFoundPage = () => {
  const [stars, setStars] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    const createStar = () => {
      const right = Math.random() * 500;
      const top = Math.random() * window.innerHeight;
      const newStar = { right, top };
      setStars((prevStars) => [...prevStars, newStar]);
    };

    const intervalId = setInterval(createStar, 100);
    return () => clearInterval(intervalId); 
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setStars((prevStars) =>
        prevStars
          .map((star) => ({
            ...star,
            right: star.right + 3,
          }))
          .filter((star) => star.right < window.innerWidth)
      );
    }, 10);
    return () => clearInterval(intervalId); 
  }, []);

  const handleReturnHome = () => {
    navigate('/');
  };


  return (
    <div className="notFoundPage">
      <div className="text">
        <div>ERROR</div>
        <h1>404</h1>
        <hr />
        <div>Page Not Found</div>
        <button className="homeButton" id="homeButton" onClick={handleReturnHome}>Return to Home</button>
      </div>
      <div className="astronaut">
        <img
          src="https://images.vexels.com/media/users/3/152639/isolated/preview/506b575739e90613428cdb399175e2c8-space-astronaut-cartoon-by-vexels.png"
          alt="Astronaut"
        />
      </div>
      {stars.map((star, index) => (
        <div
          key={index}
          className="star"
          style={{ top: `${star.top}px`, right: `${star.right}px` }}
        ></div>
      ))}
    </div>
  );
};

export default NotFoundPage;
