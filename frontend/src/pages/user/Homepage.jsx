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
  const [autoSlideNews, setAutoSlideNews] = useState(true);
  const [autoSlideEvents, setAutoSlideEvents] = useState(true);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const newsCarouselRef = useRef(null); // Reference for news carousel
  const eventsCarouselRef = useRef(null); // Reference for events carousel
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

const toggleDropdown = () => {
  setDropdownVisible(!dropdownVisible); // Toggle dropdown visibility
};


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

  useEffect(() => {
    // Automatically slide news every 3 seconds
    const autoSlide = setInterval(() => {
      if (autoSlideNews) {
        nextNews();
      }
    }, 3000); // 3 seconds

    return () => clearInterval(autoSlide); // Cleanup on unmount
  }, [autoSlideNews, news]);

  useEffect(() => {
    // Automatically slide events every 3 seconds
    const autoSlideInterval = setInterval(() => {
      if (autoSlideEvents) {
        nextEvent();
      }
    }, 3000); // 3 seconds

    return () => clearInterval(autoSlideInterval); // Cleanup on unmount
  }, [autoSlideEvents, events]);

  useEffect(() => {
    const handleVideoFullScreen = () => {
      const videoElement = videoRef.current;
      if (videoElement) {
        // Prevent full-screen on mobile devices
        if (window.innerWidth <= 768) {
          videoElement.removeAttribute("controlsList"); // Remove fullscreen control
        }
      }
    };

    window.addEventListener("resize", handleVideoFullScreen);
    handleVideoFullScreen(); // Call it initially

    return () => {
      window.removeEventListener("resize", handleVideoFullScreen);
    };
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
    setCurrentNewsIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % news.length; // Use modulus for infinite loop
      slideTo(nextIndex, newsCarouselRef);
      return nextIndex;
    });
    handleManualSlide("news");
  };

  const prevNews = () => {
    setCurrentNewsIndex((prevIndex) => {
      const prevIndexValue = (prevIndex - 1 + news.length) % news.length; // Modulus for wrapping around
      slideTo(prevIndexValue, newsCarouselRef);
      return prevIndexValue;
    });
    handleManualSlide("news");
  };

  const nextEvent = () => {
    setCurrentEventsIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % events.length; // Use modulus for infinite loop
      slideTo(nextIndex, eventsCarouselRef);
      return nextIndex;
    });
    handleManualSlide("events");
  };

  const prevEvent = () => {
    setCurrentEventsIndex((prevIndex) => {
      const prevIndexValue = (prevIndex - 1 + events.length) % events.length; // Modulus for wrapping around
      slideTo(prevIndexValue, eventsCarouselRef);
      return prevIndexValue;
    });
    handleManualSlide("events");
  };

  const slideTo = (index, carouselRef) => {
    const carousel = carouselRef.current;
    const scrollAmount = index * carousel.clientWidth; // Slide by one card
    carousel.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  const handleManualSlide = (type) => {
    // Stop auto sliding
    if (type === "news") {
      setAutoSlideNews(false);
      setTimeout(() => {
        setAutoSlideNews(true); // Resume auto sliding
      }, 10000); // 10 seconds delay
    } else if (type === "events") {
      setAutoSlideEvents(false);
      setTimeout(() => {
        setAutoSlideEvents(true); // Resume auto sliding
      }, 10000); // 10 seconds delay
    }
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
              playsInline // Ensures the video doesn't go fullscreen on iOS
            >
              <source src={ustbg} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="video-footer">Photo Courtesy of UST SITE</div>
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
                <ul className="carousel-news" ref={newsCarouselRef}>
                  {news.map((item, index) => (
                    <li className="item" key={index}>
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${item.image}`}
                        alt={item.name}
                        className="news-image"
                      />
                      <div className="news-content">
                        <div className="carousel-news-title">{item.name}</div>
                        <p className="news-description">
                          {item.description.slice(0, 30)}...
                        </p>
                        <a
                          href="#"
                          className="read-more-link"
                          onClick={() =>
                            handleNavigation(
                              `/user-news?id=${news[currentNewsIndex]._id}`
                            )
                          }
                        >
                          Read More
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <button className="carousel-button prev" onClick={prevNews}>
                ❮
              </button>
              <button className="carousel-button next" onClick={nextNews}>
                ❯
              </button>
            </div>

            {/* Events Carousel */}
            <div className="events-carousel-container" data-aos="fade-up">
              <h2 className="events-title">
                <Link to="/user-events" className="events-link">
                  Upcoming Events
                </Link>
              </h2>

              <div className="carousel-wrapper">
                <ul className="carousel-events" ref={eventsCarouselRef}>
                  {events.map((item, index) => (
                    <li className="item" key={index}>
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${item.image}`}
                        alt={item.name}
                        className="events-image"
                      />
                      <div className="events-content">
                        <div className="carousel-events-title">{item.name}</div>
                        <p className="events-description">
                          {item.description.slice(0, 30)}...
                        </p>
                        <a
                          href="#"
                          className="read-more-link"
                          onClick={() =>
                            handleNavigation(
                              `/user-events?id=${events[currentEventsIndex]._id}`
                            )
                          }
                        >
                          Read More
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <button className="carousel-button prev" onClick={prevEvent}>
                ❮
              </button>
              <button className="carousel-button next" onClick={nextEvent}>
                ❯
              </button>
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
    <button className="dropdown-button" onClick={toggleDropdown}>
      View News/Events
    </button>
    {dropdownVisible && (
      <div className="dropdown-content">
        <button onClick={() => handleNavigation("/user-news")}>
          News
        </button>
        <button onClick={() => handleNavigation("/user-events")}>
          Events
        </button>
      </div>
    )}
  </div>
</div>

                  <div className="square-item">
                    <div className="logo certifications-logo"></div>
                    <h3>Certifications</h3>
                    <button
                      onClick={() => handleNavigation("/user-certifications")}
                    >
                      View Certifications
                    </button>
                  </div>
                  <div className="square-item">
                    <div className="logo documents-logo"></div>
                    <h3>Documents</h3>
                    <button
                      onClick={() => handleNavigation("/user-documentrequest")}
                    >
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
                    <button
                      onClick={() => handleNavigation("/user-userprofile")}
                    >
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
                    <h3>FAQs</h3>
                    <button onClick={() => handleNavigation("/user-chatbot")}>
                      Ask Questions
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

export default Homepage;
