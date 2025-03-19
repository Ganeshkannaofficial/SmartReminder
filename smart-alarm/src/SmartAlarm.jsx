import { useState, useEffect } from "react";
import "./SmartAlarm.css";

export default function SmartAlarm() {
  const [alarms, setAlarms] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [snoozeCount, setSnoozeCount] = useState(0);
  const [wakeUpSuccess, setWakeUpSuccess] = useState(0);
  const [isSnoozing, setIsSnoozing] = useState(false);
  const [isStopTask, setIsStopTask] = useState(false);
  const [alarmTime, setAlarmTime] = useState("");
  const [customRingtone, setCustomRingtone] = useState(null);

  const tasks = [
    { type: "math", question: "What is 5 + 3?", answer: "8", difficulty: 1 },
    { type: "logic", question: "Which number comes next: 2, 4, 8, 16, __?", answer: "32", difficulty: 2 },
    { type: "math", question: "Solve: 12 * 4", answer: "48", difficulty: 3 },
    { type: "logic", question: "What is the missing letter: A, C, E, G, __?", answer: "I", difficulty: 4 }
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

  const handleCustomRingtone = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newSound = new Audio(URL.createObjectURL(file));
      setCustomRingtone(newSound);
    }
  };

  const setAlarm = () => {
    if (alarmTime && customRingtone) {
      const ringtoneClone = new Audio(customRingtone.src);

      if (alarms.find((alarm) => alarm.time === alarmTime)) {
        alert("An alarm is already set for this time.");
        return;
      }

      setAlarms([...alarms, { time: alarmTime, ringing: false, ringtone: ringtoneClone }]);
      setAlarmTime("");
      setCustomRingtone(null);
    } else {
      alert("Please select both time and a ringtone before setting the alarm!");
    }
  };

  const ringAlarm = (index) => {
    if (activeAlarm?.ringtone) {
      activeAlarm.ringtone.pause();
      activeAlarm.ringtone.currentTime = 0;
    }

    const ringingAlarm = alarms[index];

    if (ringingAlarm?.ringtone) {
      ringingAlarm.ringtone.volume = Math.min(1, 0.5 + snoozeCount * 0.2);
      ringingAlarm.ringtone.loop = true;
      ringingAlarm.ringtone.play().catch((err) => console.log("Autoplay blocked:", err));
    }

    const updatedAlarms = alarms.filter((_, i) => i !== index);
    setAlarms(updatedAlarms);

    setActiveAlarm({ ...ringingAlarm, ringing: true });
  };

  const handleSnooze = () => {
    setShowPuzzle(true);
    setSelectedTask(tasks[snoozeCount % tasks.length]);
  };

  const solveTask = (answer) => {
    if (answer === selectedTask?.answer) {
      setShowPuzzle(false);

      if (activeAlarm?.ringtone) {
        activeAlarm.ringtone.pause();
        activeAlarm.ringtone.currentTime = 0;
      }

      if (isStopTask) {
        stopAlarm();
        setIsStopTask(false);
      } else {
        setSnoozeCount(snoozeCount + 1);
        setIsSnoozing(true);

        setTimeout(() => {
          setIsSnoozing(false);
          if (activeAlarm) {
            activeAlarm.ringtone.play().catch((err) => console.log("Autoplay blocked:", err));
          }
        }, 5000);
      }
    }
  };

  const handleStopAlarm = () => {
    setShowPuzzle(true);
    setIsSnoozing(false);
    setIsStopTask(true);
    setSelectedTask(tasks[Math.floor(Math.random() * tasks.length)]);
  };

  const stopAlarm = () => {
    if (activeAlarm?.ringtone) {
      activeAlarm.ringtone.pause();
      activeAlarm.ringtone.currentTime = 0;
    }
    setActiveAlarm(null);
    setWakeUpSuccess(wakeUpSuccess + 1);
  };

  // **New: Stop specific alarm in the list**
  const stopSpecificAlarm = (index) => {
    const alarmToStop = alarms[index];
    if (alarmToStop?.ringtone) {
      alarmToStop.ringtone.pause();
      alarmToStop.ringtone.currentTime = 0;
    }
    const updatedAlarms = alarms.filter((_, i) => i !== index);
    setAlarms(updatedAlarms);
  };

  return (
    <div className="container">
      <h1>Smart Alarm</h1>
      <div className="alarm-box">
        <p>Current Time: {currentTime.toLocaleTimeString()}</p>
        <input type="time" value={alarmTime} onChange={(e) => setAlarmTime(e.target.value)} />
        <input type="file" accept="audio/*" onChange={handleCustomRingtone} />
        <button onClick={setAlarm} disabled={!alarmTime || !customRingtone}>
          Set Alarm
        </button>
      </div>

      <div className="alarms-list">
        <h2>Set Alarms</h2>
        {alarms.map((alarm, index) => (
          <div key={index} className="alarm-item">
            <span>{alarm.time}</span>
            <span>⏰ Alarm Set</span>
            <button onClick={() => stopSpecificAlarm(index)}>Stop</button>
          </div>
        ))}
      </div>

      {activeAlarm && !showPuzzle && !isSnoozing && (
        <div className="alarm-active">
          <p>ALARM RINGING! ({activeAlarm.time})</p>
          <button onClick={handleSnooze}>Snooze</button>
          <button onClick={handleStopAlarm}>Stop</button>
        </div>
      )}

      {showPuzzle && selectedTask && (
        <div className="puzzle-box">
          <h2>Complete this task to continue</h2>
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
