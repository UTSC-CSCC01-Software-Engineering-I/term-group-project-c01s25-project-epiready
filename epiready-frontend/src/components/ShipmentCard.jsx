import React, { useState, useEffect } from "react";
import classes from "./ActionLog.module.css";

export default function ShipmentCard({ type, onDestroy, id, msg }) {
    
    return(
        <div className={classes.cardContainer}>
            <div className={classes.card}>
                <div className={classes.cardHeader}>
                    <div className={classes.msgType}>{type}</div>
                    <div className={classes.deleteBtn} onClick={() => onDestroy(id)}></div>
                </div>
                <div className={classes.cardContent}>
                    <div className={classes.message}>{msg}</div>
                </div>
            </div>
        </div>
    )
}