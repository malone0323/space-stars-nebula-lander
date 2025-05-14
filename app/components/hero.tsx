"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { megrim, geistMono } from "../lib/fonts"
import Loader from "./loader"
import { SocialLink } from "./social-link"

// Define types outside of the component to improve readability
type StarColor = string
type NebulaColor = { r: number; g: number; b: number }
type Point = { x: number; y: number }
type TrailPoint = Point & { opacity: number }

interface Star {
  x: number
  y: number
  size: number
  originalSize: number
  color: string
  opacity: number
  maxOpacity: number
  originalMaxOpacity: number
  fadeSpeed: number
  fadeDirection: number
  twinkleSpeed: number
  update: (mouseX: number, mouseY: number, mouseRadius: number) => void
  draw: (ctx: CanvasRenderingContext2D) => void
}

interface Nebula {
  x: number
  y: number
  width: number
  height: number
  baseColor: NebulaColor
  secondaryColor: NebulaColor
  tertiaryColor: NebulaColor
  opacity: number
  maxOpacity: number
  pulseSpeed: number
  pulseDirection: number
  rotation: number
  update: () => void
  draw: (ctx: CanvasRenderingContext2D) => void
}

interface ShootingStar {
  x: number
  y: number
  length: number
  angle: number
  speed: number
  opacity: number
  trail: TrailPoint[]
  isDead: boolean
  color: string
  update: () => void
  draw: (ctx: CanvasRenderingContext2D) => void
}

