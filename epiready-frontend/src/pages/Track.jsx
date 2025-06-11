import Navbar from "../components/Navbar";

export default function Track() {
  return (
    <div className="bg-[#1D1D1D] h-screen flex flex-col items-center">
      <Navbar currentPage="/track" />
    </div>
  );
}