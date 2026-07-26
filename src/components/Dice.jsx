import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import "../styles/dice.css";

import dice1 from "../assets/dice-six-faces-one.svg"
import dice2 from "../assets/dice-six-faces-two.svg"
import dice3 from "../assets/dice-six-faces-three.svg"
import dice4 from "../assets/dice-six-faces-four.svg"
import dice5 from "../assets/dice-six-faces-five.svg"
import dice6 from "../assets/dice-six-faces-six.svg"
import diceRollSound from "../assets/dice-roll.mp3"; // इतर assets सारखं import kara

function Dice({ onRoll }) {
    const [diceImage, setDiceImage] = useState(null);
    const images = [dice1, dice2, dice3, dice4, dice5, dice6];

    const [dice, setDice] = useState(1);
    const [rolling, setRolling] = useState(false);

    // Audio object एकदाच बनवा, component cha बाहेर किंवा useState/useRef ने
    const [diceSound] = useState(() => new Audio(diceRollSound));

    function rollDice() {
        if (rolling) return;
        setRolling(true);

        diceSound.currentTime = 0; // प्रत्येक वेळी सुरुवातीपासून वाजावा
        diceSound.play();

        let count = 0;

        const interval = setInterval(() => {
            setDice(Math.floor(Math.random() * 6) + 1);
            count++;
            if (count === 10) {
                clearInterval(interval);
                const final = Math.floor(Math.random() * 6) + 1;
                setDice(final);
                setRolling(false);
                onRoll(final);
                console.log("Dice :", final);
            }
        }, 100);
    }

    return (
        <div>
            <motion.img
                key={dice}
                src={images[dice - 1]}
                animate={rolling ? { rotateX: [0, 360, 720, 1080] } : { rotateX: 0 }}
                transition={{ duration: 1, ease: "linear" }}
                width={90}
                style={{ transformStyle: "preserve-3d" }}
            />
            <br />
            <button onClick={rollDice} disabled={rolling}>
                {rolling ? "Rolling..." : "Roll Dice"}
            </button>
        </div>
    );
}

export default Dice;