import { useEffect, useState } from "react";
import winSoundEffect from "../assets/win.mp3";
import '../styles/player.css';

function Player({ playerPosition, currentPlayer }) {
    const [winner, setWinner] = useState(null);
    const [winSound] = useState(() => new Audio(winSoundEffect));

    useEffect(() => {
        if (winner) return;

        if (playerPosition[0].position === 100) {
            setWinner("RED IS WINNER 👑");
            winSound.play();
        } else if (playerPosition[1].position === 100) {
            setWinner("BLUE IS WINNER 👑");
            winSound.play();
        }
    }, [playerPosition]);

    const currentPlayerObj =
        currentPlayer === null || currentPlayer === undefined
            ? null
            : typeof currentPlayer === "number"
                ? playerPosition[currentPlayer]           
                : playerPosition.find(p => p.id === currentPlayer); 

    return (
        <>
            {winner ? (
                <h1 className="winner-banner">{winner}</h1>
            ) : (
                <div className="dashboard">
                    <h2 className="dashboard-heading">🎲 Game Dashboard 🎲</h2>

                    {currentPlayerObj && (
                        <div className="turn-box">
                            Turn of
                            <span
                                className="turn-player"
                                style={{ color: currentPlayerObj.color }}
                            >
                                {currentPlayerObj.color}
                            </span>
                        </div>
                    )}

                    <div className="score-board">
                        <div className="player-box red-player">
                            <span className="player-name">{playerPosition[0]?.color}</span>
                            <span className="player-position">
                                Position: {playerPosition[0]?.position}
                            </span>
                        </div>

                        <div className="player-box blue-player">
                            <span className="player-name">{playerPosition[1]?.color}</span>
                            <span className="player-position">
                                Position: {playerPosition[1]?.position}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Player;