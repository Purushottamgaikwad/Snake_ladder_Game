import { useEffect, useState, useRef } from 'react';
import { motion } from "framer-motion";
import "../styles/dice.css";

import dice1 from "../assets/dice-six-faces-one.svg"
import dice2 from "../assets/dice-six-faces-two.svg"
import dice3 from "../assets/dice-six-faces-three.svg"
import dice4 from "../assets/dice-six-faces-four.svg"
import dice5 from "../assets/dice-six-faces-five.svg"
import dice6 from "../assets/dice-six-faces-six.svg"
import diceRollSound from "../assets/dice-roll.mp3";

function Dice({ onRoll, disabled, remoteValue, remoteRollTimestamp }) {
    const images = [dice1, dice2, dice3, dice4, dice5, dice6];
    const [dice, setDice] = useState(1);
    const [rolling, setRolling] = useState(false);
    const [diceSound] = useState(() => new Audio(diceRollSound));
    const lastSeenTimestamp = useRef(null);

    useEffect(() => {
        if (
            remoteRollTimestamp &&
            remoteRollTimestamp !== lastSeenTimestamp.current &&
            !rolling
        ) {
            lastSeenTimestamp.current = remoteRollTimestamp;
            playRollAnimation(remoteValue);
        }
    }, [remoteRollTimestamp]);

    function playRollAnimation(finalValue) {
        setRolling(true);
        diceSound.currentTime = 0;
        diceSound.play();

        let count = 0;
        const interval = setInterval(() => {
            setDice(Math.floor(Math.random() * 6) + 1);
            count++;
            if (count === 10) {
                clearInterval(interval);
                setDice(finalValue);
                setRolling(false);
            }
        }, 100);
    }

    function rollDice() {
        if (rolling || disabled) return;

        setRolling(true);
        diceSound.currentTime = 0;
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
            }
        }, 100);
    }

    return (
        <div>
            <motion.img
                src={images[dice - 1]}
                animate={{
                    rotate: rolling ? 720 : 0,
                    scale: rolling ? 1.2 : 1
                }}
                transition={{ duration: 0.5 }}
                width={90}
            />
            <br />
            <br />
            {!disabled && (
                <button onClick={rollDice} disabled={rolling}>
                    {rolling ? "Rolling..." : "Roll Dice"}
                </button>
            )}
        </div>
    );
}

export default Dice;