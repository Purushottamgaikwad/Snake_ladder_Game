import { useEffect, useState } from 'react';
import Dice from './Dice.jsx';
import '../styles/board.css'
import Player from './Player.jsx'

// Component chya bahera move kela - re-render var recreate nahi hoणार
const ladders = new Array(101).fill(-1);
ladders[2] = 38; ladders[7] = 14; ladders[8] = 31; ladders[15] = 26;
ladders[21] = 42; ladders[28] = 84; ladders[36] = 44; ladders[51] = 67;
ladders[71] = 91; ladders[78] = 98; ladders[87] = 94;

const snakes = new Array(101).fill(-1);
snakes[16] = 6; snakes[49] = 11; snakes[46] = 25; snakes[62] = 19;
snakes[64] = 60; snakes[74] = 53; snakes[92] = 88; snakes[95] = 75; snakes[99] = 80;

function Board(){
    const [board, setBoard] = useState([]);
    const [diceValue, setDiceValue] = useState(null);
    const [diceRollCount, setDiceRollCount] = useState(0);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0); // <-- playerId cha replacement
    const [winner ,setWinner] = useState(null);
    const [playerPosition, setPlayerPosition] = useState([
        { id: 1, name: "Player1", position: 0, color: "red" },
        { id: 2, name: "Player2", position: 0, color: "blue" }
    ]);

    const array = Array.from({ length: 100 }, (_, i) => 100 - i);



useEffect(() => {
    if (diceValue === null || winner) return; // winner ठरला असेल तर पुढे roll process करू नका

    const currentId = playerPosition[currentPlayerIndex].id;
    let justWon = null;

    setPlayerPosition(prev =>
        prev.map(player => {
            if (player.id !== currentId) return player;

            let newPosition = player.position + diceValue;
            if (newPosition > 100) newPosition = player.position;

            if (ladders[newPosition] !== -1) {
                newPosition = ladders[newPosition];
            } else if (snakes[newPosition] !== -1) {
                newPosition = snakes[newPosition];
            }

            return { ...player, position: newPosition };
        })
    );

    if (justWon) {
        setWinner(justWon); // winner state update
    } else {
        setCurrentPlayerIndex(prev => (prev + 1) % playerPosition.length); // winner नसेल तरच turn pass kara
    }

}, [diceValue, diceRollCount]);

    function createZigZag(arr){
        let start = arr.length - 1;
        while (start >= 0) {
            if (arr[start] % 10 === 1 && Math.floor(arr[start] / 10) % 2 === 0) {
                let no = 9;
                const temp = start - 10;
                while (start > temp) {
                    arr[start] = arr[start] + no;
                    no -= 2;
                    start--;
                }
            }
            start--;
        }
        return arr;
    }

    useEffect(() => {
        const savedBoard = localStorage.getItem("board");
        if (savedBoard) {
            setBoard(JSON.parse(savedBoard));
        } else {
            const newBoard = createZigZag(array);
            setBoard(newBoard);
            localStorage.setItem("board", JSON.stringify(newBoard));
        }
    }, []);

    const handleDiceRoll = (value) => {
        setDiceValue(value);
        setDiceRollCount(prev => prev + 1);
    };

    return (
        <>

        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 64 64">
  <circle cx="32" cy="18" r="10" fill="#e63946"/>
  <path d="M22 34c0-6 20-6 20 0l4 12H18l4-12z" fill="#e63946"/>
  <rect x="16" y="46" width="32" height="8" rx="4" fill="#e63946"/>
</svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 64 64">
  <circle cx="32" cy="18" r="10" fill="#0400ff"/>
  <path d="M22 34c0-6 20-6 20 0l4 12H18l4-12z" fill="#0400ff"/>
  <rect x="16" y="46" width="32" height="8" rx="4" fill="#0400ff"/>
</svg>
            <div className='board-container'>
                {board.map((num) => (
                    <div className='block' key={num}> {num} </div>
                    
                ))}
            </div>
            <Dice onRoll={handleDiceRoll} />
            <Player playerPosition={playerPosition}  currentPlayer ={currentPlayerIndex}/>
            {/* <h1>Turn: {playerPosition[currentPlayerIndex].name}</h1> */}
        </>
    );
}

export default Board;