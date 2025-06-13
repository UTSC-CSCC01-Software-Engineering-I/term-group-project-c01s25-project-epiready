import React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import styles from "./AddShipment.module.css";

export default function AddShipmentPopup() {
  return (
    <Popup 
      trigger={<button className={styles.addShipmentButton}>+</button>}
      modal
    >
      <div className="bg-slate-100 p-4 rounded-lg shadow-lg">
        test
      </div>
    </Popup>
  );
}