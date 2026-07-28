import { useEffect, useState,useRef } from 'react';
import { db, auth } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import Dice from './Dice.jsx';
import Player from './Player.jsx';
import '../styles/board.css';
import moveSoundEffect from "../assets/move.mp3";
import winSoundEffect from "../assets/win.mp3";

const ladders = new Array(101).fill(-1);
ladders[2] = 38; ladders[7] = 14; ladders[8] = 31; ladders[15] = 26;
ladders[21] = 42; ladders[28] = 84; ladders[36] = 44; ladders[51] = 67;
ladders[71] = 91; ladders[78] = 98; ladders[87] = 94;

const snakes = new Array(101).fill(-1);
snakes[16] = 6; snakes[49] = 11; snakes[46] = 25; snakes[62] = 19;
snakes[64] = 60; snakes[74] = 53; snakes[92] = 88; snakes[95] = 75; snakes[99] = 80;

function OnlineBoard({ roomCode }) {
    const [board, setBoard] = useState([]);
    const [gameData, setGameData] = useState(null); 
    const [moveSound] = useState(() => new Audio(moveSoundEffect));
    const [winSound] = useState(() => new Audio(winSoundEffect));
    const [winnerAnnounced, setWinnerAnnounced] = useState(false);

    const array = Array.from({ length: 100 }, (_, i) => 100 - i);

    function createZigZag(arr) {
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

    useEffect(() => {
        if (!roomCode) return;

        const unsub = onSnapshot(doc(db, "gameRooms", roomCode), (snap) => {
            if (!snap.exists()) return;
            const data = snap.data();
            setGameData(data);

            if (data.winnerId && !winnerAnnounced) {
                winSound.play();
                setWinnerAnnounced(true);
            }
        });

        return () => unsub(); 
    }, [roomCode]);

    const lastPositionsRef = useRef(null);

useEffect(() => {
    if (!gameData) return;

    if (lastPositionsRef.current) {
        const moved = gameData.players.some((p, idx) => {
            const prev = lastPositionsRef.current[idx];
            return prev && prev.position !== p.position;
        });

        if (moved) {
            moveSound.currentTime = 0;
            moveSound.play(); 
        }
    }

    lastPositionsRef.current = gameData.players;
}, [gameData]);

async function handleDiceRoll(value) {
    if (!gameData) return;

    const { players, currentTurn, winnerId } = gameData;
    const myId = auth.currentUser.uid;

    if (currentTurn !== myId || winnerId) return;

    const me = players.find(p => p.id === myId);
    let newPosition = me.position + value;
    if (newPosition > 100) newPosition = me.position;

    let winnerId_new = null;

    if (newPosition === 100) {
        winnerId_new = myId;
    } else {
        if (ladders[newPosition] !== -1) newPosition = ladders[newPosition];
        else if (snakes[newPosition] !== -1) newPosition = snakes[newPosition];
    }

    const updatedPlayers = players.map(p =>
        p.id === myId ? { ...p, position: newPosition } : p
    );

    const nextPlayer = players.find(p => p.id !== myId);

    await updateDoc(doc(db, "gameRooms", roomCode), {
        players: updatedPlayers,
        diceValue: value,
        currentTurn: nextPlayer.id,
        lastRollBy: myId,          
        rollTimestamp: Date.now(), 
        ...(winnerId_new && { winnerId: winnerId_new }),
    });

        // moveSound.currentTime = 0;
        // moveSound.play();
    }

    function getCoordinates(position) {
        if (position === 0) return { left: '1%', top: '91%' };
        const row = Math.floor((position - 1) / 10);
        let col = (position - 1) % 10;
        if (row % 2 === 1) col = 9 - col;
        const visualRow = 9 - row;
        return { left: `${col * 10 + 1}%`, top: `${visualRow * 10 + 1}%` };
    }

    if (!gameData) {
        return <p>Loading game...</p>;
    }

    const { players, currentTurn, winnerId } = gameData;
    const myId = auth.currentUser.uid;
    const isMyTurn = currentTurn === myId;
    const winnerPlayer = winnerId ? players.find(p => p.id === winnerId) : null;

    return (
        <>
            <div className="player-legend">
                {players.map((p) => (
                    <span
                        key={p.id}
                        style={{ color: p.color, fontWeight: p.id === myId ? "bold" : "normal", marginRight: "12px" }}
                    >
                        ● {p.name} ({p.color}) {p.id === myId && "— You"}
                    </span>
                ))}
            </div>

            <Player playerPosition={players} currentPlayer={null} />

            <div className='main-container'>
                <div className='board-container'>
                    {board.map((num) => (
                        <div className='block' key={num}> {num} </div>
                    ))}

                    {players.map((player, idx) => {
                        const point = getCoordinates(player.position);
                        return (
                            <svg
                                key={player.id}
                                viewBox="0 0 64 64"
                                className="player-token"
                                style={{
                                    left: point.left,
                                    top: point.top,
                                    transform: `translate(${idx * 10}px, 0)`, 
                                }}
                            >
                                <circle cx="32" cy="18" r="10" fill={player.color} />
                                <path d="M22 34c0-6 20-6 20 0l4 12H18l4-12z" fill={player.color} />
                                <rect x="16" y="46" width="32" height="8" rx="4" fill={player.color} />
                            </svg>
                        );
                    })}
                </div>

                <div>
                    <Dice
                        onRoll={handleDiceRoll}
                        disabled={!isMyTurn || !!winnerId}
                        remoteValue={gameData.diceValue}
                        remoteRollTimestamp={gameData.rollTimestamp}  
                    />                    
                    <p className={`turn-indicator ${isMyTurn ? 'my-turn' : 'opponent-turn'}`}>
                        {winnerId ? "" : isMyTurn ? "🎲 Your Turn" : "⏳ Opponent's Turn"}
                    </p>               
                 </div>
            </div>

            {winnerPlayer && (
                <h2 className="winner-banner">
                    🎉 {winnerPlayer.id === myId ? "You Win!" : `${winnerPlayer.name} Wins!`}
                </h2>
            )}
        </>
    );
}

export default OnlineBoard;