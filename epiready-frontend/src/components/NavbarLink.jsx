import { Link } from "react-router-dom";

export default function NavbarLink({ to, children, currentPage }) {
  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      <Link
        to={to}
        className={`text-white text-lg text-center ${
              currentPage === to ? "font-semibold scale-110" : "font-thin transition-all duration-200 hover:scale-110"
            }`}
      >
        {children}
      </Link>
      {currentPage === to && (
        <div className="w-full h-2 bg-[#869F77] rounded-t-full absolute bottom-0 left-0"></div>
      )}
    </div>
  );
}