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
    <div style={{ paddingTop: "12px", paddingRight: "45px", paddingLeft: "45px" }}>
      <div className="homepage-container" style={{ display: "flex" }}>
        <div className="background-news-container" style={{ display: "flex", width: "100%" }}>
          {/* Background Video Section */}
          <div className="background-section" style={{ position: "relative", width: "60%", marginTop: "30px", height: "865px" }}>
            <video
              autoPlay
              muted
              ref={videoRef}
              className="background-video"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            >
              <source src={ustbg} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute" style={{ position: "absolute", bottom: "20px", right: "20px", backgroundColor: "rgba(0, 0, 0, 0.4)", color: "white", padding: "10px", borderRadius: "5px", zIndex: "20", textAlign: "right" }}>
              Photo Courtesy of UST SITE
            </div>
          </div>

          {/* News and Events Carousel Section */}
          <div style={{ width: "40%", display: "flex", flexDirection: "column", padding: "20px", flexShrink: 0 }}>
            {/* News Carousel */}
            <div className="news-carousel-container" data-aos="fade-up" style={{ position: "relative", maxWidth: "600px" }}>
            <h2 className="text-2xl font-medium mb-4">
  <Link to="/user-news" className="text-gray-700 hover:text-red-500 hover:underline">
    Latest News
  </Link>
</h2>

              <div className="flex justify-center items-center">
                {news.length > 0 && (
                  <div className={`bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow ${fade ? "slide-out" : ""}`} style={{ height: "380px", width: "100%", position: "relative" }}>
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${news[currentNewsIndex].image}`}
                      alt={news[currentNewsIndex].name}
                      style={{ height: "240px", width: "100%", objectFit: "cover" }}
                      className="w-full object-cover rounded-t-lg mb-1"
                    />
                    <div className="p-3">
                      <div className="text-md font-semibold text-gray-800 mb-2 overflow-hidden text-ellipsis">
                        {news[currentNewsIndex].name}
                      </div>
                      <p className="text-sm text-gray-600 mb-4 overflow-hidden" style={{ maxHeight: "40px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {news[currentNewsIndex].description.slice(0, 100)}...
                      </p>
                      <a href="#" style={{ color: "#be142e" }} className="text-sm font-medium hover:underline" onClick={() => handleNavigation(`/user-news?id=${news[currentNewsIndex]._id}`)}>
                        Read More
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                <button className="carousel-button prev" onClick={prevNews}>
                  ❮
                </button>
              </div>
              <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                <button className="carousel-button next" onClick={nextNews}>
                  ❯
                </button>
              </div>
            </div>

            {/* Events Carousel Section */}
            <div className="events-carousel-container" data-aos="fade-up" style={{ position: "relative", maxWidth: "600px", marginTop: "20px" }}>
            <h2 className="text-2xl font-medium mb-4">
  <Link to="/user-events" className="text-gray-700 hover:text-red-500 hover:underline">
    Upcoming Events
  </Link>
</h2>
              <div className="flex justify-center items-center">
                {events.length > 0 && (
                  <div className={`bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow ${fade ? "slide-out" : ""}`} style={{ height: "380px", width: "100%", position: "relative" }}>
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${events[currentEventsIndex].image}`}
                      alt={events[currentEventsIndex].name}
                      style={{ height: "240px", width: "100%", objectFit: "cover" }}
                      className="w-full object-cover rounded-t-lg mb-1"
                    />
                    <div className="p-3">
                      <div className="text-md font-semibold text-gray-800 mb-2 overflow-hidden text-ellipsis">
                        {events[currentEventsIndex].name}
                      </div>
                      <p className="text-sm text-gray-600 mb-4 overflow-hidden" style={{ maxHeight: "40px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {events[currentEventsIndex].description.slice(0, 100)}...
                      </p>
                      <a href="#" style={{ color: "#be142e" }} className="text-sm font-medium hover:underline" onClick={() => handleNavigation(`/user-events?id=${events[currentEventsIndex]._id}`)}>
                        Read More
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                <button className="carousel-button prev" onClick={prevEvent}>
                  ❮
                </button>
              </div>
              <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                <button className="carousel-button next" onClick={nextEvent}>
                  ❯
                </button>
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
