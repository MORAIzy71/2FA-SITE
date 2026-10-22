"use client"

import { useEffect, useRef, useState } from "react"
import { TOTP } from "otpauth"
import confetti from "canvas-confetti"
import { toast } from "sonner"
import { Check, KeyRound, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const PERIOD_MS = 30_000

function cleanSecret(value: string) {
  return value.replace(/[\s-]+/g, "").replace(/=+$/, "").toUpperCase()
}

function validateSecret(secret: string): string | null {
  if (!secret) return "Cole sua chave secreta primeiro."
  if (!/^[A-Z2-7]+$/.test(secret)) {
    return "Chave inválida: ela só pode ter letras de A a Z e números de 2 a 7."
  }
  if (secret.length < 16) return "Chave muito curta. Confira se você copiou ela inteira."
  return null
}

function generateCode(secret: string): string | null {
  try {
    return new TOTP({ secret, digits: 6, period: 30, algorithm: "SHA1" }).generate()
  } catch {
    return null
  }
}

function celebrateCopy(origin: HTMLElement | null) {
  const rect = origin?.getBoundingClientRect()
  const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5
  const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.6
  const gold = getComputedStyle(document.documentElement).getPropertyValue("--gold").trim()
  const snowflake = confetti.shapeFromText({ text: "❄", scalar: 1.4 })
  const base = { origin: { x, y }, disableForReducedMotion: true, zIndex: 60 }

  confetti({
    ...base,
    particleCount: 26,
    spread: 100,
    startVelocity: 32,
    gravity: 0.9,
    ticks: 90,
    scalar: 1.3,
    shapes: ["star"],
    colors: [gold, "#ffd978", "#fff1c2"],
  })
  confetti({
    ...base,
    particleCount: 14,
    spread: 140,
    startVelocity: 22,
    gravity: 0.5,
    ticks: 110,
    scalar: 1.4,
    shapes: [snowflake],
    flat: true,
  })
  confetti({
    ...base,
    particleCount: 30,
    spread: 360,
    startVelocity: 14,
    gravity: 0.4,
    ticks: 70,
    scalar: 0.55,
    shapes: ["circle"],
    colors: [gold, "#fff1c2"],
  })
}

export function TOTPGenerator() {
  const [input, setInput] = useState("")
  const [secret, setSecret] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [remainingMs, setRemainingMs] = useState(PERIOD_MS)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [giftKey, setGiftKey] = useState(0)
  const copyButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!secret) return
    const update = () => {
      const generated = generateCode(secret)
      if (generated) setCode(generated)
      setRemainingMs(PERIOD_MS - (Date.now() % PERIOD_MS))
    }
    update()
    const interval = setInterval(update, 200)
    return () => clearInterval(interval)
  }, [secret])

  const handleGenerate = (event: React.FormEvent) => {
    event.preventDefault()
    const cleaned = cleanSecret(input)
    const validationError = validateSecret(cleaned)
    if (validationError) {
      setError(validationError)
      return
    }
    if (!generateCode(cleaned)) {
      setError("Não foi possível ler essa chave. Verifique se ela está correta.")
      return
    }
    setError(null)
    setSecret(cleaned)
    setGiftKey((key) => key + 1)
  }

  const handleClear = () => {
    setInput("")
    setSecret(null)
    setCode("")
    setError(null)
  }

  const handleCopy = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      toast.error("Não foi possível copiar. Selecione o código e copie manualmente.")
      return
    }
    celebrateCopy(copyButtonRef.current)
    setCopied(true)
    toast.success("🎄 Código copiado com sucesso!")
    setTimeout(() => setCopied(false), 1600)
  }

  const seconds = Math.ceil(remainingMs / 1000)
  const isEnding = seconds <= 5

  return (
    <section
      aria-labelledby="generator-title"
      className="xmas-card snow-cap rounded-3xl border border-border bg-card/85 p-6 pt-8 backdrop-blur-md sm:p-8 sm:pt-10"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/40 bg-primary/15 text-gold">
          <KeyRound className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h2 id="generator-title" className="text-xl font-semibold text-foreground">
            Gerador de Código 2FA
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Cole a chave secreta TOTP recebida na sua compra.
          </p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="mt-6 flex flex-col gap-3" noValidate>
        <label htmlFor="secret" className="text-sm font-medium text-foreground">
          Chave secreta
        </label>
        <div className="relative">
          <Input
            id="secret"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Ex.: JBSWY3DPEHPK3PXP..."
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "secret-error" : undefined}
            className="h-14 rounded-2xl border-border bg-background/70 pr-12 text-base tracking-wider placeholder:tracking-normal placeholder:text-muted-foreground/60 focus-visible:border-gold/60 focus-visible:ring-gold/25"
          />
          {input && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpar chave"
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        {error && (
          <p id="secret-error" role="alert" className="text-sm leading-relaxed text-destructive">
            {error}
          </p>
        )}
        <Button
          type="submit"
          className="xmas-btn mt-1 h-14 rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {"🎁 Gerar Código"}
        </Button>
      </form>

      <div className="relative mt-8 rounded-2xl border border-border bg-background/60 p-5 sm:p-6">
        {giftKey > 0 && (
          <span
            key={giftKey}
            aria-hidden="true"
            className="gift-pop pointer-events-none absolute -top-6 right-6 text-4xl"
          >
            🎁
          </span>
        )}

        {code ? (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div
              aria-live="polite"
              aria-label={`Código atual: ${code}`}
              className="flex items-center gap-1.5 sm:gap-2"
            >
              {code.split("").map((digit, i) => (
                <span
                  key={`${code}-${i}`}
                  className={`digit-in flex h-14 w-11 items-center justify-center rounded-xl border border-border bg-secondary text-3xl font-semibold tabular-nums text-foreground sm:h-16 sm:w-12 sm:text-4xl ${
                    i === 3 ? "ml-2 sm:ml-3" : ""
                  }`}
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  {digit}
                </span>
              ))}
            </div>
            <CountdownRing seconds={seconds} fraction={remainingMs / PERIOD_MS} ending={isEnding} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <div aria-hidden="true" className="flex gap-1.5 sm:gap-2">
              {Array.from({ length: 6 }, (_, i) => (
                <span
                  key={i}
                  className={`flex h-14 w-11 items-center justify-center rounded-xl border border-dashed border-border text-2xl text-muted-foreground/40 sm:h-16 sm:w-12 ${
                    i === 3 ? "ml-2 sm:ml-3" : ""
                  }`}
                >
                  •
                </span>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Seu código de 6 números aparecerá aqui.
            </p>
          </div>
        )}

        <Button
          ref={copyButtonRef}
          type="button"
          variant="outline"
          onClick={handleCopy}
          disabled={!code}
          className="mt-6 h-12 w-full rounded-2xl border-gold/50 bg-transparent text-base font-medium text-gold transition-all hover:bg-gold/10 hover:text-gold active:scale-[0.98] disabled:opacity-40"
        >
          {copied ? (
            <>
              <Check className="h-5 w-5" aria-hidden="true" />
              Copiado!
            </>
          ) : (
            "📋 Copiar Código"
          )}
        </Button>
      </div>
    </section>
  )
}

function CountdownRing({
  seconds,
  fraction,
  ending,
}: {
  seconds: number
  fraction: number
  ending: boolean
}) {
  const radius = 26
  const circumference = 2 * Math.PI * radius

  return (
    <div
      role="timer"
      aria-label={`O código muda em ${seconds} segundos`}
      className="relative flex h-16 w-16 shrink-0 items-center justify-center"
    >
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="5" className="stroke-secondary" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          className={ending ? "stroke-primary" : "stroke-gold"}
        />
      </svg>
      <span
        className={`text-lg font-semibold tabular-nums ${ending ? "text-primary" : "text-foreground"}`}
      >
        {seconds}
      </span>
    </div>
  )
}
