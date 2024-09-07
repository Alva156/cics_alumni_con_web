import React from "react";
import ustlogo from "../assets/ustlogo.png";
import cicslogo from "../assets/cicslogo.png";

const Header = () => {
  return (
    <header className="bg-hgray w-full mx-auto md:px-12 py-3 flex items-center justify-between px-2">
      <div className="flex items-center">
        <img src={ustlogo} alt="UST Logo" className="h-11  mr-6 ml-4 md:h-16" />
        <div className="col">
          <p className="text-black font-light italic text-end text-xxs mt-1 md:text-xs  ">
            University of Santo Tomas
          </p>
          <p className="text-black font-bold italic text-end text-[0.4rem] mb-2 md:text-xs  ">
            College of Information and Computing Sciences
          </p>
        </div>
        <p className="text-black text-3xl font-light ml-0.5 mb-1 md:text-4xl md:ml-2">
          |
        </p>
        <p className="text-black font-light text-sm md:text-2xl  ml-2 mr-2 header-text">
          Alumni Connect
        </p>
      </div>
      <img src={cicslogo} alt="CICS Logo" className="h-11 ml-5 mr-4 md:h-16" />
    </header>
  );
};

export default Header;
