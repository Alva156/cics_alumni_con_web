import React from "react";

function AdminAccount() {
  return (
    <>
      <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
        <div className="page-title mb-4">Account</div>
        <div className="py-1">
          <label className="pt-4 pb-2 text-sm">Email *</label>
          <input
            type="text"
            className="input input-sm input-bordered w-full h-10 mt-1 mb-4"
          />
        </div>

        <div className="py-1">
          <label className="pt-4 pb-2 text-sm">First Name *</label>
          <input
            type="text"
            className="input input-sm input-bordered w-full h-10 mt-1 mb-4"
            required
          />
        </div>

        <div className="py-1">
          <label className="pt-4 pb-2 text-sm">Last Name *</label>
          <input
            type="text"
            className="input input-sm input-bordered w-full h-10 mt-1 mb-4"
            required
          />
        </div>

        <div className="flex mt-8 space-x-3">
          <div className="">
            <button className="btn md:w-64 w-52 bg-[#E58008] text-white">
              Reset Password
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-16 space-x-3">
          <div className="">
            <button className="btn md:w-64 w-52 bg-fgray text-white">
              Cancel
            </button>
          </div>
          <div className="">
            <button className="btn md:w-64 w-52 bg-green text-white">
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminAccount;
