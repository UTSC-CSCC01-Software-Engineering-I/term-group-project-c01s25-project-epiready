import { Link } from "react-router-dom";
import NavbarLink from "./NavbarLink";

export default function Navbar({ currentPage }) {
  return (
    <nav className="w-screen flex justify-center items-center bg-black mt-0 h-16 border-b-1 border-neutral-600 drop-shadow-xl drop-shadow-neutral-700/40 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-600">
      <div className="w-9/10 sm:w-4/5 h-full flex gap-4 items-center">
        <Link
          to="/"
          className={`min-h-10 min-w-10 h-10 w-10 bg-[url('/src/assets/syringe.png')] bg-contain bg-no-repeat bg-center ${
            currentPage === "/" ? "" : "transition-all duration-200 hover:scale-110"
          }`}
        ></Link>
        <NavbarLink to="/shipments" currentPage={currentPage}>
          Shipments
        </NavbarLink>
        <NavbarLink to="/alerts" currentPage={currentPage}>
          Alerts
        </NavbarLink>
        <NavbarLink to="/track" currentPage={currentPage}>
          Track
        </NavbarLink>
        <NavbarLink to="/monitor" currentPage={currentPage}>
          Monitor
        </NavbarLink>
      </div>
    </nav>
  );
}