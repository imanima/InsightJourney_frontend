"use client"

import { useRef, useEffect } from "react"

interface AudioVisualizerProps {
  isRecording: boolean
  stream?: MediaStream
}

export default function AudioVisualizer({ isRecording, stream }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode>()

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio
      canvas.height = canvas.clientHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resize()
    window.addEventListener("resize", resize)

    // If we have a stream and we're recording, set up the analyzer
    if (stream && isRecording) {
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()

      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const draw = () => {
        if (!ctx || !analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)

        // Clear canvas
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)

        // Draw background
        ctx.fillStyle = "#f8f9fa"
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)

        const barWidth = (canvas.clientWidth / bufferLength) * 2.5
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.clientHeight

          // Use a gradient for the bars
          const gradient = ctx.createLinearGradient(0, canvas.clientHeight, 0, 0)
          gradient.addColorStop(0, "#3b82f6") // blue-500
          gradient.addColorStop(1, "#60a5fa") // blue-400

          ctx.fillStyle = gradient
          ctx.fillRect(x, canvas.clientHeight - barHeight, barWidth, barHeight)

          x += barWidth + 1
        }

        animationRef.current = requestAnimationFrame(draw)
      }

      draw()
    } else {
      // If not recording, just draw a flat line
      ctx.fillStyle = "#f8f9fa"
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)

      const centerY = canvas.clientHeight / 2

      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(canvas.clientWidth, centerY)
      ctx.strokeStyle = "#d1d5db"
      ctx.lineWidth = 2
      ctx.stroke()

      // Add a pulsing circle in the middle when not recording
      if (!isRecording) {
        const pulseAnimation = () => {
          if (!ctx) return

          ctx.fillStyle = "#f8f9fa"
          ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)

          // Draw the flat line
          ctx.beginPath()
          ctx.moveTo(0, centerY)
          ctx.lineTo(canvas.clientWidth, centerY)
          ctx.strokeStyle = "#d1d5db"
          ctx.lineWidth = 2
          ctx.stroke()

          // Draw the pulsing circle
          const time = Date.now() / 1000
          const size = 10 + Math.sin(time * 2) * 5

          ctx.beginPath()
          ctx.arc(canvas.clientWidth / 2, centerY, size, 0, Math.PI * 2)
          ctx.fillStyle = "#3b82f6"
          ctx.fill()

          animationRef.current = requestAnimationFrame(pulseAnimation)
        }

        pulseAnimation()
      }
    }

    return () => {
      window.removeEventListener("resize", resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRecording, stream])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

