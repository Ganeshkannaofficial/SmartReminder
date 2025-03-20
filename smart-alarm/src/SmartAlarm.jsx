import { useState, useEffect } from "react";
import GameModal from "./GameModal";
import "./SmartAlarm.css";

export default function SmartAlarm() {
  const [alarms, setAlarms] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlarmIndex, setActiveAlarmIndex] = useState(null);
  const [snoozeCount, setSnoozeCount] = useState(0);
  const [wakeUpSuccess, setWakeUpSuccess] = useState(0);
  const [alarmTime, setAlarmTime] = useState("");
  const [customRingtone, setCustomRingtone] = useState(null);
  const [showGamePanel, setShowGamePanel] = useState(false);
  const [gameMode, setGameMode] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currentFormattedTime = currentTime.toLocaleTimeString("en-US", { hour12: false }).slice(0, 5);
    alarms.forEach((alarm, index) => {
      if (
        alarm.time === currentFormattedTime &&
        !alarm.ringing &&
        !alarm.stopped &&  // NEW: Prevent re-triggering stopped alarms
        (!alarm.snoozedUntil || currentTime >= alarm.snoozedUntil)
      ) {
        ringAlarm(index);
      }
    });
  }, [currentTime, alarms]);

  const handleCustomRingtone = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newSound = new Audio(URL.createObjectURL(file));
      setCustomRingtone(newSound);
    }
  };

  const setAlarm = () => {
    if (alarmTime && customRingtone) {
      if (alarms.find((alarm) => alarm.time === alarmTime)) {
        alert("An alarm is already set for this time.");
        return;
      }
      const ringtoneClone = new Audio(customRingtone.src);
      setAlarms([...alarms, { time: alarmTime, ringing: false, ringtone: ringtoneClone, snoozedUntil: null, stopped: false }]);
      setAlarmTime("");
      setCustomRingtone(null);
    } else {
      alert("Please select both time and a ringtone before setting the alarm!");
    }
  };

  const ringAlarm = (index) => {
    let updatedAlarms = [...alarms];

    // Stop other ringing alarms
    updatedAlarms = updatedAlarms.map((alarm, i) => {
      if (i !== index && alarm.ringing) {
        if (alarm?.ringtone) {
          alarm.ringtone.pause();
          alarm.ringtone.currentTime = 0;
        }
        return { ...alarm, ringing: false, snoozedUntil: null };
      }
      return alarm;
    });

    // Play current alarm
    const alarmToRing = updatedAlarms[index];
    const ringtoneClone = new Audio(alarmToRing.ringtone.src);
    ringtoneClone.volume = Math.min(1, 0.5 + snoozeCount * 0.2);
    ringtoneClone.loop = true;
    ringtoneClone.play().catch((err) => console.log("Autoplay blocked:", err));

    updatedAlarms[index] = {
      ...alarmToRing,
      ringtone: ringtoneClone,
      ringing: true,
      snoozedUntil: null
    };

    setAlarms(updatedAlarms);
    setActiveAlarmIndex(index);
  };

  const stopSpecificAlarm = (index) => {
    const updatedAlarms = [...alarms];
    const alarmToStop = updatedAlarms[index];
    if (alarmToStop?.ringtone) {
      alarmToStop.ringtone.pause();
      alarmToStop.ringtone.currentTime = 0;
    }
    // Remove alarm permanently when manually stopped
    updatedAlarms.splice(index, 1);
    setAlarms(updatedAlarms);

    // If the stopped alarm was active, reset active index
    if (index === activeAlarmIndex) {
      setActiveAlarmIndex(null);
    }
  };

  const handleSnooze = () => {
    setGameMode("snooze");
    setShowGamePanel(true);
  };

  const handleStopAlarm = () => {
    setGameMode("stop");
    setShowGamePanel(true);
  };

  const stopAlarm = () => {
    if (activeAlarmIndex !== null) {
      const updatedAlarms = [...alarms];
      const alarm = updatedAlarms[activeAlarmIndex];
      if (alarm?.ringtone) {
        alarm.ringtone.pause();
        alarm.ringtone.currentTime = 0;
      }
      updatedAlarms[activeAlarmIndex] = {
        ...alarm,
        ringing: false,
        snoozedUntil: null,
        stopped: true // MARK as stopped to prevent retrigger
      };
      setAlarms(updatedAlarms);
      setActiveAlarmIndex(null);
      setWakeUpSuccess(wakeUpSuccess + 1);
    }
  };

  const handleGameResult = (result) => {
    setShowGamePanel(false);
    if (result === "win") {
      if (gameMode === "stop") {
        stopAlarm();
      } else if (gameMode === "snooze") {
        setSnoozeCount(snoozeCount + 1);
        if (activeAlarmIndex !== null) {
          const updatedAlarms = [...alarms];
          const alarm = updatedAlarms[activeAlarmIndex];
          if (alarm?.ringtone) {
            alarm.ringtone.pause();
            alarm.ringtone.currentTime = 0;
          }
          alarm.ringing = false;
          alarm.snoozedUntil = new Date(currentTime.getTime() + 5000); // 5 sec snooze
          setAlarms(updatedAlarms);
        }
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
        <button onClick={setAlarm} disabled={!alarmTime || !customRingtone}>
          Set Alarm
        </button>
      </div>

      <div className="alarms-list">
        <h2>Set Alarms</h2>
        {alarms.map((alarm, index) => (
          <div key={index} className="alarm-item">
            <span>{alarm.time}</span>
            <span>⏰ {alarm.ringing ? "Ringing!" : "Alarm Set"}</span>
            <button onClick={() => stopSpecificAlarm(index)}>Stop</button>
          </div>
        ))}
      </div>

      {activeAlarmIndex !== null && alarms[activeAlarmIndex]?.ringing && !showGamePanel && (
        <div className="alarm-active">
          <p>ALARM RINGING! ({alarms[activeAlarmIndex].time})</p>
          <button onClick={handleSnooze}>Snooze</button>
          <button onClick={handleStopAlarm}>Stop</button>
        </div>
      )}

      {showGamePanel && (
        <GameModal
          mode={gameMode}
          snoozeCount={snoozeCount}
          onResult={handleGameResult}
          onClose={() => setShowGamePanel(false)}
        />
      )}

      <div className="stats">
        <h2>Statistics</h2>
        <p>Snooze Count: {snoozeCount}</p>
        <p>Wake-Up Success: {wakeUpSuccess}</p>
      </div>
    </div>
  );
}
