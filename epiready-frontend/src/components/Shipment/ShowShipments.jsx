/* global process */
import { useEffect, useState } from "react";
import ShipmentCard from "./ShipmentCard";
import styles from "./AddShipment.module.css";
import { useGlobal } from "../../LoggedIn";
import AddShipmentPopup from "./AddShipment";
import { LoadingSpinner } from "../widgets/LoadingSpinner";

export default function ShowShipments() {
    const [shipments, setShipments] = useState([]);
    const [shipmentComponents, setShipmentComponents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 15;
    const {loggedIn} = useGlobal();

    const addShipment = (
        <div className={styles.addShipment}>
            <div className={styles.addShipmentButton}>
                +
            </div>
        </div>
    )

    const setAdded = () => {
        if (loggedIn) {
            fetchShipments(page);
        }
    }

    // Fetch shipments with loading/error state and pagination
    const fetchShipments = (newPage = page) => {
        setIsLoading(true);
        setError(null);
        fetch(`${process.env.VITE_BACKEND_URL}/api/shipments?page=${newPage}`, {
            method: "GET",
            headers: {
                'Authorization': sessionStorage.getItem("token"),
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch shipments");
            return res.json();
        })
        .then(res => {
            setShipments(res.shipments || []);
            setTotalCount(res.total_count || 0);
            setIsLoading(false);
        })
        .catch(() => {
            setError("Unable to get shipments, please try again later.");
            setIsLoading(false);
        });
    };

    useEffect(() => {
        if (loggedIn) {
            fetchShipments(page);
        }
    }, [loggedIn, page]);

    useEffect(() => {
        const components = shipments.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
        ));
        setShipmentComponents(components);
    }, [shipments]);

    // Pagination controls
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return (
        <>
        <div className={styles.shipmentsContainer}>
            {loggedIn && <AddShipmentPopup trigger={addShipment} setAdded={setAdded} />}
            {loggedIn && (
                <>
                    {error && (
                        <div className="bg-red-900 text-red-100 w-full border border-red-400 rounded px-4 py-2 mb-4 mt-6 text-center font-semibold shadow-lg flex flex-col items-center">
                            <span>{error}</span>
                            <button
                                className="mt-2 px-4 py-1 bg-gray-900 hover:bg-black text-white rounded shadow cursor-pointer"
                                onClick={() => fetchShipments(page)}
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    {!isLoading && !error && shipmentComponents}
                </>
            )}
            {isLoading && (
                <LoadingSpinner />
            )}
            {!loggedIn && (<div style={{fontSize: "20px"}}>
                Please log in to access the shipments
            </div>)}
        </div>

        {loggedIn && (<div className="flex justify-center items-center gap-4 mt-6">
            <button
                className="px-4 py-2 bg-[#6B805E] text-white rounded shadow disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
            >
                Previous
            </button>
            <span className="font-semibold text-[#9fce8f]">Page {page} of {totalPages}</span>
            <button
                className="px-4 py-2 bg-[#6B805E] text-white rounded shadow disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
            >
                Next
            </button>
        </div>)}
        </>
    );
}