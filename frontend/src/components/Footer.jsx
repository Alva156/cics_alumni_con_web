import React from "react";
import footerimage from "../assets/ustfooter.jpg";
import {
  FaRegCopyright,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = () => {
  // State to manage visibility of Quick Links
  const [showQuickLinks, setShowQuickLinks] = React.useState(true);

  // Effect to update visibility based on screen size
  React.useEffect(() => {
    const handleResize = () => {
      setShowQuickLinks(window.innerWidth >= 768); // Show Quick Links on wider screens
    };

    // Initial check
    handleResize();

    // Event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <footer className="relative text-white print:hidden">
      <div
        className="relative"
        style={{
          backgroundImage: `url(${footerimage})`,
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
            <h3 className="font-bold text-3xl">
              UST CICS | <span className="italic">Alumni</span>
            </h3>
            <address className="mt-4 not-italic text-gray-200">
              UST Blessed Pier Giorgio Frassati Building <br />
              España Blvd, Sampaloc, Manila <br />
              1000 Metro Manila
            </address>
            <div className="mt-4">
            <h4 className="font-semibold text-lg text-gray-300">
                Connect with Us:
              </h4>
              <div className="flex space-x-4 mt-2">
              <a
  href="https://www.facebook.com/UST1611official"
  target="_blank"
  rel="noopener noreferrer"
  className="hover:text-gray-300 transform hover:scale-110 transition duration-300"
>
                  <FaFacebookF />
                </a>
                <a
  href="https://x.com/UST1611official"
  target="_blank"
  rel="noopener noreferrer"
  className="hover:text-gray-300 transform hover:scale-110 transition duration-300"
>
                  <FaTwitter />
                </a>
                <a
  href="https://www.instagram.com/ust1611official/"
  target="_blank"
  rel="noopener noreferrer"
  className="hover:text-gray-300 transform hover:scale-110 transition duration-300"
>
                  <FaInstagram />
                </a>
                <a
  href="https://www.linkedin.com/school/u-of-santo-tomas/"
  target="_blank"
  rel="noopener noreferrer"
  className="hover:text-gray-300 transform hover:scale-110 transition duration-300"
>
                  <FaLinkedinIn />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Additional Links */}
          {showQuickLinks && ( // Conditional rendering based on screen width
            <div className="mb-6 text-right w-full md:w-1/2">
              <h4 className="font-semibold text-lg text-gray-300">
                Quick Links:
              </h4>
              <ul className="space-y-2 mt-2">
                <li>
                  <a
                    href="https://alumnirelations.ust.edu.ph/"
                    className="hover:text-gray-200 hover:underline transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    UST Office of Alumni Relations
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ust.edu.ph/"
                    className="hover:text-gray-200 hover:underline transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    UST Website Homepage
                  </a>
                </li>
                <li>
                  <a
                    href="/user-userprofile"
                    className="hover:text-gray-200 hover:underline transition-colors duration-300"
                  >
                    My Alumni Account
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ust.edu.ph/information-and-computing-sciences/"
                    className="hover:text-gray-200 hover:underline transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    UST CICS Info
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="bg-[#1a1a1a] text-gray-400 py-6 text-center text-sm">
        <div className="flex justify-center items-center mb-2">
          <p>
          © 2024. University of Santo Tomas. College of Information and
            Computing Sciences.
          </p>
        </div>

        <p className="mb-2 text-xs text-gray-500 font-light">
          Logos and images used with permission from the CICS Office and
          organizations.
        </p>

        <p className="text-xs">
          Developers: Andrei Cimoune Alvarico, Alessandra Claire Cruz, James
          Lorenz Santos, Denise Anne Valdivieso
        </p>
      </div>
    </footer>
  );
};

export default Footer;
