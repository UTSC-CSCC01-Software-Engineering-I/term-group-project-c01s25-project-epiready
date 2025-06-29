import { use, useEffect, useState } from "react";
import ShipmentCard from "./ShipmentCard";
import styles from "./AddShipment.module.css";
import { useGlobal } from "../../LoggedIn";
import AddShipmentPopup from "./AddShipment";

export default function ShowShipments() {
    const [shipments, setShipments] = useState([]);
    const [shipmentComponents, setShipmentComponents] = useState([]);
    const [isLoading, setIsLoading] = useState(null);
    const {loggedIn, setLoggedIn} = useGlobal();

    const addShipment = (
        <div className={styles.addShipment}>
            <div className={styles.addShipmentButton}>
                +
            </div>
        </div>
    )

    const setAdded = () => {
        if(loggedIn){
            fetch("http://127.0.0.1:5000/api/shipments/", {
            method: "GET",
            headers: {
                'Authorization': sessionStorage.getItem("token"),
                'Content-Type': 'application/json'
            }
            })
            .then((res) => {
                console.log(res);
                return res.json();})
            .then(res => {
                console.log(res);
                setShipments(res);
        });}
    }

    useEffect(() => {
        if(loggedIn){
            fetch("http://127.0.0.1:5000/api/shipments/", {
            method: "GET",
            headers: {
                'Authorization': sessionStorage.getItem("token"),
                'Content-Type': 'application/json'
            }
            })
            .then((res) => {
                console.log(res);
                return res.json();})
            .then(res => {
                console.log(res);
                setShipments(res);
            });}
    }, [loggedIn]);

    useEffect(() => {
        const components = shipments.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
        ));
        setShipmentComponents(components);
    }, [shipments]);

    return (
        <div className={styles.shipmentsContainer}>         
            {loggedIn && <AddShipmentPopup trigger={addShipment} setAdded={setAdded} />}
            {loggedIn && shipmentComponents}
            {!loggedIn && (<div style={{fontSize: "20px"}}>
                Please log in to access the shipments
            </div>)}
        </div>
    );
}