export default function Hero() {
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 }) // Start off-screen
  const mouseRadius = 150 // Radius of influence around the mouse

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Initialize arrays and constants
    const stars: Star[] = []
    const nebulae: Nebula[] = []
    const shootingStars: ShootingStar[] = []
    const starCount = 3000
    const nebulaCount = 8

    // Colors for celestial objects
    const starColors: StarColor[] = [
      "rgba(255, 255, 255, opacity)", // White
      "rgba(173, 216, 230, opacity)", // Light blue
      "rgba(255, 223, 186, opacity)", // Light orange
      "rgba(255, 192, 203, opacity)", // Pink
      "rgba(176, 224, 230, opacity)", // Powder blue
    ]

    // Enhanced nebula colors - more vibrant
    const nebulaColors: NebulaColor[] = [
      { r: 83, g: 101, b: 231 }, // Brighter Indigo
      { r: 186, g: 59, b: 206 }, // Brighter Purple
      { r: 255, g: 50, b: 119 }, // Brighter Pink
      { r: 20, g: 208, b: 232 }, // Brighter Cyan
      { r: 96, g: 195, b: 100 }, // Brighter Green
      { r: 255, g: 100, b: 50 }, // Orange
      { r: 255, g: 50, b: 50 }, // Red
      { r: 180, g: 60, b: 120 }, // Magenta
    ]

    // Star class implementation
    class StarImpl implements Star {
      x: number
      y: number
      size: number
      originalSize: number
      color: string
      opacity: number
      maxOpacity: number
      originalMaxOpacity: number
      fadeSpeed: number
      fadeDirection: number
      twinkleSpeed: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height

        // Size distribution with emphasis on smaller stars
        const sizeRandom = Math.random()
        this.size =
          sizeRandom < 0.8
            ? Math.random() * 0.5 + 0.5 // 80% small (0.1-0.9)
            : sizeRandom < 0.95
              ? Math.random() * 0.5 + 0.9 // 15% medium (0.9-1.7)
              : Math.random() * 0.5 + 1 // 5% large (1.7-2.5)

        this.originalSize = this.size

        // Color and opacity
        const colorIndex = Math.floor(Math.random() * starColors.length)
        this.maxOpacity = Math.random() * 0.5 + 0.5 // Between 0.5 and 1
        this.originalMaxOpacity = this.maxOpacity
        this.opacity = Math.random() * this.maxOpacity
        this.color = starColors[colorIndex].replace("opacity", this.opacity.toString())

        // Twinkling parameters
        this.fadeSpeed = Math.random() * 0.005 + 0.001
        this.fadeDirection = Math.random() < 0.5 ? -1 : 1
        this.twinkleSpeed = Math.random() * 0.01 + 0.005
      }

      update(mouseX: number, mouseY: number, mouseRadius: number) {
        // Calculate distance to mouse
        const dx = this.x - mouseX
        const dy = this.y - mouseY
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Subtle random movement
        if (Math.random() < 0.001) {
          this.x += (Math.random() - 0.5) * 0.2
          this.y += (Math.random() - 0.5) * 0.2
        }

        // Mouse interaction - if mouse is within radius of influence
        if (distance < mouseRadius) {
          // Calculate influence factor (1 at center, 0 at edge of radius)
          const influence = 1 - distance / mouseRadius

          // Subtle size increase based on proximity
          this.size = this.originalSize * (1 + influence * 0.3)

          // Increase brightness/opacity based on proximity
          this.maxOpacity = Math.min(1, this.originalMaxOpacity * (1 + influence * 0.8))
        } else {
          // Reset to original values when outside influence
          this.size = this.originalSize
          this.maxOpacity = this.originalMaxOpacity
        }

        // Twinkling effect
        this.opacity += this.fadeDirection * this.twinkleSpeed

        // Change direction at opacity bounds
        if (this.opacity <= 0.1) {
          this.opacity = 0.1
          this.fadeDirection = 1
        } else if (this.opacity >= this.maxOpacity) {
          this.opacity = this.maxOpacity
          this.fadeDirection = -1
        }

        // Update color with new opacity
        const colorIndex = this.color.indexOf("rgba(")
        if (colorIndex !== -1) {
          const baseColor = this.color.substring(0, this.color.lastIndexOf(",") + 1)
          this.color = `${baseColor} ${this.opacity})`
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()

        // Glow effect for larger stars
        if (this.size > 1.7) {
          const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3)
          glow.addColorStop(0, this.color)
          glow.addColorStop(1, "rgba(0, 0, 0, 0)")

          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // Enhanced Nebula class implementation with improved blurring and 50% reduced opacity
    class NebulaImpl implements Nebula {
      x: number
      y: number
      width: number
      height: number
      baseColor: NebulaColor
      secondaryColor: NebulaColor
      tertiaryColor: NebulaColor
      opacity: number
      maxOpacity: number
      pulseSpeed: number
      pulseDirection: number
      rotation: number
      noiseOffsetX: number
      noiseOffsetY: number
      noiseScale: number
      noiseSpeed: number
      cloudCount: number
      blendMode: GlobalCompositeOperation
      cloudParams: Array<{
        centerX: number
        centerY: number
        radiusX: number
        radiusY: number
        color: { r: number; g: number; b: number }
      }>
      detailPoints: Array<{
        x: number
        y: number
        size: number
        color: NebulaColor
        opacity: number
      }>
      // For Gaussian blur simulation
      blurPoints: Array<{
        x: number
        y: number
        radius: number
        intensity: number
        color: { r: number; g: number; b: number; a: number }
      }>

      constructor() {
        // Position and size - nebulae are large and can extend beyond screen
        const screenDiagonal = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height)
        this.width = Math.random() * screenDiagonal * 0.7 + screenDiagonal * 0.4
        this.height = this.width * (Math.random() * 0.4 + 0.6)

        // Position - can be partially off-screen
        this.x = Math.random() * (canvas.width + this.width) - this.width / 2
        this.y = Math.random() * (canvas.height + this.height) - this.height / 2

        // Colors - pick three colors for complex gradients
        const colorIndices = []
        while (colorIndices.length < 3) {
          const idx = Math.floor(Math.random() * nebulaColors.length)
          if (!colorIndices.includes(idx)) {
            colorIndices.push(idx)
          }
        }

        this.baseColor = nebulaColors[colorIndices[0]]
        this.secondaryColor = nebulaColors[colorIndices[1]]
        this.tertiaryColor = nebulaColors[colorIndices[2]]

        // Opacity - REDUCED BY 50% as requested
        this.maxOpacity = (Math.random() * 0.08 + 0.08) * 0.5 // Between 0.04 and 0.08 (50% of original)
        this.opacity = this.maxOpacity

        // Animation parameters - MUCH SLOWER for stability
        this.pulseSpeed = Math.random() * 0.0001 + 0.00005 // Very slow pulse
        this.pulseDirection = Math.random() < 0.5 ? -1 : 1
        this.rotation = Math.random() * Math.PI * 2

        // Noise parameters for cloud-like appearance - slower and smoother
        this.noiseOffsetX = Math.random() * 1000
        this.noiseOffsetY = Math.random() * 1000
        this.noiseScale = Math.random() * 0.01 + 0.005 // Smaller scale for smoother appearance
        this.noiseSpeed = Math.random() * 0.00005 + 0.00001 // Very slow movement

        // Cloud elements for complexity
        this.cloudCount = Math.floor(Math.random() * 5) + 15 // More cloud elements (15-20) for smoother appearance

        // Blend mode - use screen for more consistent blending
        this.blendMode = "screen"

        // Pre-compute cloud parameters for consistency
        this.cloudParams = []
        for (let i = 0; i < this.cloudCount; i++) {
          // Create overlapping cloud elements with varying sizes
          const radiusX = this.width * (0.2 + Math.random() * 0.4) // Smaller, more numerous clouds
          const radiusY = this.height * (0.2 + Math.random() * 0.4)
          const centerX = Math.random() * this.width
          const centerY = Math.random() * this.height

          // Mix the colors with different ratios for variety
          let useColor1, useColor2
          const colorSelect = Math.random()

          if (colorSelect < 0.33) {
            useColor1 = this.baseColor
            useColor2 = this.secondaryColor
          } else if (colorSelect < 0.66) {
            useColor1 = this.secondaryColor
            useColor2 = this.tertiaryColor
          } else {
            useColor1 = this.baseColor
            useColor2 = this.tertiaryColor
          }

          const mixRatio = Math.random()
          const r = Math.floor(useColor1.r * mixRatio + useColor2.r * (1 - mixRatio))
          const g = Math.floor(useColor1.g * mixRatio + useColor2.g * (1 - mixRatio))
          const b = Math.floor(useColor1.b * mixRatio + useColor2.b * (1 - mixRatio))

          this.cloudParams.push({
            centerX,
            centerY,
            radiusX,
            radiusY,
            color: { r, g, b },
          })
        }

        // Pre-compute detail points/stars
        this.detailPoints = []
        const detailPointsCount = Math.floor(Math.random() * 15) + 5
        for (let i = 0; i < detailPointsCount; i++) {
          const pointX = Math.random() * this.width
          const pointY = Math.random() * this.height
          const pointSize = Math.random() * 1.5 + 0.5

          // Use the brightest color for the point
          const brightestColor = [this.baseColor, this.secondaryColor, this.tertiaryColor]
            .sort((a, b) => a.r + a.g + a.b - (b.r + b.g + b.b))
            .pop()!

          const pointOpacity = Math.random() * 0.5 + 0.5

          this.detailPoints.push({
            x: pointX,
            y: pointY,
            size: pointSize,
            color: brightestColor,
            opacity: pointOpacity,
          })
        }

        // Generate blur points for Gaussian blur simulation
        this.blurPoints = []
        const blurPointsCount = Math.floor(Math.random() * 30) + 50 // 50-80 blur points
        for (let i = 0; i < blurPointsCount; i++) {
          const x = Math.random() * this.width
          const y = Math.random() * this.height
          const radius = Math.random() * (this.width / 4) + this.width / 8 // Large, overlapping radii
          const intensity = Math.random() * 0.4 + 0.1 // Low intensity for subtle effect

          // Use one of the three colors
          const colorIndex = Math.floor(Math.random() * 3)
          let color
          if (colorIndex === 0) color = this.baseColor
          else if (colorIndex === 1) color = this.secondaryColor
          else color = this.tertiaryColor

          this.blurPoints.push({
            x,
            y,
            radius,
            intensity,
            color: {
              r: color.r,
              g: color.g,
              b: color.b,
              a: intensity * 0.5, // 50% reduced intensity for blur points
            },
          })
        }
      }

      update() {
        // Pulsing effect - MUCH SLOWER with minimal variation
        this.opacity += this.pulseDirection * this.pulseSpeed

        // Change direction at opacity bounds with narrower range
        if (this.opacity <= this.maxOpacity * 0.9) {
          // Only 10% variation
          this.opacity = this.maxOpacity * 0.9
          this.pulseDirection = 1
        } else if (this.opacity >= this.maxOpacity) {
          this.opacity = this.maxOpacity
          this.pulseDirection = -1
        }

        // Slowly move noise offset for subtle animation
        this.noiseOffsetX += this.noiseSpeed
        this.noiseOffsetY += this.noiseSpeed
      }

      // Helper for color with opacity
      getColorWithOpacity(color: NebulaColor, opacity: number): string {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`
      }

      // Simplified Perlin noise approximation with improved stability
      simplifiedNoise(x: number, y: number): number {
        // Use smoother sine/cosine functions with reduced frequency
        const sampleX =
          Math.sin(x * this.noiseScale + this.noiseOffsetX) * Math.cos(y * this.noiseScale * 0.5 + this.noiseOffsetY)
        const sampleY =
          Math.cos(x * this.noiseScale * 0.2 + this.noiseOffsetY) *
          Math.sin(y * this.noiseScale * 0.8 + this.noiseOffsetX)
        return (sampleX + sampleY) * 0.5 + 0.5 // Normalize to 0-1 range
      }

      // Draw a single soft gradient blob
      drawSoftGradientBlob(
        ctx: CanvasRenderingContext2D,
        centerX: number,
        centerY: number,
        radiusX: number,
        radiusY: number,
        color: { r: number; g: number; b: number },
        opacity: number,
      ) {
        // Create a radial gradient that fades out completely
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(radiusX, radiusY))

        // Soft gradient with multiple color stops for smoother transition
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`)
        gradient.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.8})`)
        gradient.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.4})`)
        gradient.addColorStop(0.8, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.1})`)
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()

        // Use a full circle instead of an ellipse to avoid hard edges
        ctx.arc(centerX, centerY, Math.max(radiusX, radiusY), 0, Math.PI * 2)
        ctx.fill()
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Save context state
        ctx.save()

        // Set blend mode for more vibrant colors
        ctx.globalCompositeOperation = this.blendMode

        // Position and rotate
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2)
        ctx.rotate(this.rotation)
        ctx.translate(-this.width / 2, -this.height / 2)

        // First, draw a base color layer with a soft gradient
        const baseGradient = ctx.createRadialGradient(
          this.width / 2,
          this.height / 2,
          0,
          this.width / 2,
          this.height / 2,
          Math.max(this.width, this.height) / 1.5,
        )

        baseGradient.addColorStop(0, this.getColorWithOpacity(this.baseColor, this.opacity * 0.2))
        baseGradient.addColorStop(0.5, this.getColorWithOpacity(this.baseColor, this.opacity * 0.1))
        baseGradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.fillStyle = baseGradient
        ctx.beginPath()
        ctx.arc(this.width / 2, this.height / 2, Math.max(this.width, this.height) / 1.5, 0, Math.PI * 2)
        ctx.fill()

        // Draw multiple overlapping soft gradient blobs for the cloud-like effect
        for (const cloud of this.cloudParams) {
          // Get a noise value for this position for organic variation
          const noiseValue = this.simplifiedNoise(cloud.centerX, cloud.centerY)

          // Apply a very subtle variation to opacity based on noise
          const adjustedOpacity = this.opacity * (0.85 + noiseValue * 0.3)

          // Draw the soft gradient blob
          this.drawSoftGradientBlob(
            ctx,
            cloud.centerX,
            cloud.centerY,
            cloud.radiusX,
            cloud.radiusY,
            cloud.color,
            adjustedOpacity,
          )
        }

        // Draw additional blur points for a more organic, gaseous appearance
        for (const point of this.blurPoints) {
          const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius)

          gradient.addColorStop(
            0,
            `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, ${point.color.a * this.opacity})`,
          )
          gradient.addColorStop(
            0.4,
            `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, ${point.color.a * this.opacity * 0.6})`,
          )
          gradient.addColorStop(
            0.7,
            `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, ${point.color.a * this.opacity * 0.2})`,
          )
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
          ctx.fill()
        }

        // Add detail points/stars embedded in the nebula
        for (const point of this.detailPoints) {
          ctx.fillStyle = `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, ${point.opacity * this.opacity})`
          ctx.beginPath()
          ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2)
          ctx.fill()

          // Add glow
          const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.size * 4)
          glow.addColorStop(
            0,
            `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, ${point.opacity * this.opacity * 0.8})`,
          )
          glow.addColorStop(1, "rgba(0, 0, 0, 0)")

          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(point.x, point.y, point.size * 4, 0, Math.PI * 2)
          ctx.fill()
        }

        // Restore context
        ctx.restore()
      }
    }

    // ShootingStar class implementation
    class ShootingStarImpl implements ShootingStar {
      x: number
      y: number
      length: number
      angle: number
      speed: number
      opacity: number
      trail: TrailPoint[]
      isDead: boolean
      color: string

      constructor() {
        // Start position from screen edge
        const side = Math.floor(Math.random() * 4) // 0: top, 1: right, 2: bottom, 3: left
        this.trail = []
        this.isDead = false

        switch (side) {
          case 0: // top
            this.x = Math.random() * canvas.width
            this.y = 0
            this.angle = Math.PI / 2 + (Math.random() * 0.5 - 0.25)
            break
          case 1: // right
            this.x = canvas.width
            this.y = Math.random() * canvas.height
            this.angle = Math.PI + (Math.random() * 0.5 - 0.25)
            break
          case 2: // bottom
            this.x = Math.random() * canvas.width
            this.y = canvas.height
            this.angle = -Math.PI / 2 + (Math.random() * 0.5 - 0.25)
            break
          default: // left
            this.x = 0
            this.y = Math.random() * canvas.height
            this.angle = 0 + (Math.random() * 0.5 - 0.25)
        }

        // Trail and movement properties
        this.length = Math.random() * 40 + 20 // Between 20-60
        this.speed = Math.random() * 5 + 15 // Between 15-30
        this.opacity = Math.random() * 0.25 + 0.15 // Between 0.05-0.2

        // Color with slight blue variation
        const blueAmount = Math.floor(Math.random() * 20)
        this.color = `rgba(255, 255, ${255 - blueAmount}, 1)`
      }

      update() {
        // Move the shooting star
        const dx = Math.cos(this.angle) * this.speed
        const dy = Math.sin(this.angle) * this.speed
        this.x += dx
        this.y += dy

        // Add current position to trail
        this.trail.unshift({ x: this.x, y: this.y, opacity: this.opacity })

        // Limit trail length
        if (this.trail.length > this.length) {
          this.trail.pop()
        }

        // Fade trail points
        for (let i = 0; i < this.trail.length; i++) {
          this.trail[i].opacity = this.opacity * (1 - i / this.trail.length)
        }

        // Check if out of bounds
        if (this.x < -100 || this.x > canvas.width + 100 || this.y < -100 || this.y > canvas.height + 100) {
          this.isDead = true
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Draw trail
        if (this.trail.length > 1) {
          for (let i = 0; i < this.trail.length - 1; i++) {
            const point = this.trail[i]
            const nextPoint = this.trail[i + 1]

            // Create gradient for trail segment
            const gradient = ctx.createLinearGradient(point.x, point.y, nextPoint.x, nextPoint.y)

            gradient.addColorStop(0, this.color.replace("1)", `${point.opacity})`))
            gradient.addColorStop(1, this.color.replace("1)", `${nextPoint.opacity})`))

            ctx.beginPath()
            ctx.strokeStyle = gradient
            ctx.lineWidth = 0.5 * (1 - i / this.trail.length) // Thinner line
            ctx.moveTo(point.x, point.y)
            ctx.lineTo(nextPoint.x, nextPoint.y)
            ctx.stroke()
          }
        }

        // Draw head (brightest point)
        if (this.trail.length > 0) {
          const head = this.trail[0]
          ctx.beginPath()
          ctx.fillStyle = this.color.replace("1)", `${this.opacity})`)
          ctx.arc(head.x, head.y, 0.5, 0, Math.PI * 2) // Small head
          ctx.fill()

          // Add glow effect
          const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 3)
          glow.addColorStop(0, this.color.replace("1)", `${this.opacity})`))
          glow.addColorStop(1, "rgba(255, 255, 255, 0)")

          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(head.x, head.y, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // Create night sky gradient
    const createNightSkyGradient = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "rgba(5, 5, 20, 1)") // Dark blue at top
      gradient.addColorStop(0.5, "rgba(10, 10, 30, 1)") // Slightly lighter in middle
      gradient.addColorStop(1, "rgba(20, 20, 40, 1)") // Even lighter at bottom
      return gradient
    }

    // Initialize celestial objects
    for (let i = 0; i < starCount; i++) {
      stars.push(new StarImpl())
    }

    for (let i = 0; i < nebulaCount; i++) {
      nebulae.push(new NebulaImpl())
    }

    // Shooting star spawning
    const spawnShootingStar = () => {
      if (Math.random() < 0.25) {
        // Increased from 0.1 (10%) to 0.25 (25%)
        // 25% chance
        shootingStars.push(new ShootingStarImpl())
      }

      // Schedule next spawn - reduced time between checks
      const nextSpawnTime = Math.random() * 3000 + 2000 // 2-5 seconds (reduced from 4-12 seconds)
      setTimeout(spawnShootingStar, nextSpawnTime)
    }

    // Start shooting star cycle
    spawnShootingStar()

    // Add a few initial shooting stars
    for (let i = 0; i < 3; i++) {
      shootingStars.push(new ShootingStarImpl())
    }

    // Track mouse position - attach to document instead of canvas
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mousePositionRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    // Add event listener to document instead of canvas
    document.addEventListener("mousemove", handleMouseMove)

    // Animation loop
    function animate() {
      // Clear with gradient background
      ctx.fillStyle = createNightSkyGradient()
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw nebulae (behind everything else)
      for (const nebula of nebulae) {
        nebula.update()
        nebula.draw(ctx)
      }

      // Draw stars with mouse interaction
      for (const star of stars) {
        star.update(mousePositionRef.current.x, mousePositionRef.current.y, mouseRadius)
        star.draw(ctx)
      }

      // Update and draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const shootingStar = shootingStars[i]
        shootingStar.update()
        shootingStar.draw(ctx)

        // Remove dead shooting stars
        if (shootingStar.isDead) {
          shootingStars.splice(i, 1)
        }
      }

      requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full bg-black" />

      {loading ? (
        <Loader onComplete={() => setLoading(false)} />
      ) : (
        <>
          <motion.div
            className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className={`mb-6 text-6xl font-bold tracking-tighter sm:text-7xl lg:text-8xl ${megrim.className}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              HOMOS<span className={`text-[8px] align-super ml-0.5 tracking-tighter ${geistMono.className}`}>TM</span>
            </motion.h1>
            <motion.div
              className="flex flex-col items-center space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className={`text-[12px] tracking-wide text-white opacity-50 ${geistMono.className}`}>
                season 1 coming soon
              </p>
            </motion.div>
          </motion.div>

          {/* X logo positioned at the bottom */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-10 flex justify-center pb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <SocialLink href="https://x.com/malone" label="Follow on X (Twitter)" />
          </motion.div>
        </>
      )}
    </div>
  )
}
