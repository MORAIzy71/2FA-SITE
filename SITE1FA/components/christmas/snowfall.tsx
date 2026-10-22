"use client"

import { useEffect, useRef } from "react"

interface Flake {
  x: number
  y: number
  radius: number
  speed: number
  phase: number
  opacity: number
}

export function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const snowColor =
      getComputedStyle(document.documentElement).getPropertyValue("--snow").trim() || "#f7f3ee"
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = 0
    let height = 0
    let flakes: Flake[] = []
    let frame = 0

    const createFlake = (anywhere: boolean): Flake => ({
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : -6,
      radius: 0.6 + Math.random() * 2.2,
      speed: 0.25 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.3 + Math.random() * 0.6,
    })

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = snowColor
      for (const flake of flakes) {
        ctx.globalAlpha = flake.opacity
        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(150, width / 8))
      flakes = Array.from({ length: count }, () => createFlake(true))
      if (reducedMotion) draw()
    }

    const tick = () => {
      for (const flake of flakes) {
        flake.phase += 0.012
        flake.y += flake.speed * (0.6 + flake.radius * 0.35)
        flake.x += Math.sin(flake.phase) * 0.35
        if (flake.y > height + 6) Object.assign(flake, createFlake(false))
      }
      draw()
      frame = requestAnimationFrame(tick)
    }

    const onVisibility = () => {
      cancelAnimationFrame(frame)
      if (!document.hidden && !reducedMotion) frame = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener("resize", resize)
    document.addEventListener("visibilitychange", onVisibility)
    if (!reducedMotion) frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  )
}
