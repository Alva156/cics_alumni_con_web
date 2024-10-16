import React from "react";
import { FaRegCopyright, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative text-white">
      <div
        className="relative"
        style={{
          backgroundImage: "url('/src/assets/ustfooter.jpg')", 
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "300px",
        }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a1a1a]"
          aria-hidden="true"
        ></div>

        <div className="relative z-10 px-10 md:px-20 py-10 flex flex-col md:flex-row justify-between">
          {/* Column 1: Contact Info */}
          <div className="mb-6 w-full md:w-1/2">
            <h3 className="font-bold text-3xl">UST CICS | <span className="italic">Alumni</span></h3>
            <address className="mt-4 not-italic text-gray-200">
              UST Blessed Pier Giorgio Frassati Building <br />
              España Blvd, Sampaloc, Manila <br />
              1000 Metro Manila
            </address>
            <div className="mt-4">
              <h4 className="font-semibold text-lg text-gray-300">Connect with Us:</h4>
              <div className="flex space-x-4 mt-2">
                <a href="#" className="hover:text-gray-300 transform hover:scale-110 transition duration-300">
                  <FaFacebookF />
                </a>
                <a href="#" className="hover:text-gray-300 transform hover:scale-110 transition duration-300">
                  <FaTwitter />
                </a>
                <a href="#" className="hover:text-gray-300 transform hover:scale-110 transition duration-300">
                  <FaInstagram />
                </a>
                <a href="#" className="hover:text-gray-300 transform hover:scale-110 transition duration-300">
                  <FaLinkedinIn />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Additional Links */}
          <div className="mb-6 text-right w-full md:w-1/2">
            <h4 className="font-semibold text-lg text-gray-300">Quick Links:</h4>
            <ul className="space-y-2 mt-2">
              <li>
                <a href="#" className="hover:text-gray-200 hover:underline transition-colors duration-300">
                  Access Alumni Member Card
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-200 hover:underline transition-colors duration-300">
                  Check Your Alumni Email
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-200 hover:underline transition-colors duration-300">
                  My Alumni Account
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-200 hover:underline transition-colors duration-300">
                  Give to UST
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="bg-[#1a1a1a] text-gray-400 py-6 text-center text-sm">
        <div className="flex justify-center items-center mb-2">
          <FaRegCopyright className="mr-1" />
          <p>2024. University of Santo Tomas. College of Information and Computing Sciences.</p>
        </div>
        <p className="text-xs">
          Developers: Andrei Cimoune Alvarico, Alessandra Claire Cruz, James Lorenz Santos, Denise Anne Valdivieso
        </p>
      </div>
    </footer>
  );
};

export default Footer;
