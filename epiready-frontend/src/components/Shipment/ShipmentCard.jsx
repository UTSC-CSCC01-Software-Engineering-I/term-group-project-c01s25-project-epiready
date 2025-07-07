import React, { useState, useRef, useEffect, use } from "react";
import classes from "./ShipmentCard.module.css";
import { useNavigate } from "react-router-dom";

export default function ShipmentCard({ shipment }) {
    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [maxHeight, setMaxHeight] = useState("110px");
    const sectionsRef = useRef(null);
    const navigate = useNavigate();

    let statusColor = classes.onTrack;
    let boxColor = classes.shipmentOnTrack;
    let statusMsg = "No issues";

    if (shipment.risk_factor === "Medium") {
        statusColor = classes.warning;
        statusMsg = "Warning";
        boxColor = classes.shipmentWarning;
    } else if (shipment.risk_factor === "High") {
        statusColor = classes.severe;
        statusMsg = "Severe";
        boxColor = classes.shipmentSevere;
    } else if (shipment.risk_factor === "Very High") {
        statusColor = classes.critical;
        statusMsg = "Critical";
        boxColor = classes.shipmentCritical;
    }

    useEffect(() => {
        if (sectionsRef.current) {
            // Temporarily remove maxHeight to measure full height
            const prevMaxHeight = sectionsRef.current.style.maxHeight;
            sectionsRef.current.style.maxHeight = "none";
            const scrollHeight = sectionsRef.current.scrollHeight;
            sectionsRef.current.style.maxHeight = prevMaxHeight;

            setIsOverflowing(scrollHeight > 110); // 112px = 7em approx
            if (expanded) {
                setMaxHeight(scrollHeight + "px");
            } else {
                setMaxHeight("110px");
            }
        }
    }, [shipment, expanded]);

    useEffect(() => {
        if (sectionsRef.current) {
            if(!isOverflowing){
                sectionsRef.current.style.height = maxHeight; 
            } else{
                sectionsRef.current.style.height = "auto"; // Reset height to auto if overflowing
            }
        }
    }, [isOverflowing]);

    return (
        <div className={`${classes.shipmentCard} ${boxColor}`}>
            <div
                ref={sectionsRef}
                className={classes.shipmentSections}
                style={{
                    maxHeight: maxHeight,
                    transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
                    overflow: "hidden"
                }}
                onClick={() => navigate(`/shipments/${shipment.name}`)}
            >
                <div className={classes.shipmentName}>
                    <div className={classes.title}>Name</div>
                    <div className={classes.content}>{shipment.name}</div>
                </div>
                <div className={classes.shipmentLocation}>
                    <div className={classes.title}>Destination</div>
                    <div className={classes.content}>{shipment.destination}</div>
                </div>
                <div className={classes.shipmentDescription}>
                    <div className={classes.title}>Description</div>
                    <div className={classes.content}>The shipment has {shipment.aqi_sensitivity} aqi sensitivity 
                        and {shipment.humidity_sensitivity} humidity sensitivity and is being carried
                        on a {shipment.mode_of_transport}</div>
                </div>
                <div className={classes.shipmentStatus}>
                    <div className={classes.title}>Status</div>
                    <div className={`${classes.content} ${statusColor}`}>{statusMsg}</div>
                </div>
            </div>
            {isOverflowing && (
                <div
                    className={classes.readMoreBtn}
                    onClick={() => setExpanded((prev) => !prev)}
                >
                    {expanded ? "Show less" : "Read more"}
                </div>
            )}
        </div>
    );
}