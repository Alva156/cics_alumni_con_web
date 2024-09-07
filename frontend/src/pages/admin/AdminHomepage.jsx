import React, { useState, useEffect } from "react";
import homepage1 from "../../assets/homepage1.jpg";
import homepage2 from "../../assets/homepage2.png";

function AdminHomepage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = [
    { src: homepage1, title: "", text: "Welcome to CICS Alumni Connect!" },
    {
      src: homepage2,
      title: "Mission Statement",
      text: "To foster a vibrant and connected community of CICS alumni by providing a digital platform that enables meaningful interactions, continuous professional growth, and lasting relationships. We strive to support our alumni in their career journeys and empower them to contribute positively to society and the future of CICS.",
    },
    {
      src: homepage2,
      title: "Vision Statement",
      text: "To be the leading platform that bridges the gap between past and present CICS students, cultivating a global network of professionals who are committed to lifelong learning, collaboration, and the advancement of their respective fields. We envision a future where every CICS alumnus feels connected, valued, and inspired to make a difference.",
    },
  ];
  const totalSlides = images.length;

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 20000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div>
      <div className="carousel relative bg-white m-6 max-w-full overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            width: `${totalSlides * 100}%`,
          }}
        >
          {images.map((image, index) => (
            <div className="relative w-full flex-shrink-0" key={index}>
              <img
                src={image.src}
                className="w-full object-cover h-48 sm:h-64 md:h-[22rem] lg:h-[26rem] xl:h-130 2xl:h-[44rem] transition-opacity duration-300 ease-in-out"
                alt={`Slide ${index + 1}`}
              />
              {/* Red opacity overlay for the first image */}
              {index === 0 && (
                <div className="absolute inset-0 bg-red opacity-40 "></div>
              )}

              <div
                className={`absolute inset-0 flex items-center justify-center text-center p-4 z-20 ${
                  index === 0
                    ? "bg-red-600 bg-opacity-70 text-white text-lg p-[4rem] sm:text-2xl  md:text-3xl lg:text-5xl xl:text-6xl font-bold p-6 rounded-lg"
                    : "bg-black bg-opacity-60 text-white text-xxs p-[4rem] sm:text-sm sm:p-24 md:text-lg md:p-28 lg:text-xl lg:p-40 xl:text-2xl xl:p-52 2xl:text-4xl 2xl:p-64 rounded-lg"
                }`}
              >
                <span>
                  <h2 className="mb-4 font-bold">{image.title}</h2>
                  {image.text}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute left-1 right-1 top-1/2 flex -translate-y-1/2 transform justify-between">
          <button
            onClick={prevSlide}
            className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-700 focus:outline-none text-xs md:text-sm lg:text-base xl:text-lg w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-18 m-2 md:m-3 lg:m-4 xl:m-5"
          >
            ❮
          </button>
          <button
            onClick={nextSlide}
            className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-700 focus:outline-none text-xs md:text-sm lg:text-base xl:text-lg w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-18 m-2 md:m-3 lg:m-4 xl:m-5"
          >
            ❯
          </button>
        </div>
      </div>
      <div className="relative bg-white m-6 max-w-full group">
        <img
          src={homepage2}
          alt="Homepage2"
          className="w-full object-cover h-48 sm:h-64 md:h-[22rem] lg:h-[26rem] xl:h-130 2xl:h-[44rem]"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="bg-red w-full h-full bg-opacity-70 text-white text-xxs p-16 sm:text-xs sm:p-24 md:text-lg md:p-28 lg:text-xl lg:p-40 xl:text-2xl xl:p-52 2xl:text-4xl 2xl:p-64 rounded-lg text-center">
            This page provides an overview of recorded data of CICS Alumni.
          </p>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center">
          <button
            onClick={() => (window.location.href = "/admin-dashboard")}
            className="homepage-text tracking-extra-wide font-light  hover:bg-[#2D2B2B] w-52 h-7 bg-[#2D2B2B] text-white rounded btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-32 sm:w-60 md:w-64 lg:w-96"
          >
            DASHBOARD
          </button>
        </div>
      </div>

      <div className="relative bg-white m-6 max-w-full group">
        <img
          src={homepage2}
          alt="Homepage2"
          className="w-full object-cover h-48 sm:h-64 md:h-[22rem] lg:h-[26rem] xl:h-130 2xl:h-[44rem]"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="bg-red w-full h-full bg-opacity-70 text-white text-xxs p-16 sm:text-xs sm:p-24 md:text-lg md:p-28 lg:text-xl lg:p-40 xl:text-2xl xl:p-52 2xl:text-4xl 2xl:p-64 rounded-lg text-center">
            This page is where you can create surveys that is to be answered by
            the registered CICS alumni of this website.
          </p>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center">
          <button
            onClick={() => (window.location.href = "/admin-surveytool")}
            className="homepage-text tracking-extra-wide font-light hover:bg-[#2D2B2B] w-52 h-7 bg-[#2D2B2B] text-white rounded btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-32 sm:w-60 md:w-64 lg:w-96"
          >
            SURVEY TOOL
          </button>
        </div>
      </div>
      <div className="relative bg-white m-6 max-w-full group">
        <img
          src={homepage2}
          alt="Homepage2"
          className="w-full object-cover h-48 sm:h-64 md:h-[22rem] lg:h-[26rem] xl:h-130 2xl:h-[44rem]"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="bg-red w-full h-full bg-opacity-70 text-white text-[0.45rem] p-16 sm:text-xs sm:p-24 md:text-lg md:p-28 lg:text-xl lg:p-40 xl:text-2xl xl:p-52 2xl:text-4xl 2xl:p-64 rounded-lg text-center">
            A dedicated space for alumni to engage in discussions, share
            experiences, and collaborate on various topics relevant to their
            field and network. This section fosters a sense of community and
            facilitates meaningful interactions among CICS alumni.
          </p>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center">
          <button
            onClick={() => (window.location.href = "/admin-threads")}
            className="homepage-text tracking-extra-wide font-light hover:bg-[#2D2B2B] w-52 h-7 bg-[#2D2B2B] text-white rounded btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-32 sm:w-60 md:w-64 lg:w-96"
          >
            THREADS
          </button>
        </div>
      </div>
      <div className="relative bg-white m-6 max-w-full  group">
        <img
          src={homepage2}
          alt="Homepage2"
          className="w-full object-cover h-52 sm:h-60 md:h-96 lg:h-[28rem] xl:h-130 2xl:h-[44rem]"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-red  bg-opacity-70 p-4 rounded-lg">
          <p className=" mb-32 text-white text-xxs  md:mb-36 lg:mb-48 sm:text-sm md:text-lg lg:text-xl xl:text-2xl 2xl:text-4xl text-center">
            Pages where you can create the latest companies, news, events,
            certifications, documents, and job/interviews that are related to
            CICS
          </p>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col space-y-4 pt-8">
          <div className="flex justify-between space-x-2">
            <button
              onClick={() => (window.location.href = "/admin-companies")}
              className="homepage-text tracking-extra-wide font-light hover:bg-[#2D2B2B] text-[0.7rem] w-36 h-7 bg-[#2D2B2B] text-white rounded btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-32 sm:w-60 md:w-64 lg:w-96"
            >
              Companies
            </button>
            <button
              onClick={() => (window.location.href = "/admin-news")}
              className="homepage-text tracking-extra-wide font-light hover:bg-[#2D2B2B] text-[0.7rem] w-36 h-7 bg-[#2D2B2B] text-white rounded btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-32 sm:w-60 md:w-64 lg:w-96"
            >
              News
            </button>
          </div>
          <div className="flex justify-between space-x-4">
            <button
              onClick={() => (window.location.href = "/admin-events")}
              className="homepage-text tracking-extra-wide font-light hover:bg-[#2D2B2B] text-[0.7rem] w-36 h-7 bg-[#2D2B2B] text-white rounded btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-32 sm:w-60 md:w-64 lg:w-96"
            >
              Events
            </button>
            <button
              onClick={() => (window.location.href = "/admin-certifications")}
              className="homepage-text tracking-extra-wide font-light hover:bg-[#2D2B2B]  text-[0.6rem] w-36 h-7 bg-[#2D2B2B] text-white rounded btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-32 sm:w-60 md:w-64 lg:w-96"
            >
              Certifications
            </button>
          </div>
          <div className="flex justify-between space-x-4">
            <button
              onClick={() => (window.location.href = "/admin-documentrequest")}
              className="homepage-text tracking-extra-wide font-light hover:bg-[#2D2B2B] text-[0.7rem] w-36 h-7 bg-[#2D2B2B] text-white rounded btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-32 sm:w-60 md:w-64 lg:w-96"
            >
              Documents
            </button>
            <button
              onClick={() => (window.location.href = "/admin-job")}
              className="homepage-text tracking-extra-wide font-light hover:bg-[#2D2B2B] text-[0.57rem] w-36 h-7 bg-[#2D2B2B] text-white rounded  btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-32 sm:w-60 md:w-64 lg:w-96"
            >
              Job/Internship
            </button>
          </div>
        </div>
      </div>

      <div className="relative bg-white m-6 max-w-full group">
        <img
          src={homepage2}
          alt="Homepage2"
          className="w-full object-cover h-48 sm:h-64 md:h-[22rem] lg:h-[26rem] xl:h-130 2xl:h-[44rem]"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="bg-red w-full h-full bg-opacity-70 text-white text-[0.48rem] p-16  sm:text-xs sm:p-24 md:text-lg md:p-28 lg:text-xl lg:p-40 xl:text-2xl xl:p-52 2xl:text-4xl 2xl:p-64 rounded-lg text-center">
            A page that lets users view and connect with registered CICS alumni.
            Search for profiles to see educational backgrounds, career details,
            and achievements, facilitating networking and engagement within the
            CICS community.
          </p>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center">
          <button
            onClick={() => (window.location.href = "/admin-alumni")}
            className="homepage-text tracking-extra-wide font-light  hover:bg-[#2D2B2B] w-52 h-7 bg-[#2D2B2B] text-white rounded btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-32 sm:w-60 md:w-64 lg:w-96"
          >
            ALUMNI
          </button>
        </div>
      </div>
      <div className="relative bg-white m-6 max-w-full group">
        <img
          src={homepage2}
          alt="Homepage2"
          className="w-full object-cover h-48 sm:h-64 md:h-[22rem] lg:h-[26rem] xl:h-130 2xl:h-[44rem]"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="bg-red w-full h-full bg-opacity-70 text-white text-[0.48rem] p-16 sm:text-xs sm:p-24 md:text-lg md:p-28 lg:text-xl lg:p-40 xl:text-2xl xl:p-52 2xl:text-4xl 2xl:p-64 rounded-lg text-center">
            This page presents detailed data on registered users, including
            primary, secondary, and contact information. It offers a
            comprehensive view of user details, helping to manage and analyze
            key information efficiently.
          </p>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center">
          <button
            onClick={() => (window.location.href = "/admin-reports")}
            className="homepage-text tracking-extra-wide font-light  hover:bg-[#2D2B2B] w-52 h-7 bg-[#2D2B2B] text-white rounded btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-32 sm:w-60 md:w-64 lg:w-96"
          >
            REPORTS
          </button>
        </div>
      </div>
      <div className="relative bg-white m-6 max-w-full group">
        <img
          src={homepage2}
          alt="Homepage2"
          className="w-full object-cover h-48 sm:h-64 md:h-[22rem] lg:h-[26rem] xl:h-130 2xl:h-[44rem]"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="bg-red w-full h-full bg-opacity-70 text-white text-xxs p-16 sm:text-xs sm:p-24 md:text-lg md:p-28 lg:text-xl lg:p-40 xl:text-2xl xl:p-52 2xl:text-4xl 2xl:p-64 rounded-lg text-center">
            A page that allows you to to update their email address and name.
          </p>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center">
          <button
            onClick={() => (window.location.href = "/admin-account")}
            className="homepage-text tracking-extra-wide font-light  hover:bg-[#2D2B2B] w-52 h-7 bg-[#2D2B2B] text-white rounded btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-32 sm:w-60 md:w-64 lg:w-96"
          >
            ACCOUNT
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminHomepage;
