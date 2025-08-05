import ShowLogs from "../components/ActionLog/ShowLogs";
import Navbar from "../components/Navbar";

export default function Alerts() {
  return (
    // <div className="bg-radial-[at_50%_100%] from-[#5C6C52] to-[#0C0C0C] to-90% h-screen flex flex-col items-center">
    <div className="bg-[#1D1D1D] min-h-screen flex flex-col items-center overflow-x-hidden">
      <Navbar currentPage="/alerts" />
      <ShowLogs />
    </div>
  );
}