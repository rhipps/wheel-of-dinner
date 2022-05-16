import { useEffect, useState, useCallback } from 'react'

export type Segment = {
    segmentText: string
    segmentColorCode: string
    segmentTextColor?: string
}

export interface WheelComponentProps {
  segments: Segment[],
  onFinished: Function,
  durationFactor: number,
  canvasConfig: CanvasConfig,
  wheelConfig: WheelConfig
  displayWinningText?: boolean
  oneSpin?: boolean
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

const WHEEL_CANVAS_ID = 'drawingCanvas'
const STATIC_WHEEL_CANVAS_ID = 'staticCanvas'
const PI2 = Math.PI * 2

const getCanvas2dContext = (canvasId: string): CanvasRenderingContext2D => {
  let canvas = document.getElementById(canvasId) as HTMLCanvasElement
  return canvas.getContext('2d')!
}

const clearCanvasArea = (canvasConfig: CanvasConfig): void => {
  getCanvas2dContext(WHEEL_CANVAS_ID).clearRect(0, 0, canvasConfig.width, canvasConfig.height)
}

const drawWheel = (angleCurrent: number, segments: Segment[], canvasConfig: CanvasConfig, wheelConfig: WheelConfig): void => {
  const canvasContext = getCanvas2dContext(WHEEL_CANVAS_ID)

  canvasContext.lineWidth = 1
  canvasContext.strokeStyle = wheelConfig.primaryColor
  canvasContext.textBaseline = 'middle'
  canvasContext.textAlign = 'center'
  canvasContext.font = '1em ' + wheelConfig.fontFamily

  drawSegmentsOfWheel(segments ,angleCurrent, canvasConfig, wheelConfig)

  
}

const drawSegmentsOfWheel = (segments: Segment[], currentAngle: number, canvasConfig: CanvasConfig, wheelConfig: WheelConfig): void => {
  let previousAngle = currentAngle

  segments.forEach((segment, index) => {
    const nextAngle = PI2 * ((index+1) / segments.length) + currentAngle
    drawSegment(segment, previousAngle, nextAngle, canvasConfig, wheelConfig)
    previousAngle = nextAngle
  })
}

const drawSegment = (segment: Segment, previousAngle: number, nextAngle: number, canvasConfig: CanvasConfig, wheelConfig: WheelConfig): void => {
  const canvasContext = getCanvas2dContext(WHEEL_CANVAS_ID)
  const maxTextLength = 10

  canvasContext.save()
  canvasContext.beginPath()
  canvasContext.moveTo(canvasConfig.wheelPositionX, canvasConfig.wheelPositionY)
  canvasContext.arc(canvasConfig.wheelPositionX, canvasConfig.wheelPositionY, wheelConfig.radius, previousAngle, nextAngle)
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
  const canvasContext = getCanvas2dContext(STATIC_WHEEL_CANVAS_ID)
  canvasContext.beginPath()
  canvasContext.arc(canvasConfig.wheelPositionX, canvasConfig.wheelPositionY, radius, 0, PI2)
  canvasContext.closePath()

  canvasContext.lineWidth = borderWidth
  canvasContext.strokeStyle = borderColor
  canvasContext.stroke()
}

const drawSpinButton = (buttonText: string, fontFamily: string, buttonRadius: number, primaryColor: string, secondaryColor: string, canvasConfig: CanvasConfig): void => {
  const buttonOutlineThickness = 10

  const canvasContext = getCanvas2dContext(STATIC_WHEEL_CANVAS_ID)
  canvasContext.beginPath()
  canvasContext.arc(canvasConfig.wheelPositionX, canvasConfig.wheelPositionY, buttonRadius, 0, PI2)
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
  const canvasContext = getCanvas2dContext(STATIC_WHEEL_CANVAS_ID)
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
  const canvasContext = getCanvas2dContext(WHEEL_CANVAS_ID)

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

const drawStaticWheelElements = (wheelConfig: WheelConfig, canvasConfig: CanvasConfig): void => {
  const spingButtonPrimaryColor = wheelConfig.spinButtonPrimaryColor || wheelConfig.primaryColor
  const spingButtonSecondaryColor = wheelConfig.spinButtonPrimaryColor || wheelConfig.secondaryColor
  const wheelBorderThickness = 10
  const wheelOutlineColor = wheelConfig.outlineColor || wheelConfig.primaryColor

  drawSpinButton(wheelConfig.buttonText, wheelConfig.fontFamily, wheelConfig.spinButtonRadius, spingButtonPrimaryColor, spingButtonSecondaryColor, canvasConfig)

  drawWheelOutline(canvasConfig, wheelConfig.radius, wheelBorderThickness, wheelOutlineColor)
}

const wheelInit = (onSpinHandler: Function, canvasConfig: CanvasConfig, segments: Segment[], wheelConfig: WheelConfig): void => {
  clearCanvasArea(canvasConfig)
  initCanvas(onSpinHandler, canvasConfig)
  drawCurrentWheelState(canvasConfig, 0, segments, segments[0], false, wheelConfig, false)
  drawStaticWheelElements(wheelConfig, canvasConfig)
}

const initCanvas = (onSpinHandler: any, canvasConfig: CanvasConfig) => {
  // Grab canvas elements, clone them into themselves removing their attached event listeners 
  // regrab them from the dom so we have the updated elements that we can reattach the new listener
  let drawingCanvas = document.getElementById(WHEEL_CANVAS_ID) as HTMLCanvasElement
  let staticCanvas = document.getElementById(STATIC_WHEEL_CANVAS_ID) as HTMLCanvasElement
  drawingCanvas.replaceWith(drawingCanvas.cloneNode(true))
  staticCanvas.replaceWith(staticCanvas.cloneNode(true))
  staticCanvas = document.getElementById(STATIC_WHEEL_CANVAS_ID) as HTMLCanvasElement
  drawingCanvas = document.getElementById(WHEEL_CANVAS_ID) as HTMLCanvasElement

  if (navigator.userAgent.indexOf('MSIE') !== -1) {
    drawingCanvas.setAttribute('width', String(canvasConfig.width))
    drawingCanvas.setAttribute('height', String(canvasConfig.height))
    drawingCanvas.setAttribute('id', WHEEL_CANVAS_ID)
    document.getElementById('wheel')!.appendChild(drawingCanvas)

    staticCanvas.setAttribute('width', String(canvasConfig.width))
    staticCanvas.setAttribute('height', String(canvasConfig.height))
    staticCanvas.setAttribute('id', STATIC_WHEEL_CANVAS_ID)

    document.getElementById('wheel')!.appendChild(staticCanvas)
  }

  staticCanvas.addEventListener('click', onSpinHandler, false)
}

const getAngleDelta = (maxSpeed: number, progress: number): number => {
  const angle = maxSpeed * Math.sin(progress) + Math.cos(progress)
  return angle
}

const WheelComponent = (props: WheelComponentProps) => {
  const [isFinished, setFinished] = useState(false)
  const runTime = props.segments.length * (props.durationFactor * Math.random())
  let isStarted = false
  let currentSegment = props.segments[0]
  let timerHandle: NodeJS.Timeout = null
  let currentAngle: number = 0
  let angleDelta: number = 0
  let spinStart: number = 0

  const onTimerTick = useCallback((): void => {
      drawCurrentWheelState(props.canvasConfig, currentAngle, props.segments, currentSegment, isStarted, props.wheelConfig, props.displayWinningText)
      const duration = new Date().getTime() - spinStart
      const maxSpeed = Math.PI / props.segments.length
      const oneCircleInRadians = Math.PI * 2
      let progress = 0
      let finished = false

      progress = duration / runTime
      if (duration < runTime) {
        angleDelta = getAngleDelta(maxSpeed, progress)
      }
      if (progress >= 1) finished = true

      currentAngle += angleDelta
      while (currentAngle >= oneCircleInRadians && progress < 1) currentAngle -= oneCircleInRadians
      if (finished) {
        setFinished(true)
        props.onFinished(currentSegment)
        clearInterval(timerHandle)
        timerHandle = null
        angleDelta = 0
      }
  },[props.segments])

  const spin =  useCallback((): void => {
    const timerDelay = props.segments.length
    isStarted = true

    if (!timerHandle) {
      spinStart = new Date().getTime()
      timerHandle = setInterval(onTimerTick, timerDelay)
    }
  },[onTimerTick])

  useEffect(() => {
    wheelInit(spin, props.canvasConfig, props.segments, props.wheelConfig)
    setTimeout(() => {
      window.scrollTo(0, 1)
    }, 0)
  }, [spin])

  return (
    <div id='wheel'>
      <canvas
        id={WHEEL_CANVAS_ID}
        width={props.canvasConfig.width}
        height={props.canvasConfig.height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      <canvas
        id={STATIC_WHEEL_CANVAS_ID}
        width={props.canvasConfig.width}
        height={props.canvasConfig.height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: isFinished && props.oneSpin ? 'none' : 'auto',
          zIndex: 1
        }}
      />
    </div>
  )
}

export default WheelComponent