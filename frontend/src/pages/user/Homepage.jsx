import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import ustbg from "../../assets/ustbg.mp4";
import homepage1 from "../../assets/homepage1.jpg";
import homepage2 from "../../assets/homepage2.jpg";
import homepage3 from "../../assets/homepage3.jpg";

const Homepage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [fade, setFade] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const images = [homepage1, homepage2, homepage3];
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    const messageShown = sessionStorage.getItem("loginMessageShown");

    if (storedLoginStatus === "true" && messageShown !== "true") {
      setShowLoginMessage(true);
      sessionStorage.setItem("loginMessageShown", "true");
      setTimeout(() => setShowLoginMessage(false), 5000);
    }
  }, []);

  const nextPage = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentPage((prevPage) => (prevPage === 1 ? 0 : prevPage + 1));
      setFade(false);
    }, 500);
  };

  const prevPage = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentPage((prevPage) => (prevPage === 0 ? 1 : prevPage - 1));
      setFade(false);
    }, 500);
  };

  const nextImage = () => {
    setCurrentImage((prevImage) =>
      prevImage === images.length - 1 ? 0 : prevImage + 1
    );
  };

  const prevImage = () => {
    setCurrentImage((prevImage) =>
      prevImage === 0 ? images.length - 1 : prevImage - 1
    );
  };

  useEffect(() => {
    const imageInterval = setInterval(nextImage, 5000);
    return () => clearInterval(imageInterval);
  }, []);

  return (
    <div className="homepage-container">
      <div
        className="background-section"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <video autoPlay muted ref={videoRef} className="background-video">
          <source src={ustbg} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            fontSize: "14px",
            zIndex: "20",
          }}
        >
          Photo Courtesy of UST SITE
        </div>
      </div>

      {showLoginMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg z-50">
          <p>Login success!</p>
        </div>
      )}

      <div className="carousel-container" data-aos="fade-up">
        <button className="carousel-button prev" onClick={prevPage}>
          ❮
        </button>
        <div className={`carousel-content ${fade ? "fade" : ""}`}>
          {currentPage === 0 ? (
            <div className="carousel-page">
              <div className="square-container">
                {["Profile", "Survey", "Threads", "Alumni", "Chatbot"].map(
                  (item, index) => (
                    <div className="square-item" key={index}>
                      <div className={`logo ${item.toLowerCase()}-logo`}></div>
                      <h3>{item}</h3>
                      <button
                        onClick={() => navigate(`/user-${item.toLowerCase()}`)}
                      >
                        Go to {item}
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="carousel-page">
              <div className="square-container">
                {[
                  "Companies",
                  "News/Events",
                  "Certifications",
                  "Documents",
                  "Jobs/Internship",
                ].map((item, index) => (
                  <div className="square-item" key={index}>
                    <div
                      className={`logo ${item
                        .toLowerCase()
                        .replace(/\/.+/, "")}-logo`}
                    ></div>
                    <h3>{item}</h3>
                    <button
                      onClick={() =>
                        navigate(
                          `/user-${item.toLowerCase().replace(/\/.+/, "")}`
                        )
                      }
                    >
                      View {item}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button className="carousel-button next" onClick={nextPage}>
          ❯
        </button>
      </div>

      <div className="mission-vision-section" data-aos="fade-up">
        <div className="mission-vision-content">
          <h2 className="mission-title">Our Mission</h2>
          <p className="mission-text">
            To cultivate a community that fosters growth, innovation, and
            collaboration among alumni and students, inspiring them to achieve
            their fullest potential and contribute positively to society.
          </p>
          <h2 className="vision-title">Our Vision</h2>
          <p className="vision-text">
            To be a leading alumni network that empowers individuals to connect,
            share knowledge, and create impactful solutions for a better future.
          </p>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          maxHeight: "400px",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={prevImage}
          style={{
            position: "absolute",
            top: "50%",
            left: "10px",
            fontSize: "2em",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          ❮
        </button>
        <img
          src={images[currentImage]}
          alt="Placeholder"
          style={{ width: "100%", height: "auto", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            fontSize: "14px",
            zIndex: "20",
          }}
        >
          {currentImage === 0
            ? "Photo Courtesy of UST ICS"
            : currentImage === 1
            ? "Photo Courtesy of UST ICS"
            : "Photo Courtesy of UST CSS"}
        </div>
        <button
          onClick={nextImage}
          style={{
            position: "absolute",
            top: "50%",
            right: "10px",
            fontSize: "2em",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          ❯
        </button>
      </div>
    </div>
  );
};

export default Homepage;
