import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ShowLogs from "../components/ActionLog/ShowLogs";
import { Link } from "react-router-dom";
import { useGlobal } from "../LoggedIn";

export default function Home() {
  const [show, setShow] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const { loggedIn } = useGlobal();

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShowAlerts(true), 600); // 600ms delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-radial-[at_50%_100%] from-[#5C6C52] to-[#0C0C0C] to-90% min-h-screen flex flex-col items-center">
      <Navbar currentPage="/" />
      <div
        className={`mt-16 mb-10 min-h-32 w-32 bg-[url('/src/assets/syringe.png')] bg-contain bg-no-repeat bg-center transition-all duration-900 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      ></div>
      <p
        className={`text-white mb-6 mt-4 text-8xl font-bold transition-all duration-900 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        EpiReady
      </p>
      {loggedIn &&
      (
        <>
        <p
          className={`text-white text-3xl font-semibold text-center transition-all duration-900 ease-out ${showAlerts ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          Recent Alerts
        </p>
        <div className={`min-h-0 mb-auto flex flex-col items-center transition-all duration-900 ease-out ${showAlerts ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <ShowLogs maxAlerts={2} isHome={true}/>
          <Link to="/alerts" className="text-neutral-400 mb-2"> See all</Link>
        </div>
        </>
      )}
    </div>
  );
}