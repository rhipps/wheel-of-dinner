import WheelComponent, { CanvasConfig, Segment } from './wheel-component'

interface WheelConfig {
    segments: Segment[]
    onFinishedCallBack: Function
    spinButtonText?: string;
    size?: number;
}

function Wheel(props:WheelConfig) {
  return (
    <WheelComponent
      // segments={props.segments.map((e)=>e.text)}
      // segColors={props.segments.map((e)=>e.colorCode)}
      segments={props.segments}
      onFinished={props.onFinishedCallBack}
      isOnlyOnce={false}
      upDuration={300}
      downDuration={1000}
      displayWinningText
      canvasConfig={{width: 1000, height:800, wheelPositionX: 500, wheelPositionY: 300}}
      wheelConfig={{radius: 280, primaryColor: 'black', secondaryColor: 'white', fontFamily: 'Arial', buttonText: 'Spin', spinButtonRadius: 50}}
    />
  )
}

export default Wheel;