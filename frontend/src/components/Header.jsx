import React from "react";
import cicslogo from "../assets/cicslogo.png";
import alumniconnectlogo from "../assets/alumniconnectlogo.png";

const Header = () => {
  return (
    <header className="bg-hgray w-full mx-auto md:px-12 py-3 flex items-center justify-between px-2">
      {/* Left Side */}
      <div className="flex items-center">
        <img
          src={cicslogo}
          alt="CICS Logo"
          className="h-11  mr-6 ml-4 md:h-16"
        />
        <div className="col">
          <p className="text-black font-light italic text-end text-xxs mt-1 md:text-xs  ">
            University of Santo Tomas
          </p>
          <p className="text-black font-bold italic text-xs md:text-sm mb-1">
            College of Information and Computing Sciences
          </p>
        </div>
      </div>
      <img
        src={alumniconnectlogo}
        alt="Alumni Connect Logo"
        className="h-11 ml-5 mr-4 md:h-16"
      />
    </header>
  );
};

export default Header;
