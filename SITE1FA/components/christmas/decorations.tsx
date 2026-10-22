const BULB_COLORS = ["bulb-red", "bulb-gold", "bulb-white"] as const

export function ChristmasLights() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-20 h-8"
    >
      <div className="absolute inset-x-0 top-1.5 h-px bg-foreground/20" />
      <div className="flex justify-between px-3">
        {Array.from({ length: 30 }, (_, i) => (
          <span
            key={i}
            className={`${i >= 16 ? "hidden sm:flex" : "flex"} flex-col items-center`}
            style={{ transform: `translateY(${i % 2 === 0 ? 2 : 7}px)` }}
          >
            <span className="h-1.5 w-1 rounded-sm bg-muted-foreground/60" />
            <span
              className={`bulb ${BULB_COLORS[i % 3]}`}
              style={{ animationDelay: `${(i % 5) * 0.45}s` }}
            />
          </span>
        ))}
      </div>
    </div>
  )
}

const FALLING_GIFTS = [
  { left: "6%", delay: "0s", duration: "22s", size: "1.4rem", opacity: 0.6 },
  { left: "16%", delay: "7s", duration: "19s", size: "1.1rem", opacity: 0.45 },
  { left: "30%", delay: "11s", duration: "26s", size: "1rem", opacity: 0.4 },
  { left: "48%", delay: "15s", duration: "24s", size: "1.25rem", opacity: 0.4 },
  { left: "62%", delay: "2s", duration: "20s", size: "1.15rem", opacity: 0.5 },
  { left: "76%", delay: "5s", duration: "28s", size: "1.1rem", opacity: 0.45 },
  { left: "90%", delay: "12s", duration: "21s", size: "1.5rem", opacity: 0.55 },
]

export function GiftRain() {
  return (
    <div
      aria-hidden="true"
      className="motion-decor pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {FALLING_GIFTS.map((gift) => (
        <span
          key={gift.left}
          className="gift-fall absolute top-0"
          style={{
            left: gift.left,
            animationDelay: gift.delay,
            animationDuration: gift.duration,
            fontSize: gift.size,
            opacity: gift.opacity,
          }}
        >
          <span className="gift-sway inline-block">🎁</span>
        </span>
      ))}
      <div className="sleigh-ride absolute left-0 top-[14%] whitespace-nowrap text-2xl opacity-80 sm:text-3xl">
        {"🦌🦌🛷🎅"}
      </div>
    </div>
  )
}

const TITLE_STARS = [
  { className: "-left-4 top-0 h-5 w-5", delay: "0s" },
  { className: "-right-6 top-2 h-4 w-4", delay: "0.8s" },
  { className: "left-1/4 -top-6 h-3 w-3", delay: "1.4s" },
  { className: "right-1/4 -bottom-4 h-3.5 w-3.5", delay: "0.4s" },
  { className: "-left-8 bottom-0 h-3 w-3", delay: "1.9s" },
  { className: "-right-2 -bottom-6 h-4 w-4", delay: "1.1s" },
]

export function TitleStars() {
  return (
    <>
      {TITLE_STARS.map((star) => (
        <svg
          key={star.className}
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`twinkle absolute fill-gold ${star.className}`}
          style={{ animationDelay: star.delay }}
        >
          <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
        </svg>
      ))}
    </>
  )
}
