import { parseCSSVariable } from "framer-motion";
import { useEffect,useState } from "react";
import '../styles/player.css'

function Player({ board,playerPosition ,currentPlayer}) {

    const [winner, setWinner] = useState(null);

    useEffect(()=>{
        if(playerPosition[0].position === 100){
            setWinner("Player 1 is Winner 👑")
            console.log(winner)
        }else if (playerPosition[1].position === 100) {
            setWinner("Player 2 is Winner 👑")
        }


    })


    
    return (
        <>
        {winner?<h1>{winner}</h1>:
            <h1>
               Turn of {playerPosition[currentPlayer].name}
                <br />
                {playerPosition[0].color} -- {playerPosition[0].position}
                <br />
                {playerPosition[1].color} -- {playerPosition[1].position}
            </h1>
            
            }



            
        </>
    );
}

export default Player;