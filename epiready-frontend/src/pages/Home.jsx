import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Home() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
  }, []);
  return (
    <div className="bg-radial-[at_50%_100%] from-[#5C6C52] to-[#0C0C0C] to-90% h-screen flex flex-col items-center">
      <Navbar currentPage="/" />
      <div
        className={`mt-auto mb-10 h-32 w-32 bg-[url('/src/assets/syringe.png')] bg-contain bg-no-repeat bg-center transition-all duration-900 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      ></div>
      <p
        className={`text-white mb-10 mt-4 text-8xl font-bold transition-all duration-900 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        EpiReady
      </p>
      <div className="w-2/3 mb-auto">
        <p
          className={`text-white text-lg text-center transition-all duration-900 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          Your comprehensive solution for managing and monitoring vaccine shipments, ensuring safety and efficiency in healthcare logistics.
        </p>
      </div>
    </div>
  );
}