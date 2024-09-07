import React from "react";
import { FaRegCopyright } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-fgray p-4 pb-16 pt-10 text-grayt text-xxs md:text-sm">
      <div className="ml-6">
        <aside className="mb-8 ml-2 md:ml-12">
          <p className="flex flex-wrap items-center">
            <FaRegCopyright className="flex items-center mr-1" />
            2024. University of Santo Tomas. College of Information and
            Computing Sciences.
          </p>
        </aside>
        <p className="ml-2 text-bgray text-xxs font-light mb-2 md:text-xs md:ml-12">
          Developers
        </p>
        <div className="flex flex-wrap gap-x-4 ml-2 md:ml-12 ">
          <div className="flex flex-col mr-6">
            <div className="mb-2">Andrei Alvarico</div>
            <div className="mb-2">Claire Cruz</div>
            <div className="mb-2">James Lorenz Santos</div>
            <div>Denise Anne Valdivieso</div>
          </div>
          <div className="flex flex-col">
            <div className="mb-2">andreicimoune.alvarico.cics@ust.edu.ph</div>
            <div className="mb-2">alessandraclaire.cruz.cics@ust.edu.ph</div>
            <div className="mb-2">jameslorenz.santos.cics@ust.edu.ph</div>
            <div>deniseanne.valdivieso.cics@ust.edu.ph</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
