import WheelComponent, { CanvasConfig } from './wheel-component'

interface WheelConfig {
    segments: Segment[]
    onFinishedCallBack: Function
    spinButtonText?: string;
    size?: number;
}

export type Segment = {
    text: string
    colorCode: string
}

function Wheel(props:WheelConfig) {
  return (
    <WheelComponent
      segments={props.segments.map((e)=>e.text)}
      segColors={props.segments.map((e)=>e.colorCode)}
      onFinished={props.onFinishedCallBack}
      primaryColor='black'
      contrastColor='white'
      buttonText={props.spinButtonText || 'Spin'}
      isOnlyOnce={false}
      size={280}
      upDuration={100}
      downDuration={1000}
      fontFamily='Arial'
      canvasConfig={{width: 1000, height:800}}
    />
  )
}

export default Wheel;