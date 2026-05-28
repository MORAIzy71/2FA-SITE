"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { TOTP } from "otpauth"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { InvalidCodeDialog } from "@/components/invalid-code-dialog"
import { Copy, Check, HelpCircle, Shield, SplitSquareHorizontal, Mail, Lock, Key, Sparkles, ExternalLink } from "lucide-react"

function generateCode(secret: string): string {
  try {
    const cleanSecret = secret.replace(/\s+/g, "").toUpperCase()
    if (cleanSecret.length < 16) return ""
    const totp = new TOTP({
      secret: cleanSecret,
      digits: 6,
      period: 30,
    })
    return totp.generate()
  } catch {
    return ""
  }
}

function getTimeRemaining(): number {
  return 30 - (Math.floor(Date.now() / 1000) % 30)
}

type SeparatorMode = "rockstar" | "discord"

interface ParsedAccount {
  email: string
  senha: string
  secret: string
}

export function TOTPGenerator() {
  const [secret, setSecret] = useState("")
  const [code, setCode] = useState("")
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining())
  const [copied, setCopied] = useState(false)
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const copyButtonRef = useRef<HTMLButtonElement>(null)

  // Separador
  const [separatorMode, setSeparatorMode] = useState<SeparatorMode>("rockstar")
  const [accountInput, setAccountInput] = useState("")
  const [parsedAccount, setParsedAccount] = useState<ParsedAccount | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const updateCode = useCallback(() => {
    if (secret.trim()) {
      setCode(generateCode(secret.trim()))
    }
  }, [secret])

  useEffect(() => {
    updateCode()
  }, [updateCode])

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining()
      setTimeRemaining(remaining)
      if (remaining === 30) {
        updateCode()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [updateCode])

  const triggerConfetti = () => {
    const runConfetti = () => {
      const confettiFunc = (window as unknown as { confetti: (opts: {
        particleCount: number
        spread: number
        origin: { x: number; y: number }
        colors: string[]
        startVelocity?: number
        gravity?: number
        scalar?: number
        ticks?: number
        angle?: number
      }) => void }).confetti

      // Explosão do lado esquerdo
      confettiFunc({
        particleCount: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#06b6d4", "#8b5cf6", "#3b82f6", "#22d3ee", "#a78bfa"],
        startVelocity: 45,
        gravity: 0.8,
        scalar: 1.2,
        ticks: 150,
        angle: 60,
      })

      // Explosão do lado direito
      confettiFunc({
        particleCount: 60,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#06b6d4", "#8b5cf6", "#3b82f6", "#22d3ee", "#a78bfa"],
        startVelocity: 45,
        gravity: 0.8,
        scalar: 1.2,
        ticks: 150,
        angle: 120,
      })

      // Explosão do centro-topo
      setTimeout(() => {
        confettiFunc({
          particleCount: 80,
          spread: 100,
          origin: { x: 0.5, y: 0.3 },
          colors: ["#06b6d4", "#8b5cf6", "#3b82f6", "#f59e0b", "#10b981"],
          startVelocity: 35,
          gravity: 1,
          scalar: 1,
          ticks: 120,
        })
      }, 100)

      // Segunda onda de confetes
      setTimeout(() => {
        confettiFunc({
          particleCount: 40,
          spread: 120,
          origin: { x: 0.2, y: 0.5 },
          colors: ["#06b6d4", "#a78bfa", "#22d3ee"],
          startVelocity: 30,
          gravity: 0.9,
          scalar: 0.9,
          ticks: 100,
          angle: 70,
        })
        confettiFunc({
          particleCount: 40,
          spread: 120,
          origin: { x: 0.8, y: 0.5 },
          colors: ["#06b6d4", "#a78bfa", "#22d3ee"],
          startVelocity: 30,
          gravity: 0.9,
          scalar: 0.9,
          ticks: 100,
          angle: 110,
        })
      }, 200)
    }
    
    if (!document.querySelector('script[src*="canvas-confetti"]')) {
      const confettiScript = document.createElement("script")
      confettiScript.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"
      confettiScript.onload = runConfetti
      document.body.appendChild(confettiScript)
    } else {
      runConfetti()
    }
  }

  const copyCode = async () => {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    triggerConfetti()
    toast.success("Código copiado!", {
      description: "O código TOTP foi copiado para a área de transferência.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const copyField = async (field: string, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedField(field)
    triggerConfetti()
    
    const fieldLabels: Record<string, string> = {
      email: "Email",
      senha: "Senha",
      secret: separatorMode === "rockstar" ? "2FA" : "Token",
    }
    
    toast.success(`${fieldLabels[field]} copiado!`, {
      description: `O ${fieldLabels[field].toLowerCase()} foi copiado para a área de transferência.`,
    })
    
    setTimeout(() => setCopiedField(null), 2000)
  }

  const parseAccount = () => {
    const parts = accountInput.trim().split(":")
    if (parts.length >= 3) {
      setParsedAccount({
        email: parts[0] || "",
        senha: parts[1] || "",
        secret: parts.slice(2).join(":") || "",
      })
    }
  }

  const getEmailLink = (email: string): { url: string; name: string } | null => {
    if (separatorMode !== "discord") return null
    
    const emailLower = email.toLowerCase()
    
    if (emailLower.includes("@gmx")) {
      return { url: "https://www.gmx.com/", name: "GMX Mail" }
    }
    if (emailLower.includes("@rambler.ru")) {
      return { url: "https://swiftmail.cc/", name: "Swift Mail" }
    }
    // Domínios temporários/descartáveis
    if (emailLower.includes("@chordavef.com") || 
        emailLower.includes("@firstmail") ||
        emailLower.includes("@mailto.plus") ||
        emailLower.includes("@fexpost.com") ||
        emailLower.includes("@dpptd.com") ||
        emailLower.includes("@rfcdrive.com") ||
        emailLower.includes("@kfrih.com") ||
        emailLower.includes("@qacmjeq.com")) {
      return { url: "https://firstmail.ltd/webmail/login/", name: "FirstMail" }
    }
    
    return null
  }

  const progressPercentage = (timeRemaining / 30) * 100

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-12">
      {/* Animated Background Gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Ferramentas Seguras
        </div>
        <h1 className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-4xl font-bold tracking-tight text-transparent">
          2FA - BERNADU FERRAMENTAS
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Gere códigos 2FA ou separe suas contas facilmente. Para o separador, cole sua conta no formato correto 
          (ex: email@exemplo.com:senha123:chave2fa) e clique em separar.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="relative z-10 grid w-full max-w-5xl gap-6 md:grid-cols-2">
        {/* Card 1: Gerador 2FA */}
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
          {/* Glow effect on hover */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="relative mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 transition-transform duration-300 group-hover:scale-110">
              <Shield className="h-8 w-8 text-primary transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Gerador 2FA</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Cole sua chave secreta para gerar o código
            </p>
          </div>

          <div className="mb-5">
            <Input
              placeholder="Cole a chave secreta TOTP aqui..."
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="h-12 rounded-xl border-border bg-background/80 text-center font-mono text-sm tracking-wider transition-all duration-300 placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {code && (
            <div className="mb-5 overflow-hidden rounded-xl border border-border bg-background/80 p-5 transition-all duration-300 hover:border-primary/30">
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                    Expira em
                  </span>
                  <span className="font-mono font-medium text-foreground">{timeRemaining}s</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono text-4xl font-bold tracking-[0.3em] text-foreground">
                  {code.slice(0, 3)}<span className="mx-1 text-primary">.</span>{code.slice(3)}
                </span>
                <Button
                  ref={copyButtonRef}
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-xl text-muted-foreground transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:text-primary active:scale-95"
                  onClick={copyCode}
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {!code && secret.trim().length > 0 && (
            <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center transition-all duration-300">
              <p className="text-sm text-destructive">
                Chave inválida. Verifique se está correta.
              </p>
            </div>
          )}

          <button
            onClick={() => setShowHelpDialog(true)}
            className="group/btn mx-auto flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-2.5 text-sm font-medium text-primary transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:shadow-md hover:shadow-primary/10 active:scale-95"
          >
            <HelpCircle className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-12" />
            Código Inválido?
          </button>
        </div>

        {/* Card 2: Separador de Conta */}
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm transition-all duration-500 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5">
          {/* Glow effect on hover */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
          </div>

          <div className="relative mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 ring-1 ring-blue-500/20 transition-transform duration-300 group-hover:scale-110">
              <SplitSquareHorizontal className="h-8 w-8 text-blue-500 transition-transform duration-300 group-hover:-rotate-12" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Separador de Conta</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Selecione o tipo e cole a conta para separar
            </p>
          </div>

          {/* Mode Selector */}
          <div className="mb-5 flex rounded-xl bg-background/80 p-1.5 ring-1 ring-border">
            <button
              onClick={() => setSeparatorMode("rockstar")}
              className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all duration-300 ${
                separatorMode === "rockstar"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              Rockstar
            </button>
            <button
              onClick={() => setSeparatorMode("discord")}
              className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all duration-300 ${
                separatorMode === "discord"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              Conta Discord
            </button>
          </div>

          {/* Tutorial */}
          <div className="mb-5 rounded-xl border border-border bg-muted/30 p-4 transition-all duration-300 hover:bg-muted/50">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Como usar:</span>{" "}
              {separatorMode === "rockstar" 
                ? "Cole no formato email:senha:2fa e clique em separar."
                : "Cole no formato email:senha:token e clique em separar."}
            </p>
          </div>

          {/* Input */}
          <div className="mb-5">
            <Textarea
              placeholder={
                separatorMode === "rockstar"
                  ? "email@exemplo.com:senha123:CHAVE2FA"
                  : "email@exemplo.com:senha123:TOKEN123"
              }
              value={accountInput}
              onChange={(e) => setAccountInput(e.target.value)}
              className="min-h-[90px] resize-none rounded-xl border-border bg-background/80 font-mono text-sm transition-all duration-300 placeholder:text-muted-foreground focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <Button
            onClick={parseAccount}
            disabled={!accountInput.trim()}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 font-medium text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-50"
          >
            Separar Conta
          </Button>

          {/* Parsed Result */}
          {parsedAccount && (
            <div className="mt-5 space-y-3 rounded-xl border border-border bg-background/80 p-4">
              {/* Email */}
              <div className="flex items-center justify-between rounded-xl bg-card/80 p-3.5 ring-1 ring-border transition-all duration-300 hover:ring-blue-500/30">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 ring-1 ring-blue-500/20">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">EMAIL</p>
                    <p className="font-mono text-sm text-foreground truncate">{parsedAccount.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl transition-all duration-300 hover:scale-110 hover:bg-blue-500/10 hover:text-blue-500 active:scale-95"
                  onClick={() => copyField("email", parsedAccount.email)}
                >
                  {copiedField === "email" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {/* Senha */}
              <div className="flex items-center justify-between rounded-xl bg-card/80 p-3.5 ring-1 ring-border transition-all duration-300 hover:ring-red-500/30">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 ring-1 ring-red-500/20">
                    <Lock className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">SENHA</p>
                    <p className="font-mono text-sm text-foreground truncate">{parsedAccount.senha}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl transition-all duration-300 hover:scale-110 hover:bg-red-500/10 hover:text-red-500 active:scale-95"
                  onClick={() => copyField("senha", parsedAccount.senha)}
                >
                  {copiedField === "senha" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {/* 2FA/Token */}
              <div className="flex items-center justify-between rounded-xl bg-card/80 p-3.5 ring-1 ring-border transition-all duration-300 hover:ring-primary/30">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {separatorMode === "rockstar" ? "2FA" : "TOKEN"}
                    </p>
                    <p className="font-mono text-sm text-foreground truncate">{parsedAccount.secret}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:text-primary active:scale-95"
                  onClick={() => copyField("secret", parsedAccount.secret)}
                >
                  {copiedField === "secret" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {/* Link para Webmail */}
              {getEmailLink(parsedAccount.email) && (
                <a
                  href={getEmailLink(parsedAccount.email)?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3.5 ring-1 ring-green-500/30 text-green-400 font-medium text-sm transition-all duration-300 hover:from-green-500/30 hover:to-emerald-500/30 hover:ring-green-500/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Acessar {getEmailLink(parsedAccount.email)?.name}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-10 text-center">
        <p className="text-xs text-muted-foreground">
          Feito com segurança em mente
        </p>
      </div>

      {/* Help Dialog */}
      <InvalidCodeDialog
        open={showHelpDialog}
        onOpenChange={setShowHelpDialog}
      />
    </div>
  )
}
