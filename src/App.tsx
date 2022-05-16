import { useEffect, useState } from 'react';
import './App.css';
import Wheel, { Segment } from './components/wheel';

const colorCodes = ['#E49091', '#80CF94', '#7888D2']
const configUrl = "https://gist.githubusercontent.com/rhipps/553eda6ba674da0260bce215c24bb191/raw/05892249bb922cf44d80b6ab0b4c3b884e35c9f8/cbus_resteraunts"

 const createResterauntSegments = (resterauntNames: string[]): Segment[] => {
   let tiles: Segment[] = []
   resterauntNames.forEach((name, idx) => tiles.push({ segmentText: name, segmentColorCode: colorCodes[idx % colorCodes.length] }) )
   return tiles
 }

const parseOutResterauntNames = (data: any) => data ? data.map((resterauntAndTags: Array<string>) => resterauntAndTags[0]) : []

function App() {
  const [names, setNames] = useState<Array<string>>([])
  
  useEffect(() => {
    fetch(configUrl, {method: 'GET'})
      .then(response => response.json())
      .then(data => setNames(parseOutResterauntNames(data.data)))
  }, [])

  return (
    <div className="App">
      <header className="App-header">
      </header>
      <div>
        <Wheel
            segments={createResterauntSegments(names)}
            onFinished={() => {}}
            durationFactor={300}
            displayWinningText
            canvasConfig={{width: window.innerWidth, height: window.innerHeight, wheelPositionX: window.innerWidth/2, wheelPositionY: window.innerHeight/2}}
            wheelConfig={{radius: window.innerWidth/3, primaryColor: 'black', secondaryColor: 'white', fontFamily: 'Arial', buttonText: 'Spin', spinButtonRadius: 50}}
        />
      </div>
    </div>
  );
}

export default App;
