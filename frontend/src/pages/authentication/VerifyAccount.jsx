import React from "react";
import Header from "../../components/Header";
import verifyaccountImage from "../../assets/verifyaccount_image.jpg";

function VerifyAccount() {
  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Left Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-start bg-white">
          <div className="flex flex-col justify-start h-full">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-6 mt-1 text-left">
                Welcome, CICS Alumni!
              </h1>
              <p className="text-left font-bold text-sm mb-3 md:text-base">
                Verify your account using the OTP code to be sent to your mobile
                number or personal email.
              </p>
              <p className="text-left text-sm md:text-base">
                Choose preferred platform to send OTP
              </p>
            </div>

            <button className="bg-[#3D3C3C] text-white text-lg py-2 px-6 w-64 mb-2 mt-0 transition duration-300 ease-in-out hover:bg-[#2C2C2C]">
              SMS
            </button>

            <button className="bg-[#3D3C3C] text-white text-lg py-2 px-6 w-64 mb-0 mt-0 transition duration-300 ease-in-out hover:bg-[#2C2C2C]">
              Email
            </button>

            <label className="block mb-2 mt-6 text-sm font-medium">
              Enter OTP
            </label>
            <input
              type="otp"
              className="mb-3 p-2 border border-black bg-[#D9D9D9] w-full"
              style={{ height: "40px" }}
            />

            <button className="bg-[#056E34] text-white text-lg py-2 px-6 w-64 mb-2 mt-0 transition duration-300 ease-in-out hover:bg-[#004A1C]">
              Confirm
            </button>

            <button className="bg-[#BE142E] text-white text-lg py-2 px-6 w-64 mb-2 transition duration-300 ease-in-out hover:bg-[#a10c2b]">
              Resend OTP
            </button>

            <button className="bg-[#C5C5C5] text-black text-lg py-2 px-6 w-64 transition duration-300 ease-in-out hover:bg-[#A8A8A8]">
              Cancel
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative w-full md:w-1/2 h-full flex-shrink-0 hidden md:block">
          <div className="absolute inset-0 bg-[#5D0000] opacity-30"></div>
          <img
            src={verifyaccountImage}
            alt="Verify Account illustration"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </>
  );
}

export default VerifyAccount;
