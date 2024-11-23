import React from "react";
import { Link } from "react-router-dom";
import alumniconnectlogo2 from "../assets/alumniconnectlogo2.png";
import cicslogo from "../assets/cicslogo.png";

const Header = () => {
  return (
    <header className="bg-hgray w-full mx-auto md:px-12 py-3 flex items-center justify-between px-2">
      {/* Left Side */}
      <div className="flex items-center">
        <Link to="/">
          {" "}
          <img
            src={cicslogo}
            alt="UST Logo"
            className="h-auto w-auto max-h-14 max-w-full md:max-h-16 mx-4"
          />
        </Link>
        <div className="col mr-2">
          <p className="text-black font-light italic text-xs md:text-sm mt-2">
            University of Santo Tomas
          </p>
          <p className="text-black font-bold italic text-xs md:text-sm mb-1">
            College of Information and Computing Sciences
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center">
        <div className="flex flex-col items-end">
          <p className="font-bold text-lg md:text-3xl text-right">
            <span className="text-[#2d2b2b]">Alumni</span>
            <span className="text-[#be142e]"> Connect</span>
          </p>
        </div>
        <Link to="/">
          {" "}
          <div className="ml-2 mr-2">
            <img
              src={alumniconnectlogo2}
              alt="Alumni Connect Logo"
              className="h-auto w-auto max-h-14 max-w-full md:max-h-16 mx-3"
            />
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
