import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-screen flex justify-center items-center bg-black mt-0 h-16 border-b-1 border-neutral-600 drop-shadow-xl drop-shadow-neutral-700/40 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-600">
      <div className="w-9/10 sm:w-4/5 h-full flex gap-4 items-center">
        <div className="min-h-10 min-w-10 h-10 w-10 bg-[url('/src/assets/syringe.png')] bg-contain bg-no-repeat bg-center transition-all duration-200 hover:scale-110 hover:cursor-pointer"></div>
        <p className="text-white text-lg font-thin transition-all duration-200 hover:scale-110 text-center hover:cursor-pointer">Shipments</p>
        <p className="text-white text-lg font-thin transition-all duration-200 hover:scale-110 text-center hover:cursor-pointer">a</p>
        <p className="text-white text-lg font-thin transition-all duration-200 hover:scale-110 text-center hover:cursor-pointer">asfadfafasfas</p>
        <p className="text-white text-lg font-thin transition-all duration-200 hover:scale-110 text-center hover:cursor-pointer">hello</p>
        <p className="text-white text-lg font-thin transition-all duration-200 hover:scale-110 text-center hover:cursor-pointer">Monitoring</p>
      </div>
    </nav>
  );
}