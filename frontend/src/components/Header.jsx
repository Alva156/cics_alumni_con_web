import React from "react";
import alumniconnectlogo2 from "../assets/alumniconnectlogo2.png";
import cicslogo from "../assets/cicslogo.png";

const Header = () => {
  return (
    <header className="bg-hgray w-full mx-auto md:px-12 py-3 flex items-center justify-between px-2">
      {/* Left Side */}
      <div className="flex items-center">
        <img src={cicslogo} alt="UST Logo" className="h-11 mr-4 ml-4 md:h-16" />
        <div className="col mr-10">
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
        <div className="ml-2 mr-2">
          <img
            src={alumniconnectlogo2}
            alt="Alumni Connect Logo"
            className="w-20 h-11 md:h-16"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
