import { use, useEffect, useState } from "react";
import ShipmentCard from "./ShipmentCard";
import styles from "./AddShipment.module.css";

export default function ShowShipments() {
    const [shipments, setShipments] = useState([]);
    const [shipmentComponents, setShipmentComponents] = useState([]);

    const addShipment = (
        <div className={styles.addShipment}>
            <div className={styles.addShipmentButton}>
                +
            </div>
        </div>
    )

    useEffect(() => {
        // Simulating fetching shipments data
        setShipments([
            { id: 4, name: "Shipment 3", location: "Location C", description: "Description C", statusCode: 3 },
            { id: 1, name: "Shipment 1", location: "Location A", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis dicta possimus voluptatum ipsum veritatis minus at blanditiis, ex, tenetur, dolorem accusamus nihil distinctio cupiditate dolores quidem illo assumenda illum! Reprehenderit.", statusCode: 0 },
            { id: 2, name: "Shipment 2", location: "Location B", description: "Description B", statusCode: 1 },
            { id: 3, name: "Shipment 3", location: "Location C", description: "Description C", statusCode: 2 },
            
        ]);
    }, []);

    useEffect(() => {
        const components = shipments.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
        ));
        setShipmentComponents(components);
    }, [shipments]);

    return (
        <div style={{width: "100%", display: "flex", flexWrap: "wrap", rowGap: "2em", columnGap: "2.5%", justifyContent: "center"}}>
            {addShipment}
            {shipmentComponents}
        </div>

    );
}