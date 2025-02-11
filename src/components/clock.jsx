import React from 'react';
import { useTimer } from 'react-timer-hook';

export default function MyTimer({ 
  days, 
  hours, 
  minutes, 
  seconds, 
  isRunning, 
  start, 
  pause, 
  resume, 
  restart 
}) {
  return (
    <div className=" h-10 w-28 m-2 border-2 border-black flex">
       <div className="w-1/2 bg-lightSquare flex justify-center items-center border-r-2 border-black">    
            {minutes}
      </div>

      <div className="w-1/2 bg-darkSquare flex justify-center items-center border-l-2 border-black">
        {seconds}
      </div>
     </div>
  );
}

