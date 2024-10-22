import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import ustbg from "../../assets/ustbg.mp4";
import "../../App.css";
import homepage1 from "../../assets/homepage1.jpg";
import homepage2 from "../../assets/homepage2.jpg";
import homepage3 from "../../assets/homepage3.jpg";
import axios from "axios";
import { Link } from "react-router-dom";


const Homepage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [fade, setFade] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [currentEventsIndex, setCurrentEventsIndex] = useState(0);
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

  const nextNews = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentNewsIndex((prevIndex) =>
        prevIndex === news.length - 1 ? 0 : prevIndex + 1
      );
      setFade(false);
    }, 500); // Transition timing
  };

  const prevNews = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentNewsIndex((prevIndex) =>
        prevIndex === 0 ? news.length - 1 : prevIndex - 1
      );
      setFade(false);
    }, 500); // Transition timing
  };

  const nextEvent = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentEventsIndex((prevIndex) =>
        prevIndex === events.length - 1 ? 0 : prevIndex + 1
      );
      setFade(false);
    }, 500); // Transition timing
  };

  const prevEvent = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentEventsIndex((prevIndex) =>
        prevIndex === 0 ? events.length - 1 : prevIndex - 1
      );
      setFade(false);
    }, 500); // Transition timing
  };

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo(0, 0); // Scroll to the top of the page
  };

  return (
    <div className="homepage-wrapper">
      <div className="homepage-container">
        <div className="background-news-container">
          {/* Background Video Section */}
          <div className="background-section">
            <video
              autoPlay
              muted
              ref={videoRef}
              className="background-video"
            >
              <source src={ustbg} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="video-footer">
              Photo Courtesy of UST SITE
            </div>
          </div>
  
          {/* News and Events Carousel Section */}
          <div className="news-events-section">
            {/* News Carousel */}
            <div className="news-carousel-container" data-aos="fade-up">
              <h2 className="news-title">
                <Link to="/user-news" className="news-link">
                  Latest News
                </Link>
              </h2>
  
              <div className="carousel-wrapper">
                {news.length > 0 && (
                  <div className="news-item">
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${news[currentNewsIndex].image}`}
                      alt={news[currentNewsIndex].name}
                      className="news-image"
                    />
                    <div className="news-content">
                      <div className="carousel-news-title">{news[currentNewsIndex].name}</div>
                      <p className="news-description">
                        {news[currentNewsIndex].description.slice(0, 30)}...
                      </p>
                      <a href="#" className="read-more-link" onClick={() => handleNavigation(`/user-news?id=${news[currentNewsIndex]._id}`)}>
                        Read More
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <button className="carousel-button prev" onClick={prevNews}>❮</button>
              <button className="carousel-button next" onClick={nextNews}>❯</button>
            </div>
  
            {/* Events Carousel Section */}
            <div className="events-carousel-container" data-aos="fade-up">
              <h2 className="events-title">
                <Link to="/user-events" className="events-link">
                  Upcoming Events
                </Link>
              </h2>
  
              <div className="carousel-wrapper">
                {events.length > 0 && (
                  <div className="events-item">
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${events[currentEventsIndex].image}`}
                      alt={events[currentEventsIndex].name}
                      className="events-image"
                    />
                    <div className="events-content">
                      <div className="carousel-events-title">{events[currentEventsIndex].name}</div>
                      <p className="events-description">
                        {events[currentEventsIndex].description.slice(0, 30)}...
                      </p>
                      <a href="#" className="read-more-link" onClick={() => handleNavigation(`/user-events?id=${events[currentEventsIndex]._id}`)}>
                        Read More
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <button className="carousel-button prev" onClick={prevEvent}>❮</button>
              <button className="carousel-button next" onClick={nextEvent}>❯</button>
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
                    <button onClick={() => handleNavigation("/user-companies")}>
  View Companies
</button>
                  </div>
                  <div className="square-item">
                    <div className="logo newsevents-logo"></div>
                    <h3>News/Events</h3>
                    <div className="dropdown">
                      <button className="dropdown-button">
                        View News/Events
                      </button>
                      <div className="dropdown-content">
                        <button onClick={() => handleNavigation("/user-news")}>
                          News
                        </button>
                        <button onClick={() => handleNavigation("/user-events")}>
                          Events
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="square-item">
                    <div className="logo certifications-logo"></div>
                    <h3>Certifications</h3>
                    <button onClick={() => handleNavigation("/user-certifications")}>
                      View Certifications
                    </button>
                  </div>
                  <div className="square-item">
                    <div className="logo documents-logo"></div>
                    <h3>Documents</h3>
                    <button onClick={() => handleNavigation("/user-documentrequest")}>
                      View Documents
                    </button>
                  </div>
                  <div className="square-item">
                    <div className="logo jobs-logo"></div>
                    <h3>Job/Internship</h3>
                    <button onClick={() => handleNavigation("/user-job")}>
                      View Jobs/Internships
                    </button>
                  </div>
                </div>
              </div>


) : (
              <div className="carousel-page">
                <div className="square-container">
                  <div className="square-item">
                    <div className="logo userprofile-logo"></div>
                    <h3>Profile</h3>
                    <button onClick={() => handleNavigation("/user-userprofile")}>
                      Go to Profile
                    </button>
                  </div>
                  <div className="square-item">
                    <div className="logo survey-logo"></div>
                    <h3>Survey</h3>
                    <button onClick={() => handleNavigation("/user-survey")}>
                      Take Survey
                    </button>
                  </div>
                  <div className="square-item">
                    <div className="logo threads-logo"></div>
                    <h3>Threads</h3>
                    <button onClick={() => handleNavigation("/user-threads")}>
                      View Threads
                    </button>
                  </div>
                  <div className="square-item">
                    <div className="logo alumni-logo"></div>
                    <h3>Alumni</h3>
                    <button onClick={() => handleNavigation("/user-alumni")}>
                      Alumni Network
                    </button>
                  </div>
                  <div className="square-item">
                    <div className="logo chatbot-logo"></div>
                    <h3>Chatbot</h3>
                    <button onClick={() => handleNavigation("/user-chatbot")}>
                      Chat with Us
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
                  <img src={image} alt={`carousel-${index}`} style={{
            width: "100%",        // Make sure image covers the width of the container
            height: "100%",       // Make sure image covers the height of the container
            objectFit: "cover",   // Cover the container without stretching
          }}/>
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

export default Homepage;
