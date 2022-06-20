import { useEffect, useState } from 'react';
import './App.css';
import Wheel, { Segment } from './components/wheel';
import Tile from './components/tile';
import { MdOutlineFastfood } from 'react-icons/md'
import styled from 'styled-components'
import { TaggedTemplateExpression } from 'typescript';

type Category = {
 name: string,
 icon: any,
 resterauntNames: string[],
 selected: boolean
}

const colorCodes = ['#E49091', '#80CF94', '#7888D2']
const rowWidth = 3
const configUrl = "https://gist.githubusercontent.com/rhipps/553eda6ba674da0260bce215c24bb191/raw/05892249bb922cf44d80b6ab0b4c3b884e35c9f8/cbus_resteraunts"

const ChangeViewButton = styled.button`
    border-style: solid;
    border-width: 3px;
    border-radius: 25px 25px 25px 25px;
    border-color: #CCCCCC;
    background: #F2F2F2;
    color: '#AAAAAA';
    width: 200px;
    height: 50px;
`

const createResterauntSegments = (resterauntNames: string[]): Segment[] => {
  let segments: Segment[] = []
  resterauntNames.forEach((name, idx) => segments.push({ segmentText: name, segmentColorCode: colorCodes[idx % colorCodes.length] }) )
  return segments
}

const wheelPage = (names: any) => {
  return(<div>
    <Wheel
          segments={createResterauntSegments(names)}
          onFinished={() => {}}
          durationFactor={500}
          displayWinningText
          canvasConfig={{width: window.innerWidth, height: window.innerHeight, wheelPositionX: window.innerWidth/2, wheelPositionY: window.innerHeight/2, offSetY: 75}}
          wheelConfig={{radius: window.innerWidth/3, primaryColor: 'black', secondaryColor: 'white', fontFamily: 'Arial', buttonText: 'Spin', spinButtonRadius: window.innerWidth/16}}
    />
  </div>)
}

const tilePage = (categories: any, rowWidth: number, onTileClick: Function) => {
  let tiles = []
  tiles = categories.map((category: any) => <Tile title={category.name} icon={category.icon} toggled={category.selected} onClick={onTileClick(category)}/>)
  let result: any = []
  tiles.forEach((element: any, idx: number) => {
    if (idx % rowWidth === 0) {
      result.push(<br />)
    }
    result.push(element)
  });

  return result
}

const setSelectedTile = (setCategories: Function) => (category: Category) => () => {
  category.selected = !category.selected
  setCategories((old: Category[]) => {
    const index = old.findIndex(el => el.name == category.name)
    old[index] = category
    return [...old]
  })
}

const parseWheelData = (data: any) => {

  let resByTags = data.reduce((prev: any, cur: string[]) => {
    cur.slice(1).forEach((tag: string) => prev[tag] = [...prev[tag] || [], cur[0]])
    return prev
  }, {})

  let categories: Category[] = []

  for (const tag in resByTags) {
    categories.push({name: tag, icon: <MdOutlineFastfood />, resterauntNames: resByTags[tag], selected: false})
  }

  return categories
}

function App() {
  const [resterauntNames, setResterauntNames] = useState<Array<string>>([])
  const [readyToSpin, setReadyToSpin] = useState<boolean>()
  const [categories, setCategories] = useState<Array<Category>>([])
  
  useEffect(() => {
    fetch(configUrl, {method: 'GET'})
      .then(response => response.json())
      .then(data => setCategories(parseWheelData(data.data)))
  }, [])

  useEffect(() => {
    const activeCategories = categories.filter(category => category.selected)
    const combinedResNames = activeCategories.reduce((prev: string[], cur: Category) => [...prev, ...cur.resterauntNames], [])
    setResterauntNames([...new Set(combinedResNames)])
  }, [readyToSpin, categories])

  return (
    <div className="App">
      <div>
        {!readyToSpin && <ChangeViewButton onClick={() => setReadyToSpin(!readyToSpin)}>Take me to the wheel!</ChangeViewButton>}
        <br />
        {!readyToSpin && tilePage(categories, rowWidth, setSelectedTile(setCategories))}
      </div>
      <div>
        {readyToSpin && <ChangeViewButton onClick={() => setReadyToSpin(!readyToSpin)}>I want to pick more food...</ChangeViewButton>}
        <br />
        {readyToSpin && wheelPage(resterauntNames)}
      </div>
    </div>
  );
}

export default App;
