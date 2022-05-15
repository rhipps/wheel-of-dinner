import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Wheel from './components/wheel';
import { Segment } from './components/wheel-component';



const segments: Segment[] = [
  {segmentText: '123McDonalds', segmentColorCode: '#EE4040'},
  {segmentText: 'Wendy\'s', segmentColorCode: '#F0CF50'},
  {segmentText: 'Raising Canes', segmentColorCode: '#3DA5E0'},
 ]

for (let i = 0; i <= 4; i++) segments.push({segmentText: `tester${i}`, segmentColorCode: '#555544'})

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <Wheel 
            onFinishedCallBack={() => {}}
            segments={segments}    
        ></Wheel>
      </header>
    </div>
  );
}

export default App;
