import { useState, useEffect } from "react";
import "./SmartAlarm.css";

export default function SmartAlarm() {
  const [alarms, setAlarms] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarmSound, setAlarmSound] = useState(new Audio("/alarm.mp3"));
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeAlarmIndex, setActiveAlarmIndex] = useState(null);
  const [snoozeCount, setSnoozeCount] = useState(0);
  const [wakeUpSuccess, setWakeUpSuccess] = useState(0);
  const [isSnoozing, setIsSnoozing] = useState(false);
  const [isStopTask, setIsStopTask] = useState(false);

  const handleCustomRingtone = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newSound = new Audio(URL.createObjectURL(file));
      setAlarmSound(newSound);
    }
  };

  const tasks = [
    { type: "math", question: "What is 5 + 3?", answer: "8", difficulty: 1 },
    { type: "logic", question: "Which number comes next: 2, 4, 8, 16, __?", answer: "32", difficulty: 2 }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currentFormattedTime = currentTime.toLocaleTimeString("en-US", { hour12: false }).slice(0, 5);

    alarms.forEach((alarm, index) => {
      if (alarm.time === currentFormattedTime && !alarm.ringing && !isSnoozing) {
        ringAlarm(index);
      }
    });
  }, [currentTime, alarms, isSnoozing]);

  const addAlarm = (time) => {
    if (time) {
      setAlarms([...alarms, { time, ringing: false }]);
    }
  };

  const removeAlarm = (index) => {
    setAlarms(alarms.filter((_, i) => i !== index));
  };

  const ringAlarm = (index) => {
    setActiveAlarmIndex(index);
    alarmSound.volume = Math.min(1, 0.5 + snoozeCount * 0.2);
    alarmSound.loop = true;
    alarmSound.play().catch((err) => console.log("Autoplay blocked:", err));

    setAlarms((prevAlarms) =>
      prevAlarms.map((alarm, i) => (i === index ? { ...alarm, ringing: true } : alarm))
    );
  };

  const handleSnooze = () => {
    setSnoozeCount(snoozeCount + 1);
    setIsSnoozing(true);
    setIsStopTask(false);
    stopAlarm();

    setTimeout(() => {
      setIsSnoozing(false);
      if (activeAlarmIndex !== null) {
        ringAlarm(activeAlarmIndex);
      }
    }, 5000);
  };

  const handleStopAlarm = () => {
    setShowPuzzle(true);
    setIsSnoozing(false);
    setIsStopTask(true);
    setSelectedTask(tasks[Math.floor(Math.random() * tasks.length)]);
  };

  const solveTask = (answer) => {
    if (answer === selectedTask?.answer) {
      setShowPuzzle(false);
      setWakeUpSuccess(wakeUpSuccess + 1);
      stopAlarm();

      if (isStopTask) {
        removeAlarm(activeAlarmIndex); // Completely remove the alarm on correct stop answer
      }
    }
  };

  const stopAlarm = () => {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    setActiveAlarmIndex(null);
    setAlarms((prevAlarms) =>
      prevAlarms.map((alarm, i) => (i === activeAlarmIndex ? { ...alarm, ringing: false } : alarm))
    );
  };

  return (
    <div className="container">
      <h1>Smart Alarm</h1>
      <div className="alarm-box">
        <p>Current Time: {currentTime.toLocaleTimeString()}</p>
        <input type="time" onChange={(e) => addAlarm(e.target.value)} />
        <input type="file" accept="audio/*" onChange={handleCustomRingtone} />
      </div>

      <div className="alarms-list">
        <h2>Set Alarms</h2>
        {alarms.map((alarm, index) => (
          <div key={index} className="alarm-item">
            <span>{alarm.time}</span>
            <button onClick={() => removeAlarm(index)}>❌</button>
          </div>
        ))}
      </div>

      {activeAlarmIndex !== null && alarms[activeAlarmIndex]?.ringing && !showPuzzle && !isSnoozing && (
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
