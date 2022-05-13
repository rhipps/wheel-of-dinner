import { useEffect, useState } from 'react'

export type Segment = {
    segmentText: string
    segmentColorCode: string
    segmentTextColor?: string
}

export interface WheelComponentProps {
  segments: Segment[],
  winningSegmentText?: string,
  onFinished: Function,
  isOnlyOnce: boolean,
  upDuration: number,
  downDuration: number,
  canvasConfig: CanvasConfig,
  wheelConfig: WheelConfig
  displayWinningText?: boolean
}

export interface WheelConfig {
  radius: number,
  buttonText: string
  fontFamily: string,
  primaryColor: string,
  secondaryColor: string,
  spinButtonRadius: number
  spinButtonPrimaryColor?: string
  spinButtonSecondaryColor?: string
  outlineColor?: string
}

export interface CanvasConfig {
    width: number,
    height: number,
    wheelPositionX: number,
    wheelPositionY: number,
}

const getCanvas2dContext = (): CanvasRenderingContext2D => {
  let canvas = document.getElementById('canvas') as HTMLCanvasElement
  return canvas.getContext('2d')!
}

const clearCanvasArea = (canvasConfig: CanvasConfig): void => {
  getCanvas2dContext().clearRect(0, 0, canvasConfig.width, canvasConfig.height)
}

const getAngleDelta = (maxSpeed: number, progress: number): number => {
  return maxSpeed * Math.sin((progress * Math.PI) / 2 + Math.PI / 2)
}

const drawWheel = (angleCurrent: number, segments: Segment[], canvasConfig: CanvasConfig, wheelConfig: WheelConfig): void => {
  const canvasContext = getCanvas2dContext()
  const spingButtonPrimaryColor = wheelConfig.spinButtonPrimaryColor || wheelConfig.primaryColor
  const spingButtonSecondaryColor = wheelConfig.spinButtonPrimaryColor || wheelConfig.secondaryColor
  const wheelBorderThickness = 10
  const wheelOutlineColor = wheelConfig.outlineColor || wheelConfig.primaryColor

  canvasContext.lineWidth = 1
  canvasContext.strokeStyle = wheelConfig.primaryColor
  canvasContext.textBaseline = 'middle'
  canvasContext.textAlign = 'center'
  canvasContext.font = '1em ' + wheelConfig.fontFamily

  drawSegmentsOfWheel(segments ,angleCurrent, canvasConfig, wheelConfig)

  drawSpinButton(wheelConfig.buttonText, wheelConfig.fontFamily, wheelConfig.spinButtonRadius, spingButtonPrimaryColor, spingButtonSecondaryColor, canvasConfig)

  drawWheelOutline(canvasConfig, wheelConfig.radius, wheelBorderThickness, wheelOutlineColor)
}

const drawSegmentsOfWheel = (segments: Segment[], currentAngle: number, canvasConfig: CanvasConfig, wheelConfig: WheelConfig): void => {
  const PI2 = Math.PI * 2 // portion of circumference eq which is C = 2*PI*r
  let previousAngle = currentAngle

  segments.forEach((segment, index) => {
    const nextAngle = PI2 * ((index+1) / segments.length) + currentAngle
    drawSegment(segment, previousAngle, nextAngle, canvasConfig, wheelConfig)
    previousAngle = nextAngle
  })
}

