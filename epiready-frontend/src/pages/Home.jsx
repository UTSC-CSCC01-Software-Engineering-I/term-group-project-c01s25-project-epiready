import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="bg-radial-[at_50%_100%] from-[#5C6C52] to-[#0C0C0C] to-90% h-screen flex flex-col items-center">
      <Navbar currentPage="/" />
      <div className="mt-auto mb-10 h-32 w-32 bg-[url('/src/assets/syringe.png')] bg-contain bg-no-repeat bg-center"></div>
      <p className="mb-auto text-white text-8xl font-bold mt-4">EpiReady</p>
    </div>
  );
}