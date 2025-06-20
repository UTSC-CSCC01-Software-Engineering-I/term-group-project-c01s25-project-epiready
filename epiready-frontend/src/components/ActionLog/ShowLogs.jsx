import { use, useEffect, useState } from "react";
import ActionLog from "./ActionLog";

export default function ShowLogs(){
    const [logs, setLogs] = useState([]);
    const [logComponent, setLogComponent] = useState([]);
    const deleteLog = (id)  => {
        let newLogs = logs.filter((val) => {return val.id  !== id});
        setLogs(newLogs);
    }

    useEffect(() => {
        setLogComponent([]);
        let actions = [];
        for(let i = 0; i < logs.length; i++){
            actions.push(<ActionLog type={logs[i].type} onDestroy={deleteLog} msg={logs[i].message} id={logs[i].id} key={logs[i].id}/>)
        }
        setLogComponent(actions);
    }, [logs]);

    useEffect(() => {
        setLogs([
            {type: 1, id: 1, message: "This temperature at shipment 1 is project to cross 24 degrees Celsius. The shipment may be at risk."},
            {type: 3, id: 4, message: "Temperature of shipment 3 has crossed 50 degrees Celsius. Shipment 3 is at a ssevere risk of being spolied."},
            {type: 2, id: 2, message: "The temperature of shipment 2 has crossed 24 degrees Celsius. The shipment is at a high risk."}, 
            {type: 0, id: 3, message: "Shipment 3 has been succesfully delivered."},
        ]);
    }, []);
    

    return(
    
    <div>
        {logComponent}
    </div>)
}