import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
    doc,
    setDoc,
    updateDoc,
    onSnapshot,
    getDoc
} from "firebase/firestore";

function Lobby({ onGameStart }) {

    const [mode, setMode] = useState(null);
    const [roomCode, setRoomCode] = useState("");
    const [inputCode, setInputCode] = useState("");
    const [status, setStatus] = useState("");

    const [unsubscribeListener, setUnsubscribeListener] = useState(null);

    useEffect(() => {
        return () => {
            if (unsubscribeListener) {
                unsubscribeListener();
            }
        };
    }, [unsubscribeListener]);

    // =========================
    // CREATE ROOM
    // =========================
    async function createRoom() {

        if (!auth.currentUser) {
            alert("Authentication failed.");
            return;
        }

        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        setRoomCode(code);
        setMode("host");

        await setDoc(doc(db, "gameRooms", code), {

            hostId: auth.currentUser.uid,
            guestId: null,

            requestStatus: "waiting",

            players: [
                {
                    id: auth.currentUser.uid,
                    name: "Player 1",
                    position: 0,
                    color: "red"
                }
            ],

            currentTurn: auth.currentUser.uid,
            diceValue: null,
            winnerId: null,
            status: "waiting_for_player"

        });

        const unsub = onSnapshot(doc(db, "gameRooms", code), (snap) => {

            if (!snap.exists()) {
                alert("Room deleted.");
                return;
            }

            const data = snap.data();

            if (data.requestStatus === "pending") {
                setStatus("request_received");
            }

            if (data.status === "playing") {
                onGameStart(code);
            }

        });

        setUnsubscribeListener(() => unsub);
    }

    // =========================
    // ACCEPT REQUEST
    // =========================
    async function acceptRequest() {

        const roomRef = doc(db, "gameRooms", roomCode);

        const roomSnap = await getDoc(roomRef);

        if (!roomSnap.exists()) {
            alert("Room not found.");
            return;
        }

        const data = roomSnap.data();

        if (!data.guestId) {
            alert("No player has requested to join.");
            return;
        }

        await updateDoc(roomRef, {

            status: "playing",
            requestStatus: "accepted",

            players: [
                ...data.players,
                {
                    id: data.guestId,
                    name: "Player 2",
                    position: 0,
                    color: "blue"
                }
            ]

        });
    }

    // =========================
    // JOIN ROOM
    // =========================
    async function sendJoinRequest() {

        if (!auth.currentUser) {
            alert("Authentication failed.");
            return;
        }

        const code = inputCode.trim().toUpperCase();

        if (!code) {
            alert("Enter room code.");
            return;
        }

        const roomRef = doc(db, "gameRooms", code);

        const roomSnap = await getDoc(roomRef);

        if (!roomSnap.exists()) {
            alert("Room not found.");
            return;
        }

        const data = roomSnap.data();

        if (data.hostId === auth.currentUser.uid) {
            alert("You cannot join your own room.");
            return;
        }

        if (data.status === "playing") {
            alert("Game already started.");
            return;
        }

        if (data.guestId) {
            alert("Room is already full.");
            return;
        }

        setRoomCode(code);
        setMode("guest");
        setStatus("pending_request");

        await updateDoc(roomRef, {

            guestId: auth.currentUser.uid,
            requestStatus: "pending"

        });

        const unsub = onSnapshot(roomRef, (snap) => {

            if (!snap.exists()) {
                alert("Room deleted.");
                return;
            }

            const data = snap.data();

            if (data.status === "playing") {
                onGameStart(code);
            }

        });

        setUnsubscribeListener(() => unsub);
    }

    // =========================
    // UI
    // =========================

    if (mode === null) {

        return (
            <div>

                <button onClick={createRoom}>
                    Create Room
                </button>

                <br />
                <br />

                <input
                    placeholder="Enter Room Code"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                />

                <br />
                <br />

                <button
                    onClick={sendJoinRequest}
                    disabled={!inputCode.trim()}
                >
                    Join Room
                </button>

            </div>
        );
    }

    if (mode === "host") {

        return (
            <div>

                <h2>Room Code</h2>

                <h1>{roomCode}</h1>

                <p>Share this code with your friend.</p>

                {status === "request_received" ? (

                    <div>

                        <p>Someone wants to join.</p>

                        <button onClick={acceptRequest}>
                            Accept
                        </button>

                    </div>

                ) : (

                    <p>Waiting for player to join...</p>

                )}

            </div>
        );
    }

    if (mode === "guest") {

        return (
            <div>

                <h2>Room Code</h2>

                <h1>{roomCode}</h1>

                <p>Request sent.</p>

                <p>Waiting for host to accept...</p>

            </div>
        );
    }

    return null;
}

export default Lobby;