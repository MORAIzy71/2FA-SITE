"use client"

import { useEffect, useRef, useState } from "react"
import { TOTP } from "otpauth"
import confetti from "canvas-confetti"
import { Check, Copy, KeyRound, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const PERIOD_MS = 30_000
const MIN_SECRET_LENGTH = 16

type CopyStatus = "idle" | "copied" | "blocked"

function cleanSecret(value: string) {
  return value.replace(/[\s-]+/g, "").replace(/=+$/, "").toUpperCase()
}

function hasInvalidCharacters(secret: string) {
  return !/^[A-Z2-7]*$/.test(secret)
}

function generateCode(secret: string): string | null {
  try {
    return new TOTP({ secret, digits: 6, period: 30, algorithm: "SHA1" }).generate()
  } catch {
    return null
  }
}

async function writeToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function celebrateCopy(origin: HTMLElement | null) {
  const rect = origin?.getBoundingClientRect()
  const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5
  const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5
  const gold = getComputedStyle(document.documentElement).getPropertyValue("--gold").trim()
  const snowflake = confetti.shapeFromText({ text: "❄", scalar: 1.4 })
  const base = { origin: { x, y }, disableForReducedMotion: true, zIndex: 60 }

  confetti({
    ...base,
    particleCount: 28,
    spread: 110,
    startVelocity: 32,
    gravity: 0.9,
    ticks: 90,
    scalar: 1.3,
    shapes: ["star"],
    colors: [gold, "#ffd978", "#fff1c2"],
  })
  confetti({
    ...base,
    particleCount: 12,
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
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle")
  const [giftKey, setGiftKey] = useState(0)
  const codeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!secret) return
    const update = () => {
      const generated = generateCode(secret)
      if (generated) setCode(generated)
      setRemainingMs(PERIOD_MS - (Date.now() % PERIOD_MS))
    }
    update()
    const interval = setInterval(update, 250)
    return () => clearInterval(interval)
  }, [secret])

  const copyCode = async (value: string) => {
    const ok = await writeToClipboard(value)
    setCopyStatus(ok ? "copied" : "blocked")
    if (ok) celebrateCopy(codeRef.current)
  }

  const resetResult = () => {
    setSecret(null)
    setCode("")
    setCopyStatus("idle")
  }

  const handleChange = (value: string) => {
    setInput(value)
    const cleaned = cleanSecret(value)

    if (!cleaned) {
      setError(null)
      resetResult()
      return
    }
    if (hasInvalidCharacters(cleaned)) {
      setError("Chave inválida: use apenas letras de A a Z e números de 2 a 7.")
      resetResult()
      return
    }
    if (cleaned.length < MIN_SECRET_LENGTH) {
      setError(null)
      resetResult()
      return
    }

    const generated = generateCode(cleaned)
    if (!generated) {
      setError("Não foi possível ler essa chave. Verifique se ela está correta.")
      resetResult()
      return
    }

    setError(null)
    if (cleaned === secret) return

    setSecret(cleaned)
    setCode(generated)
    setRemainingMs(PERIOD_MS - (Date.now() % PERIOD_MS))
    setGiftKey((key) => key + 1)
    void copyCode(generated)
  }

  const handleClear = () => {
    setInput("")
    setError(null)
    resetResult()
  }

  const cleanedLength = cleanSecret(input).length
  const isIncomplete = !error && !code && cleanedLength > 0 && cleanedLength < MIN_SECRET_LENGTH
  const seconds = Math.ceil(remainingMs / 1000)
  const isEnding = seconds <= 5

  return (
    <section
      aria-labelledby="generator-title"
      className="xmas-card snow-cap w-full rounded-3xl border border-border bg-card/85 p-5 pt-8 backdrop-blur-md sm:p-7 sm:pt-9"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gold/40 bg-primary/15 text-gold">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="generator-title" className="text-lg font-semibold text-foreground">
            Gerador de Código 2FA
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Cole sua chave e o código é gerado na hora.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <label htmlFor="secret" className="text-sm font-medium text-foreground">
          Chave secreta
        </label>
        <div className="relative">
          <Input
            id="secret"
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Cole aqui sua chave TOTP..."
            autoComplete="off"
            autoCapitalize="characters"
            autoFocus
            spellCheck={false}
            aria-invalid={Boolean(error)}
            aria-describedby="secret-hint"
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
        <p
          id="secret-hint"
          role={error ? "alert" : undefined}
          className={`min-h-5 text-sm leading-relaxed ${error ? "text-destructive" : "text-muted-foreground"}`}
        >
          {error ??
            (isIncomplete
              ? `A chave parece incompleta (mínimo de ${MIN_SECRET_LENGTH} caracteres).`
              : "")}
        </p>
      </div>

      <div
        ref={codeRef}
        className="relative mt-2 rounded-2xl border border-border bg-background/60 p-4 sm:p-5"
      >
        {giftKey > 0 && (
          <span
            key={giftKey}
            aria-hidden="true"
            className="gift-pop pointer-events-none absolute -top-6 right-5 text-4xl"
          >
            🎁
          </span>
        )}

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div
            aria-live="polite"
            aria-label={code ? `Código atual: ${code}` : "Nenhum código gerado"}
            className="flex items-center gap-1 sm:gap-1.5"
          >
            {(code || "      ").split("").map((digit, i) => (
              <span
                key={code ? `${code}-${i}` : `empty-${i}`}
                className={`flex h-14 w-10 items-center justify-center rounded-xl border text-3xl font-bold tabular-nums sm:h-16 sm:w-12 sm:text-4xl ${
                  code
                    ? "digit-in border-border bg-secondary text-foreground"
                    : "border-dashed border-border text-muted-foreground/40"
                } ${i === 3 ? "ml-2 sm:ml-3" : ""}`}
                style={code ? { animationDelay: `${i * 40}ms` } : undefined}
              >
                {code ? digit : "•"}
              </span>
            ))}
          </div>
          {code && (
            <CountdownRing seconds={seconds} fraction={remainingMs / PERIOD_MS} ending={isEnding} />
          )}
        </div>

        {!code && (
          <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
            Seu código de 6 números aparecerá aqui.
          </p>
        )}

        {code && copyStatus === "copied" && (
          <p
            role="status"
            className="mt-4 flex items-center justify-center gap-2 text-center font-semibold text-gold"
          >
            {"✅ Código gerado e copiado!"}
          </p>
        )}

        {code && copyStatus === "blocked" && (
          <p role="status" className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
            Seu navegador bloqueou a cópia automática. Toque no botão abaixo.
          </p>
        )}

        {code && (
          <Button
            type="button"
            variant={copyStatus === "blocked" ? "default" : "outline"}
            onClick={() => copyCode(code)}
            className={`mt-4 h-12 w-full rounded-2xl text-base font-semibold transition-all active:scale-[0.98] ${
              copyStatus === "blocked"
                ? "xmas-btn bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-gold/50 bg-transparent text-gold hover:bg-gold/10 hover:text-gold"
            }`}
          >
            {copyStatus === "blocked" ? (
              <>
                <Copy className="h-5 w-5" aria-hidden="true" />
                Copiar código
              </>
            ) : copyStatus === "copied" ? (
              <>
                <Check className="h-5 w-5" aria-hidden="true" />
                Copiar novamente
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" aria-hidden="true" />
                Copiar código
              </>
            )}
          </Button>
        )}
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
