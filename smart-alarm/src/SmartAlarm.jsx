import { useState, useEffect } from "react";
import "./SmartAlarm.css";

export default function SmartAlarm() {
  const [alarmTime, setAlarmTime] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [snoozeCount, setSnoozeCount] = useState(0);
  const [wakeUpSuccess, setWakeUpSuccess] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [alarmSound, setAlarmSound] = useState(new Audio("/alarm.mp3"));
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [isStopTask, setIsStopTask] = useState(false);
  const [isSnoozing, setIsSnoozing] = useState(false);

  const handleCustomRingtone = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newSound = new Audio(URL.createObjectURL(file));
      setAlarmSound(newSound);
    }
  };

  const tasks = [
    { type: "math", question: "What is 5 + 3?", answer: "8", difficulty: 1 },
    { type: "math", question: "What is 12 - 4?", answer: "8", difficulty: 1 },
    { type: "math", question: "What is 3 × 3?", answer: "9", difficulty: 1 },
    { type: "logic", question: "Which word does not belong: Apple, Banana, Carrot, Grape?", answer: "Carrot", difficulty: 2 },
    { type: "logic", question: "If you rearrange the letters of 'C A T', you get a word. What is it?", answer: "CAT", difficulty: 2 },
    { type: "memory", question: "Remember this sequence: 7, 2, 9. Type it in order.", answer: "7,2,9", difficulty: 3 },
    { type: "memory", question: "Remember this sequence: Red, Blue, Green. Type it in order.", answer: "Red,Blue,Green", difficulty: 3 },
    { type: "logic", question: "Which number comes next: 2, 4, 8, 16, __?", answer: "32", difficulty: 4 },
    { type: "math", question: "Solve: (5 × 6) + (3 × 4)", answer: "42", difficulty: 4 }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (
      alarmTime &&
      !isAlarmActive &&
      !isSnoozing &&
      currentTime.toLocaleTimeString("en-US", { hour12: false }).slice(0, 5) === alarmTime
    ) {
      setIsAlarmActive(true);
      setIsSnoozing(false);
      alarmSound.volume = Math.min(1, 0.5 + snoozeCount * 0.2);
      alarmSound.loop = true;

      alarmSound
        .play()
        .catch((err) => console.log("Autoplay blocked:", err));
    }
  }, [currentTime, alarmTime, isAlarmActive, snoozeCount, alarmSound, isSnoozing]);

  const handleSnooze = () => {
    setSnoozeCount(snoozeCount + 1);
    setShowPuzzle(true);
    setIsSnoozed(true);
    setIsStopTask(false);
    const filteredTasks = tasks.filter(t => t.difficulty <= Math.min(1 + snoozeCount, 4));
    setSelectedTask(filteredTasks[Math.floor(Math.random() * filteredTasks.length)]);
  };

  const handleStopAlarm = () => {
    setShowPuzzle(true);
    setIsSnoozed(false);
    setIsStopTask(true);
    const filteredTasks = tasks.filter(t => t.difficulty <= Math.min(1 + snoozeCount, 4));
    setSelectedTask(filteredTasks[Math.floor(Math.random() * filteredTasks.length)]);
  };

  const solveTask = (answer) => {
    if (answer === selectedTask?.answer) {
      setShowPuzzle(false);
      setWakeUpSuccess(wakeUpSuccess + 1);
      alarmSound.pause();
      alarmSound.currentTime = 0;

      if (isSnoozed) {
        setIsSnoozing(true);
        setIsAlarmActive(false);
        setTimeout(() => {
          setIsSnoozing(false);
          setIsAlarmActive(true);
          alarmSound.play();
        }, 5000);
      } else if (isStopTask) {
        setIsAlarmActive(false);
        setAlarmTime("");
      }
    }
  };

  return (
    <div className="container">
      <h1>Smart Alarm</h1>
      <div className="alarm-box">
        <p>Current Time: {currentTime.toLocaleTimeString()}</p>
        <input type="time" value={alarmTime} onChange={(e) => setAlarmTime(e.target.value)} />
        <input type="file" accept="audio/*" onChange={handleCustomRingtone} />
        <button onClick={() => setIsAlarmActive(false)}>Set Alarm</button>
      </div>

      {isAlarmActive && !showPuzzle && !isSnoozing && (
        <div className="alarm-active">
          <p>ALARM RINGING!</p>
          <button onClick={handleSnooze}>Snooze</button>
          <button onClick={handleStopAlarm}>Stop</button>
        </div>
      )}

      {showPuzzle && selectedTask && (
        <div className="puzzle-box">
          <h2>Complete this task to dismiss</h2>
          <p>{selectedTask.question}</p>
          <input type="text" placeholder="Enter answer" onChange={(e) => solveTask(e.target.value)} />
        </div>
      )}

      <div className="stats">
        <h2>Statistics</h2>
        <p>Snooze Count: {snoozeCount}</p>
        <p>Wake-Up Success: {wakeUpSuccess}</p>
      </div>
    </div>
  );
}
