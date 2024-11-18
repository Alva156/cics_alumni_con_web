import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import ustbg from "../../assets/adminhomepage.mp4";
import "../../AdminHomepage.css";
import homepage1 from "../../assets/homepage1.jpg";
import homepage2 from "../../assets/homepage2.jpg";
import homepage3 from "../../assets/homepage3.jpg";
import dashboard2 from "../../assets/dashboard2.jpg";
import reports2 from "../../assets/reports2.jpg";
import axios from "axios";
import { Link } from "react-router-dom";

const AdminHomepage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [fade, setFade] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const videoRef = useRef(null);
  const navigate = useNavigate();

  const images = [homepage1, homepage2, homepage3];
  const credits = [
    "Photo Courtesy of ICS",
    "Photo Courtesy of ICS",
    "Photo Courtesy of CSS",
  ];

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    fetchNews();
    fetchEvents();

    // Automatic image carousel transition
    const imageInterval = setInterval(() => {
      nextImage();
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(imageInterval); // Clear interval on component unmount
  }, []);

  const fetchNews = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    try {
      const response = await axios.get(`${backendUrl}/news/view`, {
        withCredentials: true,
      });
      setNews(response.data);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  const fetchEvents = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    try {
      const response = await axios.get(`${backendUrl}/events/view`, {
        withCredentials: true,
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

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

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo(0, 0); // Scroll to the top of the page
  };

  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    const messageShown = sessionStorage.getItem("loginMessageShown");

    setIsLoggedIn(storedLoginStatus === "true");

    if (storedLoginStatus === "true" && messageShown !== "true") {
      setShowLoginMessage(true);
      sessionStorage.setItem("loginMessageShown", "true");

      setTimeout(() => {
        setShowLoginMessage(false);
      }, 5000);
    }
  }, []);

  return (
    <div className="homepage-wrapper">
      {showLoginMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green text-white p-4 rounded-lg shadow-lg z-50">
          <p>Login success!</p>
        </div>
      )}
      <div className="homepage-container">
        <div className="background-news-container">
          {/* Background Video Section */}
          <div className="background-section">
            <video
              autoPlay
              muted
              ref={videoRef}
              className="background-video"
              playsInline
            >
              <source src={ustbg} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="video-footer">Photo Courtesy of UST SITE</div>
          </div>

          {/* Dashboard and Reports Section */}
          <div className="news-events-section">
            {/* Dashboard */}
            <div className="news-carousel-container" data-aos="fade-up">
              <h2 className="news-title">
                <Link to="/admin/dashboard" className="news-link">
                  Admin Dashboard
                </Link>
              </h2>

              <div className="carousel-wrapper">
                <ul className="news-item">
                  <li className="item">
                    <img
                      src={dashboard2}
                      alt="Dashboard"
                      className="news-image"
                    />
                    <div className="news-content">
                      <p className="news-description">
                        Offers key tools and insights for managing the system
                        efficiently.
                      </p>
                      <button
                        style={{
                          marginTop: "10px",
                          padding: "5px 10px",
                          backgroundColor: "#be142e",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "background-color 0.3s",
                        }}
                        onClick={() => handleNavigation("/admin/dashboard")}
                        onMouseOver={(e) =>
                          (e.target.style.backgroundColor = "#232323")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.backgroundColor = "#be142e")
                        }
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Reports */}
            <div className="events-carousel-container" data-aos="fade-up">
              <h2 className="events-title">
                <Link to="/admin/reports" className="events-link">
                  Admin Reports
                </Link>
              </h2>

              <div className="carousel-wrapper">
                <ul className="events-item">
                  <li className="item">
                    <img
                      src={reports2}
                      alt="Reports"
                      className="events-image"
                    />
                    <div className="events-content">
                      <p className="events-description">
                        Provides a summary of alumni data and activities.
                      </p>
                      <button
                        style={{
                          marginTop: "10px",
                          padding: "5px 10px",
                          backgroundColor: "#be142e",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "background-color 0.3s",
                        }}
                        onClick={() => handleNavigation("/admin/reports")}
                        onMouseOver={(e) =>
                          (e.target.style.backgroundColor = "#232323")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.backgroundColor = "#be142e")
                        }
                      >
                        Go to Reports
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="carousel-container" data-aos="fade-up">
          <button className="carousel-button prev" onClick={prevPage}>
            ❮
          </button>
          <div className={`carousel-content ${fade ? "fade" : ""}`}>
            {currentPage === 0 ? (
              <div className="carousel-page">
                <div className="square-container">
                  <div className="square-item">
                    <div className="logo companies-logo"></div>
                    <h3>Companies</h3>
                    <button
                      onClick={() => handleNavigation("/admin/companies")}
                    >
                      Manage Companies
                    </button>
                  </div>
                  <div className="square-item">
  <div className="logo newsevents-logo"></div>
  <h3>News/Events</h3>
  <div className="buttons-container">
    <button
      className="news-button"
      onClick={() => handleNavigation("/admin/news")}
    >
      News
    </button>
    <button
      className="events-button"
      onClick={() => handleNavigation("/admin/events")}
    >
      Events
    </button>
  </div>
</div>
                  <div className="square-item">
                    <div className="logo certifications-logo"></div>
                    <h3>Certifications</h3>
                    <button
                      onClick={() => handleNavigation("/admin/certifications")}
                    >
                      Manage Certifications
                    </button>
                  </div>
                  <div className="square-item">
                    <div className="logo documents-logo"></div>
                    <h3>Documents</h3>
                    <button
                      onClick={() => handleNavigation("/admin/documentrequest")}
                    >
                      Manage Documents
                    </button>
                  </div>
                  <div className="square-item">
                    <div className="logo jobs-logo"></div>
                    <h3>Job/Internship</h3>
                    <button onClick={() => handleNavigation("/admin/job")}>
                      Manage Job/Internship
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="carousel-page">
                <div className="square-container">
                  <div className="square-item">
                    <div className="logo userprofile-logo"></div>
                    <h3>Dashboard</h3>
                    <button
                      onClick={() => handleNavigation("/admin/dashboard")}
                    >
                      Go to Dashboard
                    </button>
                  </div>
                  <div className="square-item">
                    <div className="logo survey-logo"></div>
                    <h3>Survey</h3>
                    <button
                      onClick={() => handleNavigation("/admin/surveytool")}
                    >
                      Manage Survey
                    </button>
                  </div>
                  <div className="square-item">
                    <div className="logo threads-logo"></div>
                    <h3>Threads</h3>
                    <button onClick={() => handleNavigation("/admin/threads")}>
                      Manage Threads
                    </button>
                  </div>
                  <div className="square-item">
                    <div className="logo alumni-logo"></div>
                    <h3>Alumni</h3>
                    <button onClick={() => handleNavigation("/admin/alumni")}>
                      View Alumni
                    </button>
                  </div>
                  <div className="square-item">
                    <div className="logo reports-logo"></div>
                    <h3>Reports</h3>
                    <button onClick={() => handleNavigation("/admin/reports")}>
                      View Reports
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button className="carousel-button next" onClick={nextPage}>
            ❯
          </button>
        </div>

        <div className="mission-vision-section fixed-height" data-aos="fade-up">
          <div className="mission-vision-content">
            <h2 className="mission-title">Our Mission</h2>
            <p className="mission-text">
              To cultivate a community that fosters growth, innovation, and
              collaboration among alumni and students, inspiring them to achieve
              their fullest potential and contribute positively to society.
            </p>
            <h2 className="vision-title">Our Vision</h2>
            <p className="vision-text">
              To be a leading alumni network that empowers individuals to
              connect, share knowledge, and create impactful solutions for a
              better future.
            </p>
          </div>
          <div className="image-carousel-container">
            <button className="carousel-button prev" onClick={prevImage}>
              ❮
            </button>
            <div className="carousel-images">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`carousel-image ${
                    currentImage === index ? "active" : ""
                  }`}
                >
                  <img
                    src={image}
                    alt={`carousel-${index}`}
                    style={{
                      width: "100%", // Make sure image covers the width of the container
                      height: "100%", // Make sure image covers the height of the container
                      objectFit: "cover", // Cover the container without stretching
                    }}
                  />
                  <div
                    className="absolute bottom-4 right-4 bg-black text-white text-sm p-2 rounded"
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
                      textAlign: "right",
                      objectFit: "fill",
                    }}
                  >
                    {credits[index]}{" "}
                    {/* Display the credit based on the current index */}
                  </div>
                </div>
              ))}
            </div>
            <button className="carousel-button next" onClick={nextImage}>
              ❯
            </button>

            <div className="carousel-indicators">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`indicator ${
                    currentImage === index ? "active" : ""
                  }`}
                  onClick={() => setCurrentImage(index)}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomepage;
