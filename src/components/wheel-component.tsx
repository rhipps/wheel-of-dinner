import { useEffect, useState } from 'react'

//TODO replace segments / segColors with this type
export type Segment = {
    segmentText: String
    segmentColorCode: String
}

export interface WheelComponentProps {
  segments: string[],
  segColors: string[],
  winningSegment?: string,
  onFinished: Function,
  primaryColor: string,
  contrastColor: string,
  buttonText: string,
  isOnlyOnce: boolean,
  size: number,
  upDuration: number,
  downDuration: number,
  fontFamily: string,
  canvasConfig: CanvasConfig
}

export interface CanvasConfig {
    width: number,
    height: number
}

  

  const getAngleDelta = (maxSpeed: number, progress: number): number => {
    return maxSpeed * Math.sin((progress * Math.PI) / 2 + Math.PI / 2)
  }

  const drawSegment = (key: number, lastAngle: number, angle: number, canvasContext: any, props: any, centerX: number, centerY: number) => {
    const value = props.segments[key]
    canvasContext.save()
    canvasContext.beginPath()
    canvasContext.moveTo(centerX, centerY)
    canvasContext.arc(centerX, centerY, props.size, lastAngle, angle, false)
    canvasContext.lineTo(centerX, centerY)
    canvasContext.closePath()
    canvasContext.fillStyle = props.segColors[key]
    canvasContext.fill()
    canvasContext.stroke()
    canvasContext.save()
    canvasContext.translate(centerX, centerY)
    canvasContext.rotate((lastAngle + angle) / 2) // text rotated about half way through segment hence / 2
    canvasContext.fillStyle = props.contrastColor
    canvasContext.font = 'bold 1em ' + props.fontFamily
    canvasContext.fillText(value.substr(0, 21), props.size / 2 + 20, 0)
    canvasContext.restore()
  }

  const drawWheel = (canvasContext: any, angleCurrent: number, props: any, centerX: number, centerY: number) => {
    // Do some initial setup for drawing
    canvasContext.lineWidth = 1
    canvasContext.strokeStyle = props.primaryColor
    canvasContext.textBaseline = 'middle'
    canvasContext.textAlign = 'center'
    canvasContext.font = '1em ' + props.fontFamily

    // Draw inner segments of wheel
    console.log(angleCurrent)
    drawSegmentsOfWheel(canvasContext, props, centerX, centerY, angleCurrent)

    // Draw the spin dial circle
    drawSpinButton(canvasContext, props, centerX, centerY)

    // Draw outer spin wheels circle
    drawOuterCircle(canvasContext, centerX, centerY, props)
  }

  const drawSegmentsOfWheel = (canvasContext: any, props: any, centerX: number, centerY: number, angleCurrent: number) => {
    const PI2 = Math.PI * 2 // portion of circumference eq which is C = 2*PI*r
    const len = props.segments.length
    let lastAngle = angleCurrent

    //TODO once this is using a Segment object we can do a for (let [index, val] of props.segments.entries())
    // then we can drop the first param for `key` and just pass in the segment 
    for (let i = 1; i <= len; i++) {
      const angle = PI2 * (i / len) + angleCurrent
      drawSegment(i - 1, lastAngle, angle, canvasContext, props, centerX, centerY)
      lastAngle = angle
    }
  }

  const drawOuterCircle = (canvasContext: any, centerX: number, centerY: number, props: any ): void => {
    const PI2 = Math.PI * 2 // portion of circumference eq which is C = 2*PI*r

    canvasContext.beginPath()
    canvasContext.arc(centerX, centerY, props.size, 0, PI2, false)
    canvasContext.closePath()

    canvasContext.lineWidth = 10
    canvasContext.strokeStyle = props.primaryColor
    canvasContext.stroke()
  }

  const drawSpinButton = (canvasContext: any, props: any, centerX: number, centerY: number ): void => {
    const PI2 = Math.PI * 2 // portion of circumference eq which is C = 2*PI*r

    canvasContext.beginPath()
    canvasContext.arc(centerX, centerY, 50, 0, PI2, false)
    canvasContext.closePath()
    canvasContext.fillStyle = props.primaryColor
    canvasContext.lineWidth = 10
    canvasContext.strokeStyle = props.contrastColor
    canvasContext.fill()
    canvasContext.font = 'bold 1em ' + props.fontFamily
    canvasContext.fillStyle = props.contrastColor
    canvasContext.textAlign = 'center'
    canvasContext.fillText(props.buttonText, centerX, centerY + 3)
    canvasContext.stroke()
  }

  const drawNeedle = (canvasContext: any, props: any, centerX: number, centerY: number, angleCurrent: number, isStarted: boolean, currentSegment: string, canvasConfig: CanvasConfig, setCurrentSegment: Function) => {
    const ctx = canvasContext
    ctx.lineWidth = 1
    ctx.strokeStyle = props.contrastColor
    ctx.fileStyle = props.contrastColor
    ctx.beginPath()
    ctx.moveTo(centerX + 20, centerY - 50)
    ctx.lineTo(centerX - 20, centerY - 50)
    ctx.lineTo(centerX, centerY - 70)
    ctx.closePath()
    ctx.fill()
    const change = angleCurrent + Math.PI / 2
    let i =
      props.segments.length -
      Math.floor((change / (Math.PI * 2)) * props.segments.length) -
      1
    if (i < 0) i = i + props.segments.length
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = props.primaryColor
    ctx.font = 'bold 1.5em ' + props.fontFamily
    currentSegment = props.segments[i]
    setCurrentSegment(currentSegment)
    isStarted && ctx.fillText(currentSegment, centerX + 10, centerY + props.size + 50)
  }

  const initCanvas = (onSpinHandler: any, canvasConfig: CanvasConfig, centerX: number, centerY: number, isStarted: boolean, setFinished: Function, upTime: number, angleDelta: number, currentSegment: string, downTime: number, angleCurrent: number, timerHandle: any, spinStart: number, frames: number, props: any, timerDelay: number, setFrames: Function, setCurrentAngle: Function, setCurrentSegment: Function) => {
    let canvas = document.getElementById('canvas') as HTMLCanvasElement
    if (navigator.userAgent.indexOf('MSIE') !== -1) {
      canvas = document.createElement('canvas')
      canvas.setAttribute('width', String(canvasConfig.width))
      canvas.setAttribute('height', String(canvasConfig.height))
      canvas.setAttribute('id', 'canvas')
      document.getElementById('wheel')!.appendChild(canvas)
    }
    const canvasContext = canvas.getContext('2d')
    canvas.addEventListener('click', () => onSpinHandler(canvasContext, canvasConfig, centerX, centerY, setFinished, upTime, angleDelta, currentSegment, downTime, angleCurrent, timerHandle, spinStart, props, timerDelay, setCurrentSegment), false)
    return canvasContext
  }

  const handleSpinClick = () => {
    
  }

  const wheelDraw = (canvasContext: any, canvasConfig: CanvasConfig, angleCurrent: number, props: any, centerX: number, centerY: number, currentSegment: string, isStarted: boolean, setCurrentSegment: Function) => {
    canvasContext.clearRect(0, 0, canvasConfig.width, canvasConfig.height)
    drawWheel(canvasContext, angleCurrent, props, centerX, centerY)
    drawNeedle(canvasContext, props, centerX, centerY, angleCurrent, isStarted, currentSegment, canvasConfig, setCurrentSegment)
  }

  const wheelInit = (onSpinHandler: Function, config: CanvasConfig, angleCurrent: number, props: any , centerX: number, centerY: number, currentSegment: string, isStarted: boolean, setFinished: Function, upTime: number, angleDelta: number, downTime: number, timerHandle: any, spinStart: number, frames: number, timerDelay: number, setFrames: Function, setCurrentAngle: Function, setCurrentSegment: Function) => {
    const canvasContext = initCanvas(onSpinHandler, config, centerX, centerY, isStarted, setFinished, upTime, angleDelta, currentSegment, downTime, angleCurrent, timerHandle, spinStart, frames, props, timerDelay, setFrames, setCurrentAngle, setCurrentSegment)
    wheelDraw(canvasContext, config, angleCurrent, props, centerX, centerY, currentSegment, isStarted, setCurrentSegment)
  }

  const WheelComponent = (props: WheelComponentProps) => {
    const [isFinished, setFinished] = useState(false)
    let isStarted = false
    //const [frames, setFrames] = useState(0)
    // const [angleCurrent, setAngleCurrent] = useState(0)
    // const [angleDelta] = useState(0)
    // const [spinStart] = useState(0)
    // const [currentSegment, setCurrentSegment] = useState('')
    const [timerHandle] = useState(null)
  
    const timerDelay = props.segments.length
    
    const upTime = props.segments.length * props.upDuration
    const downTime = props.segments.length * props.downDuration
  
    //This should be any empty segment maybe? or null? or empty?
    let currentSegment = ''
    //let isStarted = false
    
    //let timerHandle: any = null
    
    let angleCurrent: number = 0
    let angleDelta = 0

     //Can we just center this on the canvas
     const centerX = 300
     const centerY = 300

     let spinStart = 0
     let frames = 0
   
     const setCurrentSegment = (value: string) => {
       currentSegment = value
     }

     const setCurrentAngle = (value: number) => {
       angleCurrent = value
     }

     

   // wheelInit(props.canvasConfig, angleCurrent, props, centerX, centerY, currentSegment, isStarted, setFinished, upTime, angleDelta, downTime, timerHandle, spinStart, maxSpeed, frames, timerDelay)
   
   const spin = (canvasContext: any, canvasConfig: CanvasConfig, centerX: number, centerY: number, setFinished: Function, upTime: number, angleDelta: number, currentSegment: string, downTime: number, angleCurrent: number, timerHandle: any, spinStart: number, props: any, timerDelay: number, setCurrentSegment: Function) => {
    isStarted = true
    if (!timerHandle) {
      spinStart = new Date().getTime()
      frames = 0
      timerHandle = setInterval(() => {
        onTimerTick(canvasContext, canvasConfig, centerX, centerY, isStarted, setFinished, spinStart, upTime, angleDelta,  props, currentSegment, downTime, timerHandle, setCurrentSegment)
      }, timerDelay)
    }
  }
  const onTimerTick = (canvasContext: any, canvasConfig: CanvasConfig, centerX: number, centerY: number, isStarted: boolean, setFinished: Function, spinStart: number, upTime: number, angleDelta: number, props: any, currentSegment: string, downTime: number, timerHandle: any, setCurrentSegment: Function) => {
    //how do we pass frames back to the original value
    frames++

    wheelDraw(canvasContext, canvasConfig, angleCurrent, props, centerX, centerY, currentSegment, isStarted, setCurrentSegment)
    const duration = new Date().getTime() - spinStart
    const maxSpeed = Math.PI / props.segments.length
    let progress = 0
    let finished = false
    if (duration < upTime) {
      progress = duration / upTime
      angleDelta = maxSpeed * Math.sin((progress * Math.PI) / 2)
    } else {
      if (props.winningSegment) {
        if (currentSegment === props.winningSegment && frames > props.segments.length) {
          progress = duration / upTime
          angleDelta = getAngleDelta(maxSpeed, progress)
          progress = 1
        } else {
          progress = duration / downTime
          angleDelta = getAngleDelta(maxSpeed, progress)
        }
      } else {
        progress = duration / downTime
        angleDelta = getAngleDelta(maxSpeed, progress)
      }
      if (progress >= 1) finished = true
    }

    angleCurrent += angleDelta
    while (angleCurrent >= Math.PI * 2) angleCurrent -= Math.PI * 2
    if (finished) {
      setFinished(true)
      props.onFinished(currentSegment)
      clearInterval(timerHandle)
      timerHandle = null
      angleDelta = 0
    }
  }

    useEffect(() => {
      wheelInit(spin, props.canvasConfig, angleCurrent, props, centerX, centerY, currentSegment, isStarted, setFinished, upTime, angleDelta, downTime, timerHandle, spinStart, 0, timerDelay, () =>{}, () => {}, setCurrentSegment)
      setTimeout(() => {
        window.scrollTo(0, 1)
      }, 0)
    }, [angleCurrent, angleDelta, isFinished, isStarted, timerHandle, spinStart, currentSegment])
  
    return (
      <div id='wheel'>
        <canvas
          id='canvas'
          width={props.canvasConfig.width}
          height={props.canvasConfig.height}
          style={{
            pointerEvents: isFinished && props.isOnlyOnce ? 'none' : 'auto'
          }}
        />
      </div>
    )
  }



export default WheelComponent