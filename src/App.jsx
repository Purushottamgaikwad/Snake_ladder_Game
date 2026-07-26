import { useState } from 'react'

import './App.css'
import Board from './components/Board'
import SnakeLadderBoard from './components/snake-ladder-zigzag'
import Dice from './components/Dice'

function App() {

  return (
    <>  
    
      <h1>hello Games</h1>
      <div className='main-container'>
        <Board/>
          
            {/* <SnakeLadderBoard/> */}
            
      </div>
            
  
     

    </>
  )
}

export default App
