import React, { useState } from 'react';
import { start, stop, getStats } from './data'
import './App.css';

function App() {
  const [stats, setStats] = useState(0);

  function showStats() {
    const stats = getStats();
    setStats(`Count is ${stats.count}, sum is ${stats.sum}, mean is ${stats.mean}, sd is ${stats.sd}, median is ${stats.median}, mode is ${stats.mode} with ${stats.modeCount} entries`);
  }

  return (
    <div className="App">
      <p>{stats}</p>
      <button onClick={start}>Start</button>
      <button onClick={showStats}>Stats</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}

export default App;
