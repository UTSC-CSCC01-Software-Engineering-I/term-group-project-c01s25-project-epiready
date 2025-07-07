import { use, useEffect, useState } from "react";
import ActionLog from "./ActionLog";

export default function ShowLogs({ maxAlerts = -1, isHome = false }) {
    const [logs, setLogs] = useState([]);
    const [logComponent, setLogComponent] = useState([]);
    const [alertError, setAlertError] = useState(null);
    const deleteLog = (id)  => {
        let newLogs = logs.filter((val) => {return val.id  !== id});
        setLogs(newLogs);
    }

    useEffect(() => {
        setLogComponent([]);
        let actions = [];
        if(maxAlerts > 0 && logs.length > maxAlerts){
            setLogs(logs.slice(0, maxAlerts));
        }
        for(let i = 0; i < logs.length; i++){

            actions.push(<ActionLog type={logs[i].type} onDestroy={deleteLog} msg={logs[i].message} id={logs[i].id} key={logs[i].id} isHome={isHome}/>)

        }
        setLogComponent(actions);
    }, [logs]);

    const fetchLogs = () => {
        fetch("http://localhost:5000/api/alerts", {
            method: "GET",
            headers: {
                "Authorization": sessionStorage.getItem("token"),
            }
        }).then(async (res) => {
            if(!res.ok) {
                throw new Error("Failed to fetch logs");
            }
            const data = await res.json();
            setLogs(data);
            setAlertError(null);
        }).catch((e) => {
            setAlertError("Unable to get the alerts, please try again later.");
        });
    };

    useEffect(() => {
        fetchLogs();
    }, []);
    

    return(
      <div>
        {alertError && (
          <div className="bg-red-900 text-red-100 w-full border border-red-400 rounded px-4 py-2 mb-4 mt-6 text-center font-semibold shadow-lg flex flex-col items-center">
            <span>{alertError}</span>
            <button
              className="mt-2 px-4 py-1 bg-gray-900 hover:bg-black text-white rounded shadow cursor-pointer"
              onClick={fetchLogs}
            >
              Retry
            </button>
          </div>
        )}
        {logComponent}
      </div>
    )
}