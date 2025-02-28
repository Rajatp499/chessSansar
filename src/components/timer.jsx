import React from 'react';
import { useTimer } from 'react-timer-hook';

export default function Timer({ expiryTimestamp, onTimeUp, onPause, onResume, onRestart, onStart, onIncrement, highlight }) {
  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      console.warn('Time is up');
      if (onTimeUp) onTimeUp();
    },
    autoStart: false,
  });

  // Expose control functions to parent component
  React.useEffect(() => {
    if (onPause) onPause(pause);
    if (onResume) onResume(resume);
    if (onRestart) onRestart(restart);
    if (onStart) onStart(start);
    if (onIncrement) onIncrement((secondsToAdd) => {
      console.log("total time remaining: ", totalSeconds, "   seconds to add: ", secondsToAdd);
      const newT = new Date();
      newT.setSeconds(newT.getSeconds() + totalSeconds + secondsToAdd);
      restart(newT);
    });
  }, [onPause, onResume, onRestart, onStart, onIncrement, pause, resume, restart, start, expiryTimestamp]);

  return (
      <div className={`h-10 w-28 m-2 border-2 border-black ${highlight ? 'border-red-500' : 'border-black'} flex`}>
         <div className="w-1/2 bg-darkSquare flex justify-center items-center border-r-2 border-black">
          {hours}
        </div>
        <div className="w-1/2 bg-lightSquare flex justify-center items-center border-r-2 border-black">    
              {minutes}
        </div>

        <div className="w-1/2 bg-darkSquare flex justify-center items-center border-l-2 border-black">
          {seconds}
        </div>
     </div>
  );
}


// How to use timer?
// Below is the example

// export default function App() {
//   const [expiryTimestamp, setExpiryTimestamp] = useState(() => {
//     const time = new Date();
//     time.setSeconds(time.getSeconds() + 600); // 10 minutes timer
//     return time;
//   });

//   const pauseRef = useRef(null);
//   const resumeRef = useRef(null);
//   const restartRef = useRef(null);
//   const startRef = useRef(null);
//   const incrementRef = useRef(null);

//   const handlePause = (pause) => {
//     pauseRef.current = pause;
//   };

//   const handleResume = (resume) => {
//     resumeRef.current = resume;
//   };

//   const handleRestart = (restart) => {
//     restartRef.current = restart;
//   };

//   const handleStart = (start) => {
//     startRef.current = start;
//   };

//   const handleIncrement = (increment) => {
//     incrementRef.current = increment;
//   };

//   return (
//     <div>
//       <MyTimer
//         expiryTimestamp={expiryTimestamp}
//         onTimeUp={() => alert('Time is up!')}
//         onPause={handlePause}
//         onResume={handleResume}
//         onRestart={handleRestart}
//         onStart={handleStart}
//         onIncrement={handleIncrement}
//         highlight={true}
//       />
//       <div className="mt-4">
//         <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => startRef.current()}>Start</button>
//         <button className="px-4 py-2 bg-yellow-500 text-white rounded" onClick={() => pauseRef.current()}>Pause</button>
//         <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={() => resumeRef.current()}>Resume</button>
//         <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => {
//           const newExpiryTimestamp = new Date();
//           newExpiryTimestamp.setSeconds(newExpiryTimestamp.getSeconds() + 600); // 10 minutes timer
//           restartRef.current(newExpiryTimestamp);
//         }}>Restart</button>
//         <button className="px-4 py-2 bg-purple-500 text-white rounded" onClick={() => incrementRef.current(30)}>Add 30 seconds</button>
//       </div>
//     </div>
//   );
// }