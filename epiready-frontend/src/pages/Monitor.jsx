import Navbar from "../components/Navbar";

export default function Monitor() {
  return (
    <div className="bg-[#1D1D1D] min-h-screen flex flex-col items-center">
      <Navbar currentPage="/monitor" />
    </div>
  );
}