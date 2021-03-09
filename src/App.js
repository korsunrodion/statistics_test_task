import React, { useState } from 'react';
import { start, stop, getStats } from './data'
import './App.css';
import Box from './components/box'

function App() {
  const [currentState, setCurrentState] = useState("idle")
  const [mean, setMean] = useState(0);
  const [sd, setSd] = useState(0);
  const [median, setMedian] = useState(0);
  const [mode, setMode] = useState([0]);
  const [modeCount, setModeCount] = useState(0);
  const [status, setStatus] = useState("");
  const [losses, setLosses] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [count, setCount] = useState(0);

  function startOnClick(evt) {
    if (currentState === "idle") {
      setStatus("Starting..");
      start();
      setStatus("Started");
      setCurrentState("work")
    }
  }

  function updateStatsOnClick(evt) {
    if (currentState === "work") {
      setStatus("Getting stats..");
      const stats = getStats();
      setMean(stats.mean);
      setSd(stats.sd);
      setMedian(stats.median);
      setMode(stats.mode);
      setModeCount(stats.modeCount);
      setLosses(stats.losses);
      setTimeSpent(stats.timeSpent);
      setCount(stats.count);
      setStatus("Ok");
    }
  }

  function stopOnClick(evt) {
    if (currentState === "work") {
      setStatus("Stopping..");
      stop();
      setStatus("Stopped");
    }
  }

  return (
    <div className="App">
      <h1>Quotes Statistics</h1>
      <div className="controls">
        <button onClick={startOnClick}>Start</button>
        <button onClick={updateStatsOnClick}>Stats</button>
        <button onClick={stopOnClick}>Stop</button>
        <span>{status}</span>
      </div>
      <div className="stats">
        <div className="row">
          <Box header="Mean" value={mean}/>
          <Box header="Standart deviation" value={sd}/>
          <Box header="Median" value={median}/>
        </div>
        <Box header="Mode" value={mode} subtext={`with ${modeCount} entries`}/>
        <div className="row">
          <Box header="Losses" value={losses}/>
          <Box header="Time spent" value={timeSpent} subtext="ms"/>
          <Box header="Received" value={count}/>
        </div>
      </div>
    </div>
  );
}

export default App;
