import React from 'react';
import Popup from 'reactjs-popup';
// import 'reactjs-popup/dist/index.css';
import styles from "./AddShipment.module.css";

export default function AddShipmentPopup() {
  return (
    <Popup 
      trigger={<button className={styles.addShipmentButton}>+</button>}
      className="shipmentPopup"
      modal
    >
      <div 
        className='bg-[#1D1D1D] w-[500px] flex flex-col items-center justify-center p-4 rounded-lg shadow-lg border border-neutral-600'
      >
        <h2 className='text-white text-2xl mb-4'>Add Shipment</h2>
        <form className='w-full'>
          <input type='text' placeholder='Shipment Name' className='mb-4 p-2 w-full rounded-lg border border-neutral-600 bg-transparent text-white' />
          <input type='text' placeholder='Location' className='mb-4 p-2 w-full rounded-lg border border-neutral-600 bg-transparent text-white' />
          <input type='text' placeholder='Description' className='mb-4 p-2 w-full h-24 rounded-lg border border-neutral-600 bg-transparent text-white' />
          <button type='submit' className='bg-[#6b805e] text-white py-2 px-4 rounded-lg'>Add Shipment</button>
        </form>
      </div>
    </Popup>
  );
}