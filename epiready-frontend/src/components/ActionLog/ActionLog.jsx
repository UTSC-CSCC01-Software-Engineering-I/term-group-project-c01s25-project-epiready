import React, { useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import classes from "./ActionLog.module.css";

export default function ActionLog({ type, onDestroy, id, msg }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardHeight, setCardHeight] = useState("auto");
  let msgColor = classes.Notice;
  let statusMessage = "Notice";

  if (type === 1) {
    msgColor = classes.Critical;
    statusMessage = "Critical";
  } else if (type === 2) {
    msgColor = classes.Warning;
    statusMessage = "Warning";
  } else if (type === 3) {
    msgColor = classes.Severe;
    statusMessage = "Severe";
  }

  const frontRef = useRef(null);
  const backRef = useRef(null);

  // Adjust card height based on the tallest side
  useLayoutEffect(() => {
    const frontHeight = frontRef.current ? frontRef.current.offsetHeight : 0;
    const backHeight = backRef.current ? backRef.current.offsetHeight : 0;
    setCardHeight(Math.max(frontHeight, backHeight) + 8);
  }, [msg, isFlipped]);

  const CardFront = () => (
    <div className={classes.cardView} ref={frontRef}>
      <div className={classes.cardHeader}>
        <div className={classes.msgType}>{statusMessage}</div>
        <div className={classes.date}>6/7/2025</div>
        <div className={classes.deleteBtn} onClick={() => setIsFlipped(true)}></div>
      </div>
      <div className={classes.cardContent}>
        <div className={classes.message}>{msg}</div>
      </div>
    </div>
  );

  const CardBack = () => (
    <div className={classes.cardView} ref={backRef}>
      <div className={classes.backMsg}>Are you sure you want to delete this log?</div>
      <div className={classes.confirmation}>
        <button className={classes.yesBtn} onClick={() => onDestroy(id)}>Yes</button>
        <button className={classes.noBtn} onClick={() => setIsFlipped(false)}>No</button>
      </div>
    </div>
  );

  return (
    <motion.div className={classes.cardContainer}>
      <motion.div
        className={classes.card + " " + msgColor}
        animate={{ rotateY: isFlipped ? 180 : 0, height: cardHeight }}
        transition={{ duration: 0.5 }}
        style={{ height: cardHeight }}
      >
        {/* Front Side */}
        <motion.div className={classes.cardFront}>
          <CardFront />
        </motion.div>

        {/* Back Side */}
        <motion.div className={classes.cardBack}>
          <CardBack />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}