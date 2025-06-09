import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import classes from "./ActionLog.module.css";


export default function ActionLog( {type, onDestroy, id, msg}) {
  const [isFlipped, setIsFlipped] = useState(false);
  let msgColor = classes.Notice;

  if(type === "Critical") {
    msgColor = classes.Critical;
  } else if(type === "Warning") {
    msgColor = classes.Warning;
  }

  const CardFront = () => {
    return (
    <div className={classes.cardView}>
      <div className={classes.cardHeader}>
        <div className={classes.msgType}>{type}</div>
        <div className={classes.date}>6/7/2025</div>
        <div className={classes.deleteBtn} onClick={() => setIsFlipped(true)}></div>
      </div>
      <div className={classes.cardContent}>
        <div className={classes.message}>{msg}</div>
      </div>
    </div>)
  }

  const CardBack = () => {
    return (
    <div className={classes.cardView}>
      <div className={classes.backMsg}>Are you sure you want to delete this log?</div>
      <div className={classes.confirmation}>
        <button className={classes.yesBtn} onClick={() => onDestroy(id)}>Yes</button>
        <button className={classes.noBtn} onClick={() => setIsFlipped(false)}>No</button>
      </div>
    </div>)
  }

  return (
    <motion.div
      className={classes.cardContainer}
    >
      <motion.div
        className={classes.card + " " + msgColor}
        animate={{ rotateY: isFlipped ? 180 : 0 }} // Animates the flip
        transition={{ duration: 0.5 }} // Controls the flip speed
      >
        {/* Front Side */}
        <motion.div
          className={classes.cardFront}
        >
          <CardFront />
        </motion.div>

        {/* Back Side */}
        <motion.div
          className={classes.cardBack}
        >
          <CardBack />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

