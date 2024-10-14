import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4">
      <div className="bg-red p-2 sm:p-9 md:p-10 rounded-lg shadow-xl text-center text-white max-w-sm md:max-w-md w-full">
        <h1 className=" text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4">
          Oops!
        </h1>
        <p className="text-md sm:text-lg md:text-2xl mb-4">
          Something went wrong.
        </p>
        <p className="text-sm md:text-lg mb-6">
          We can't seem to find the page you're looking for.
        </p>
        <button
          onClick={goBack}
          className="px-4 py-2 md:px-8 md:py-3 bg-white text-red font-semibold rounded-full shadow hover:bg-gray-100 transition duration-300"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