const drawSegment = (segment: Segment, previousAngle: number, nextAngle: number, canvasConfig: CanvasConfig, wheelConfig: WheelConfig): void => {
  const canvasContext = getCanvas2dContext()
  const maxTextLength = 10

  canvasContext.save()
  canvasContext.beginPath()
  canvasContext.moveTo(canvasConfig.wheelPositionX, canvasConfig.wheelPositionY)
  canvasContext.arc(canvasConfig.wheelPositionX, canvasConfig.wheelPositionY, wheelConfig.radius, previousAngle, nextAngle, false)
  canvasContext.lineTo(canvasConfig.wheelPositionX, canvasConfig.wheelPositionY)
  canvasContext.closePath()
  canvasContext.fillStyle = segment.segmentColorCode
  canvasContext.fill()
  canvasContext.stroke()
  canvasContext.save()
  canvasContext.translate(canvasConfig.wheelPositionX, canvasConfig.wheelPositionY)
  canvasContext.rotate((previousAngle + nextAngle) / 2) // text rotated about half way through segment hence / 2
  canvasContext.fillStyle = segment.segmentTextColor || wheelConfig.secondaryColor
  canvasContext.font = 'bold 1em ' + wheelConfig.fontFamily
  canvasContext.fillText(segment.segmentText.substring(0, maxTextLength), wheelConfig.radius/2 + wheelConfig.spinButtonRadius/2, 0)
  canvasContext.restore()
}

const drawWheelOutline = (canvasConfig: CanvasConfig, radius: number, borderWidth: number, borderColor: string): void => {
  const PI2 = Math.PI * 2 // portion of circumference eq which is C = 2*PI*r
  const canvasContext = getCanvas2dContext()
  canvasContext.beginPath()
  //TODO maybe able to remove false... its a default
  canvasContext.arc(canvasConfig.wheelPositionX, canvasConfig.wheelPositionY, radius, 0, PI2, false)
  canvasContext.closePath()

  canvasContext.lineWidth = borderWidth
  canvasContext.strokeStyle = borderColor
  canvasContext.stroke()
}

const drawSpinButton = (buttonText: string, fontFamily: string, buttonRadius: number, primaryColor: string, secondaryColor: string, canvasConfig: CanvasConfig): void => {
  //TODO 2PI is just 360 degrees in radians can probably name this better and shove it some where
  const PI2 = Math.PI * 2
  const buttonOutlineThickness = 10

  const canvasContext = getCanvas2dContext()
  canvasContext.beginPath()
  canvasContext.arc(canvasConfig.wheelPositionX, canvasConfig.wheelPositionY, buttonRadius, 0, PI2, false)
  canvasContext.closePath()
  canvasContext.fillStyle = primaryColor
  canvasContext.lineWidth = buttonOutlineThickness
  canvasContext.strokeStyle = secondaryColor
  canvasContext.fill()
  canvasContext.font = 'bold 1em ' + fontFamily
  canvasContext.fillStyle = secondaryColor
  canvasContext.textAlign = 'center'
  canvasContext.fillText(buttonText, canvasConfig.wheelPositionX, canvasConfig.wheelPositionY)
  canvasContext.stroke()

  drawNeedle(buttonRadius, secondaryColor, canvasConfig)
}

const drawNeedle = (buttonRadius: number, needleColor: string,  canvasConfig: CanvasConfig): void => {
  const canvasContext = getCanvas2dContext()
  const needleHeight = buttonRadius/2

  canvasContext.lineWidth = 1
  canvasContext.strokeStyle = needleColor
  canvasContext.fillStyle = needleColor
  canvasContext.beginPath()
  canvasContext.moveTo(canvasConfig.wheelPositionX + buttonRadius/2, canvasConfig.wheelPositionY - buttonRadius + 1 )
  canvasContext.lineTo(canvasConfig.wheelPositionX - buttonRadius/2, canvasConfig.wheelPositionY - buttonRadius + 1)
  canvasContext.lineTo(canvasConfig.wheelPositionX, canvasConfig.wheelPositionY - buttonRadius - needleHeight)
  canvasContext.closePath()
  canvasContext.fill()
}

const findCurrentSegment = (segments: Segment[], currentAngle: number): Segment => {
  const change = currentAngle + Math.PI / 2
  let segmentIndex = segments.length - Math.floor((change / (Math.PI * 2)) * segments.length) - 1
  if (segmentIndex < 0) segmentIndex = segmentIndex + segments.length
  
  return segments[segmentIndex]
}

