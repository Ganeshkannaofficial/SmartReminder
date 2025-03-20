// ClockPicker.js
import React, { useState } from 'react';
import Clock from 'react-analog-time-picker';
import 'react-analog-time-picker/build/css/index.css';

const ClockPicker = ({ onTimeSelect }) => {
  const [selectedTime, setSelectedTime] = useState(new Date());

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    onTimeSelect(time);
  };

  return (
    <div className="clock-picker">
      <Clock
        value={selectedTime}
        onChange={handleTimeChange}
        hoursFormat={12}
        size={200}
        backgroundColor="#fff"
        handsColor="#009ffd"
        digitsColor="#2a2a72"
      />
    </div>
  );
};

export default ClockPicker;
