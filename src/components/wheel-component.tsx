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

const WheelComponent = (props: WheelComponentProps) => {
  const [isFinished, setFinished] = useState(false)

  const timerDelay = props.segments.length
  let maxSpeed = Math.PI / props.segments.length
  const upTime = props.segments.length * props.upDuration
  const downTime = props.segments.length * props.downDuration

  //This should be any empty segment maybe? or null? or empty?
  let currentSegment = ''
  let isStarted = false
  
  let timerHandle: any = null
  
  let angleCurrent = 0
  let angleDelta = 0
  let canvasContext: any  = null
  
  let spinStart = 0
  let frames = 0

  //Can we just center this on the canvas
  const centerX = 300
  const centerY = 300

  useEffect(() => {
    wheelInit(props.canvasConfig)
    setTimeout(() => {
      window.scrollTo(0, 1)
    }, 0)
  }, [])

  const wheelInit = (config: CanvasConfig) => {
    initCanvas(config)
    wheelDraw()
  }

  const initCanvas = (config: CanvasConfig) => {
    let canvas = document.getElementById('canvas') as HTMLCanvasElement
    if (navigator.userAgent.indexOf('MSIE') !== -1) {
      canvas = document.createElement('canvas')
      canvas.setAttribute('width', String(config.width))
      canvas.setAttribute('height', String(config.height))
      canvas.setAttribute('id', 'canvas')
      document.getElementById('wheel')!.appendChild(canvas)
    }
    canvas.addEventListener('click', spin, false)
    canvasContext = canvas.getContext('2d')
  }

  const spin = () => {
    isStarted = true
    if (!timerHandle) {
      spinStart = new Date().getTime()
      // maxSpeed = Math.PI / ((segments.length*2) + Math.random())
      maxSpeed = Math.PI / props.segments.length
      frames = 0
      timerHandle = setInterval(onTimerTick, timerDelay)
    }
  }
  const onTimerTick = () => {
    frames++
    draw()
    const duration = new Date().getTime() - spinStart
    let progress = 0
    let finished = false
    if (duration < upTime) {
      progress = duration / upTime
      angleDelta = maxSpeed * Math.sin((progress * Math.PI) / 2)
    } else {
      if (props.winningSegment) {
        if (currentSegment === props.winningSegment && frames > props.segments.length) {
          progress = duration / upTime
          angleDelta =
            maxSpeed * Math.sin((progress * Math.PI) / 2 + Math.PI / 2)
          progress = 1
        } else {
          progress = duration / downTime
          angleDelta =
            maxSpeed * Math.sin((progress * Math.PI) / 2 + Math.PI / 2)
        }
      } else {
        progress = duration / downTime
        angleDelta = maxSpeed * Math.sin((progress * Math.PI) / 2 + Math.PI / 2)
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

  const wheelDraw = () => {
    clear()
    drawWheel()
    drawNeedle()
  }

  const draw = () => {
    clear()
    drawWheel()
    drawNeedle()
  }

  const drawSegment = (key: number, lastAngle: number, angle: number) => {
    const ctx = canvasContext
    const value = props.segments[key]
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, props.size, lastAngle, angle, false)
    ctx.lineTo(centerX, centerY)
    ctx.closePath()
    ctx.fillStyle = props.segColors[key]
    ctx.fill()
    ctx.stroke()
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((lastAngle + angle) / 2)
    ctx.fillStyle = props.contrastColor
    ctx.font = 'bold 1em ' + props.fontFamily
    ctx.fillText(value.substr(0, 21), props.size / 2 + 20, 0)
    ctx.restore()
  }

  const drawWheel = () => {
    const ctx = canvasContext
    let lastAngle = angleCurrent
    const len = props.segments.length
    const PI2 = Math.PI * 2
    ctx.lineWidth = 1
    ctx.strokeStyle = props.primaryColor
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.font = '1em ' + props.fontFamily
    for (let i = 1; i <= len; i++) {
      const angle = PI2 * (i / len) + angleCurrent
      drawSegment(i - 1, lastAngle, angle)
      lastAngle = angle
    }

    // Draw a center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 50, 0, PI2, false)
    ctx.closePath()
    ctx.fillStyle = props.primaryColor
    ctx.lineWidth = 10
    ctx.strokeStyle = props.contrastColor
    ctx.fill()
    ctx.font = 'bold 1em ' + props.fontFamily
    ctx.fillStyle = props.contrastColor
    ctx.textAlign = 'center'
    ctx.fillText(props.buttonText, centerX, centerY + 3)
    ctx.stroke()

    // Draw outer circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, props.size, 0, PI2, false)
    ctx.closePath()

    ctx.lineWidth = 10
    ctx.strokeStyle = props.primaryColor
    ctx.stroke()
  }

  const drawNeedle = () => {
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
    isStarted && ctx.fillText(currentSegment, centerX + 10, centerY + props.size + 50)
  }
  const clear = () => {
    const ctx = canvasContext
    ctx.clearRect(0, 0, 1000, 800)
  }
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