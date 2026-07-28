import { useState, useEffect } from "react";
import { db , auth } from "./firebase.js"
import {doc, setDoc, updateDoc, onSnapshot, getDoc} from "firebase/firestore";

function Lobby({onGameStart}){

    const [mode, setMode] = useState(null);
    const [ roomCode, setRoomCode] = useState("");
    const [inputCode , setInputCode] = useState("");
    const [status, setStatus] = useState("");

    // creating room 

async function createRoom() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);     
    setMode("host");

    await setDoc(doc(db, "gameRooms", code), {  
        hostId: auth.currentUser.uid,             
        guestId: null,
        requestStatus: "waiting",
        players: [{ id: auth.currentUser.uid, name: "Player 1", position: 0, color: "red" }], 
        currentTurn: auth.currentUser.uid,         
        status: "waiting_for_player",         
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), 
    });

    onSnapshot(doc(db, "gameRooms", code), (snap) => {
        const data = snap.data();
        if (data.requestStatus === "pending") {
            setStatus("request_received");
        }
        if (data.status === "playing") {
            onGameStart(code);
        }
    });
}

async function acceptRequest() {
    const roomRef = doc(db, "gameRooms", roomCode);
    const roomSnap = await getDoc(roomRef);
    const data = roomSnap.data();

    await updateDoc(roomRef, {
        status: "playing",
        requestStatus: "accepted",
        players: [
            ...data.players, // existing player 1
            { id: data.guestId, name: "Player 2", position: 0, color: "blue" } // player 2 add
        ],
    });
}


async function sendJoinRequest() {
    const roomRef = doc(db, "gameRooms", inputCode.toUpperCase());
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        alert("Room not found!");
        return;
    }

    setRoomCode(inputCode.toUpperCase());
    setMode("guest");
    setStatus("pending_request");

    await updateDoc(roomRef, {
        guestId: auth.currentUser.uid,
        requestStatus: "pending",
    });


        setRoomCode(inputCode.toUpperCase());
        setMode("guest");
        setStatus("pending_request");

        await updateDoc(roomRef, {
            guestId: auth.currentUser.uid,
            requestStatus: "pending",
        });

        onSnapshot(roomRef, (snap) => {
            const data = snap.data();
            if (data.status === "playing") {
                onGameStart(inputCode.toUpperCase());
            }
        });
    }
    // ---- UI ----
    if (mode === null) {
        return (
            <div>
                <button onClick={createRoom}>Create Room</button>
                <br />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
                        <span style={{ color: '#888', fontSize: '13px', fontWeight: 500 }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
                </div>

                <input
                    placeholder="Enter room code"
                    onChange={(e) => setInputCode(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '15px',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        outline: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                    }}
                />
<br /><br />
                <button onClick={sendJoinRequest}>Join Room</button>
            </div>
        );
    }

    if (mode === "host") {
        return (
            <div>
                <p>Room Code: <strong>{roomCode}</strong> (Share this code to Your friend)</p>
                {status === "request_received" && (
                    <div>
                        <p>Someone wants to join!</p>
                        <button onClick={acceptRequest}>Accept</button>
                    </div>
                )}
                {!status && <p>Waiting for player to join...</p>}
            </div>
        );
    }

    if (mode === "guest") {
        return <p>Request sent, waiting for host to accept...</p>;
    }
}

export default Lobby;

    


