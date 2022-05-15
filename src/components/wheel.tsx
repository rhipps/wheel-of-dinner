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
      durationFactor={300}
      displayWinningText
      canvasConfig={{width: 800, height:800, wheelPositionX: 400, wheelPositionY: 400}}
      wheelConfig={{radius: 250, primaryColor: 'black', secondaryColor: 'white', fontFamily: 'Arial', buttonText: 'Spin', spinButtonRadius: 50}}
    />
  )
}

export default Wheel;