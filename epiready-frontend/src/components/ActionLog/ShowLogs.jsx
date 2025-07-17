import { useEffect, useState } from "react";
import ActionLog from "./ActionLog";
import { useSocket } from '../../Socket';
import { useGlobal } from "../../LoggedIn";
import { LoadingSpinner } from "../widgets/LoadingSpinner";


export default function ShowLogs({ maxAlerts = -1, isHome = false }) {
    
    const [logs, setLogs] = useState([]);
    const [logComponent, setLogComponent] = useState([]);
    const [alertError, setAlertError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { loggedIn } = useGlobal();
    const socket = useSocket();
    const deleteLog = (id)  => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/alerts/${id}/active`, {
            method: "PATCH",
            headers: {
                'Authorization': sessionStorage.getItem("token"),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({active: false})
        }).then(() => {
            let newLogs = logs.filter((val) => {return val.id  !== id});
            setLogs(newLogs);
        });
    }

    useEffect(() => {
        console.log("Socket initialized:", socket);
        if (!socket) return;
            socket.on("breach_alert", (data) => {
            console.log("Breach alert received:", data);
            setLogs((prevLogs) => [data, ...prevLogs]);
        });
        return () => {
            socket.off("breach_alert");
        };
    }, [socket]);

    useEffect(() => {
        setLogComponent([]);
        let actions = [];
        if(maxAlerts > 0 && logs.length > maxAlerts){
            setLogs(logs.slice(0, maxAlerts));
        }
        for(let i = 0; i < logs.length; i++){
            actions.push(<ActionLog type={logs[i].severity} onDestroy={deleteLog} msg={logs[i].message + ` for shipment ${logs[i].shipment_name}`} id={logs[i].id} key={logs[i].id} isHome={isHome}/>)
        }
        setLogComponent(actions);
    }, [logs]);

    const fetchLogs = () => {
        setIsLoading(true);
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/alerts?active=true&page=${page}`, {
            method: "GET",
            headers: {
                'Authorization': sessionStorage.getItem("token"),
                'Content-Type': 'application/json'
            }
        }).then(async (res) => {
            if(!res.ok) {
                throw new Error("Failed to fetch logs");
            }
            return res.json();
        }).then((data) => {
            setLogs(data.alerts);
            setTotalCount(data.total_count || 0);
            setAlertError(null);
            setIsLoading(false);
            // eslint-disable-next-line
        }).catch((e) => {
            setAlertError("Unable to get the alerts, please try again later.");
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchLogs(page);
    }, [page]);
    

    // Pagination controls
    const totalPages = Math.max(1, Math.ceil(totalCount / 25));

    return(
      <div className="mb-10">
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>
        )}
        {alertError && (
          <div className="bg-red-900 text-red-100 w-full border border-red-400 rounded px-4 py-2 mb-4 mt-6 text-center font-semibold shadow-lg flex flex-col items-center">
            <span>{alertError}</span>
            <button
              className="mt-2 px-4 py-1 bg-gray-900 hover:bg-black text-white rounded shadow cursor-pointer"
              onClick={() => fetchLogs(page)}
            >
              Retry
            </button>
          </div>
        )}
        {!isLoading && logComponent}
        {loggedIn &&<div className="flex justify-center items-center gap-4 mt-6">
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
        </div>}
      </div>
    )
}