import Navbar from "../components/Navbar";
import ShowShipments from "../components/Shipment/ShowShipments";

export default function Shipments() {
  return (
    <div className="bg-[#1D1D1D] min-h-screen flex flex-col items-center">
      <Navbar currentPage="/shipments" />
      <ShowShipments />
    </div>
  );
}