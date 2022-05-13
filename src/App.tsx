import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Wheel from './components/wheel';
import { Segment } from './components/wheel-component';


const onFinished = function(){}

const segments: Segment[] = [
  {segmentText: 'McDonalds', segmentColorCode: '#EE4040'},
  {segmentText: 'Wendy\'s', segmentColorCode: '#F0CF50'},
  {segmentText: 'Raising Canes', segmentColorCode: '#3DA5E0'},
 ]

function App() {
  let [winner, setWinner] = useState()

  return (
    <div className="App">
      <header className="App-header">
        <Wheel 
            onFinishedCallBack={setWinner}
            segments={segments}    
        ></Wheel>
      </header>
    </div>
  );
}

export default App;
