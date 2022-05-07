import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Wheel, { Segment } from './components/wheel';


const onFinished = function(){}

const segments: Segment[] = [
  {text: 'McDonalds', colorCode: '#EE4040'},
  {text: 'Wendy\'s', colorCode: '#F0CF50'},
  {text: 'Raising Canes', colorCode: '#3DA5E0'},
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
