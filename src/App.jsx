import { useEffect, useState } from 'react'
import './styles/App.css'
import Board from './components/Board'
import Onlineboard from './components/Onlineboard'

import Dice from './components/Dice'
import { color } from 'framer-motion'
import Lobby from "./Lobby.jsx"
import { button } from 'framer-motion/client'


function App() {

  const [roomCode, setRoomCode] = useState(null);
  const [mode, setMode] = useState(null);

  function handleGameStart(code) {
        setRoomCode(code); 
    }
  function handleMode(e){
      setMode(e.target.textContent)
  }


  if(mode === null){
    return (<>
      <h1 className="game-title">THE SNAKE & LADDER GAME</h1>  
        <h2 style={{
            textAlign: 'center',
            fontSize: '40px',
            fontWeight: 500,
            letterSpacing: '2px',
            color: '#333',
            margin: '0 0 24px',
        }}>
            Select Mode
        </h2>       
        
        <br />
      <button onClick={(e)=>handleMode(e)}>Online</button>  <br />    <button  onClick={(e)=>handleMode(e)}>Offline</button>

    </>
    )
  }

  if(mode === 'Offline'){

    return(<>

    <h1 className="game-title">THE SNAKE & LADDER GAME</h1>   
    <div className='main-container'>
        <Board/>
                      
      </div>
    </>
    )
  }

  if(mode === 'Online'){
      return (
        <>  
          <h1 className="game-title">THE SNAKE & LADDER GAME</h1>   

          {!roomCode ? ( <Lobby onGameStart={handleGameStart} />    ) : (<Onlineboard roomCode={roomCode} />   )} 

        {/* {!roomCode ? ( <Lobby onGameStart={handleGameStart} />    ) : (<Board roomCode={roomCode} />   )}  */}

        </>
      )
}
}

export default App