const drawText = (text: string, textColor: string, xPos: number, yPos: number, wheelConfig: WheelConfig): void => {
  const canvasContext = getCanvas2dContext()

  canvasContext.textAlign = 'center'
  canvasContext.textBaseline = 'middle'
  canvasContext.fillStyle = textColor
  canvasContext.font = 'bold 1.5em ' + wheelConfig.fontFamily
  canvasContext.fillText(text, xPos, yPos)
}

const drawCurrentWheelState = (canvasConfig: CanvasConfig, angleCurrent: number, segments: Segment[], currentSegment: Segment, isStarted: boolean, wheelConfig: WheelConfig, displayWinningText: boolean): void => {
  const textOffSetX = 10
  const textOffSetY = wheelConfig.radius + 50

  clearCanvasArea(canvasConfig)
  drawWheel(angleCurrent, segments, canvasConfig, wheelConfig)
  currentSegment = findCurrentSegment(segments, angleCurrent)
  isStarted && 
    displayWinningText &&
    drawText(currentSegment.segmentText, wheelConfig.secondaryColor, canvasConfig.wheelPositionX + textOffSetX, canvasConfig.wheelPositionY + textOffSetY, wheelConfig)
}

const wheelInit = (onSpinHandler: Function, canvasConfig: CanvasConfig, segments: Segment[], wheelConfig: WheelConfig): void => {
  initCanvas(onSpinHandler, canvasConfig)
  drawCurrentWheelState(canvasConfig, 0, segments, segments[0], false, wheelConfig, false)
}

const initCanvas = (onSpinHandler: any, canvasConfig: CanvasConfig) => {
  let canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (navigator.userAgent.indexOf('MSIE') !== -1) {
    canvas = document.createElement('canvas')
    canvas.setAttribute('width', String(canvasConfig.width))
    canvas.setAttribute('height', String(canvasConfig.height))
    canvas.setAttribute('id', 'canvas')
    document.getElementById('wheel')!.appendChild(canvas)
  }
  canvas.addEventListener('click', onSpinHandler, false)
}

const WheelComponent = (props: WheelComponentProps) => {
  const [isFinished, setFinished] = useState(false)
  const upTime = props.segments.length * props.upDuration
  const downTime = props.segments.length * props.downDuration
  
  let isStarted = false
  let currentSegment: Segment = props.segments[0]
  let timerHandle: NodeJS.Timeout = null
  let currentAngle: number = 0
  let angleDelta: number = 0
  let spinStart: number = 0
  let frames: number = 0

  const spin = (): void => {
    const timerDelay = props.segments.length
    isStarted = true

    if (!timerHandle) {
      spinStart = new Date().getTime()
      frames = 0 
      timerHandle = setInterval(onTimerTick, timerDelay)
    }
  }

  const onTimerTick = (): void => {
    frames++
    drawCurrentWheelState(props.canvasConfig, currentAngle, props.segments, currentSegment, isStarted, props.wheelConfig, props.displayWinningText)
    const duration = new Date().getTime() - spinStart
    const maxSpeed = Math.PI / props.segments.length
    const oneCircleInRadians = Math.PI * 2
    let progress = 0
    let finished = false

    if (duration < upTime) {
      progress = duration / upTime
      angleDelta = getAngleDelta(maxSpeed, progress)
    } else {
      if (props.winningSegmentText) {
        if (currentSegment.segmentText === props.winningSegmentText && frames > props.segments.length) {
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
  
    currentAngle += angleDelta
    while (currentAngle >= oneCircleInRadians) currentAngle -= oneCircleInRadians
    if (finished) {
      setFinished(true)
      props.onFinished(currentSegment)
      clearInterval(timerHandle)
      timerHandle = null
      angleDelta = 0
    }
  }

  useEffect(() => {
    wheelInit(spin, props.canvasConfig, props.segments, props.wheelConfig)
    setTimeout(() => {
      window.scrollTo(0, 1)
    }, 0)
  }, [])

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