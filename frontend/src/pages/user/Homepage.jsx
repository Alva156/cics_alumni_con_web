import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import AOS from "aos";
import "aos/dist/aos.css"; // Import the AOS CSS styles
import ustbg from "../../assets/ustbg.mp4";
import "../../App.css";
import homepage1 from "../../assets/homepage1.jpg";   
import homepage2 from "../../assets/homepage2.jpg";   
import homepage3 from "../../assets/homepage3.jpg";   

const Homepage = () => {
  const [currentPage, setCurrentPage] = useState(0);  
  const [fade, setFade] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const images = [homepage1, homepage2, homepage3]; // Placeholder images
  const videoRef = useRef(null);
  const navigate = useNavigate(); // Initialize useNavigate

  // Initialize AOS library
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });       
  }, []);

  const nextPage = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentPage((prevPage) => (prevPage === 1 ? 0 : prevPage + 1));
      setFade(false);
    }, 500);
  };

  // useEffect(() => {
  //   const interval = setInterval(nextPage, 20000); 
  //   return () => clearInterval(interval);
  // }, []);

  const prevPage = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentPage((prevPage) => (prevPage === 0 ? 1 : prevPage - 1));
      setFade(false);
    }, 500);
  };

  useEffect(() => {
    if (videoRef.current) {
      const timeout = setTimeout(() => {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }, 60000);

      return () => clearTimeout(timeout);
    }
  }, [currentPage]);

  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    const messageShown = sessionStorage.getItem("loginMessageShown");

    if (storedLoginStatus === "true" && messageShown !== "true") {
      setShowLoginMessage(true);
      sessionStorage.setItem("loginMessageShown", "true");

      setTimeout(() => {
        setShowLoginMessage(false);
      }, 5000);
    }
  }, []);

  // Image carousel functionality
  const nextImage = () => {
    setCurrentImage((prevImage) => (prevImage === images.length - 1 ? 0 : prevImage + 1));
  };

  const prevImage = () => {
    setCurrentImage((prevImage) => (prevImage === 0 ? images.length - 1 : prevImage - 1));
  };

  useEffect(() => {
    const imageInterval = setInterval(nextImage, 5000); // Change image every 5 seconds
    return () => clearInterval(imageInterval);        
  }, []);

  return (
    <div className="homepage-container">
      <div className="background-section">
        <video autoPlay muted ref={videoRef} className="background-video">
          <source src={ustbg} type="video/mp4" />     
          Your browser does not support the video tag.
        </video>
      </div>

      {showLoginMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg z-50">
          <p>Login success!</p>
        </div>
      )}

      <div className="carousel-container" data-aos="fade-up">
        <button className="carousel-button prev" onClick={prevPage}>❮</button>
        <div className={`carousel-content ${fade ? 'fade' : ''}`}>
          {currentPage === 0 ? (
            <div className="carousel-page">
              <div className="square-container">      
                <div className="square-item">
                  <div className="logo userprofile-logo"></div> {/* Add a specific class for the survey logo */}  
                  <h3>Profile</h3>
                  <button onClick={() => navigate('/user-userprofile')}>Go to Profile</button>
                </div>
                <div className="square-item">
                  <div className="logo survey-logo"></div> {/* Add a specific class for the survey logo */}       
                  <h3>Survey</h3>
                  <button onClick={() => navigate('/user-survey')}>Take Survey</button>
                </div>
                <div className="square-item">
                  <div className="logo threads-logo"></div> {/* Add a specific class for the survey logo */}      
                  <h3>Threads</h3>
                  <button onClick={() => navigate('/user-threads')}>View Threads</button>
                </div>
                <div className="square-item">
                  <div className="logo alumni-logo"></div> {/* Add a specific class for the survey logo */}       
                  <h3>Alumni</h3>
                  <button onClick={() => navigate('/user-alumni')}>Alumni Network</button>
                </div>
                <div className="square-item">
                  <div className="logo chatbot-logo"></div> {/* Add a specific class for the survey logo */}      
                  <h3>Chatbot</h3>
                  <button onClick={() => navigate('/user-chatbot')}>Chat with Us</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="carousel-page">
              <div className="square-container">      
                <div className="square-item">
                  <div className="logo companies-logo"></div> {/* Add a specific class for the survey logo */}    
                  <h3>Companies</h3>
                  <button onClick={() => navigate('/user-companies')}>View Companies</button>
                </div>
                <div className="square-item">
                  <div className="logo newsevents-logo"></div> {/* Specific class for the news/events logo */}
                  <h3>News/Events</h3>
                  <div className="dropdown">
                    <button className="dropdown-button">View News/Events</button>
                    <div className="dropdown-content">
                      <button onClick={() => navigate('/user-news')}>News</button>
                      <button onClick={() => navigate('/user-events')}>Events</button>
                    </div>
                  </div>
                </div>
                <div className="square-item">
                  <div className="logo certifications-logo"></div> {/* Add a specific class for the survey logo */}
                  <h3>Certifications</h3>
                  <button onClick={() => navigate('/user-certifications')}>View Certifications</button>
                </div>
                <div className="square-item">
                  <div className="logo documents-logo"></div> {/* Add a specific class for the survey logo */}    
                  <h3>Documents</h3>
                  <button onClick={() => navigate('/user-documentrequest')}>View Documents</button>
                </div>
                <div className="square-item">
                  <div className="logo jobs-logo"></div> {/* Add a specific class for the survey logo */}
                  <h3>Job/Internship</h3>
                  <button onClick={() => navigate('/user-job')}>View Jobs/Internships</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <button className="carousel-button next" onClick={nextPage}>❯</button>
      </div>

      <div className="mission-vision-section fixed-height" data-aos="fade-up">
        <div className="mission-vision-content">
          <h2 className="mission-title">Our Mission</h2>    
          <p className="mission-text">
            To cultivate a community that fosters growth, innovation, and collaboration among alumni and students, inspiring them to achieve their fullest potential and contribute positively to society.
          </p>
          <h2 className="vision-title">Our Vision</h2>      
          <p className="vision-text">
            To be a leading alumni network that empowers individuals to connect, share knowledge, and create impactful solutions for a better future.
          </p>
        </div>
        <div className="image-carousel-container">
          <button className="carousel-button prev" onClick={prevImage}>❮</button>
          <div className="carousel-images">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`carousel-${index}`}
                className={`carousel-image ${currentImage === index ? "active" : ""}`}
              />
            ))}
          </div>
          <button className="carousel-button next" onClick={nextImage}>❯</button>

          <div className="carousel-indicators">
            {images.map((_, index) => (
              <span
                key={index}
                className={`indicator ${currentImage === index ? "active" : ""}`}
                onClick={() => setCurrentImage(index)}    
              ></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
