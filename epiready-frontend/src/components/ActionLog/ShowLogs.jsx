import { use, useEffect, useState } from "react";
import ActionLog from "./ActionLog.jsx";

export default function ShowLogs(){
    const [logs, setLogs] = useState([]);
    const [logComponent, setLogComponent] = useState([]);
    const destruction = (id)  => {
        alert(id + " deleted");
    }

    useEffect(() => {
        setLogComponent([]);
        let actions = [];
        for(let i = 0; i < logs.length; i++){
            actions.push(<ActionLog type={logs[i].type} onDestroy={destruction} msg={logs[i].message} id={logs[i].id} key={i}/>)
        }
        setLogComponent(actions);
    }, [logs]);

    useEffect(() => {
        setLogs([
            {type: "Warning", id: 1, message: "This is a warning message"},
            {type: "Critical", id: 2, message: "This is a critical message"}, 
            {type: "Notice", id: 3, message: "The shipment dispatched from its location"},
        ]);
    }, []);
    

    return(
    
    <div>
        {logComponent}
    </div>)
}