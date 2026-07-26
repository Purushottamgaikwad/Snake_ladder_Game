import { useState } from 'react'

import './styles/App.css'
import Board from './components/Board'
import Dice from './components/Dice'
import { color } from 'framer-motion'

function App() {

  return (
    <>  
    
<h1 className="game-title">THE SNAKE & LADDER GAME</h1>    
  <div className='main-container'>
        <Board/>
                      
      </div>
            
  
     

    </>
  )
}

export default App
