"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { TOTP } from "otpauth"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InvalidCodeDialog } from "@/components/invalid-code-dialog"
import { 
  Copy, 
  Check, 
  Shield, 
  Globe, 
  Download, 
  Key as KeyIcon,
  Trash2,
  Shuffle
} from "lucide-react"

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

function generateRandomSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  let secret = ""
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

type TabType = "2fa" | "meuip" | "baixarvideos" | "senhas"

interface RecentCode {
  code: string
  timestamp: Date
}

export function TOTPGenerator() {
  const [activeTab, setActiveTab] = useState<TabType>("2fa")
  const [secret, setSecret] = useState("")
  const [recentCodes, setRecentCodes] = useState<RecentCode[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const copyButtonRef = useRef<HTMLButtonElement>(null)

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

      // Explosao vermelho lado esquerdo
      confettiFunc({
        particleCount: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#dc2626", "#ef4444", "#b91c1c", "#f87171", "#991b1b"],
        startVelocity: 45,
        gravity: 0.8,
        scalar: 1.2,
        ticks: 150,
        angle: 60,
      })

      // Explosao vermelho lado direito
      confettiFunc({
        particleCount: 60,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#dc2626", "#ef4444", "#b91c1c", "#f87171", "#991b1b"],
        startVelocity: 45,
        gravity: 0.8,
        scalar: 1.2,
        ticks: 150,
        angle: 120,
      })

      // Explosao do centro
      setTimeout(() => {
        confettiFunc({
          particleCount: 80,
          spread: 100,
          origin: { x: 0.5, y: 0.3 },
          colors: ["#dc2626", "#ef4444", "#fca5a5", "#fee2e2", "#b91c1c"],
          startVelocity: 35,
          gravity: 1,
          scalar: 1,
          ticks: 120,
        })
      }, 100)
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

  const generateNewCode = () => {
    if (!secret.trim()) return
    
    const code = generateCode(secret.trim())
    if (code) {
      const newCode: RecentCode = {
        code: secret.trim().toUpperCase(),
        timestamp: new Date()
      }
      setRecentCodes(prev => [newCode, ...prev.slice(0, 9)])
      toast.success("Codigo gerado!", {
        description: "Chave adicionada aos codigos recentes.",
      })
    } else {
      setShowHelpDialog(true)
    }
  }

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    triggerConfetti()
    toast.success("Codigo copiado!", {
      description: "O codigo foi copiado para a area de transferencia.",
    })
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const deleteCode = (index: number) => {
    setRecentCodes(prev => prev.filter((_, i) => i !== index))
    toast.success("Codigo removido!")
  }

  const formatDate = (date: Date) => {
    return `${date.toLocaleDateString('pt-BR')} as ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }

  const tabs = [
    { id: "2fa" as TabType, label: "2FA", icon: Shield },
    { id: "meuip" as TabType, label: "Meu IP", icon: Globe },
    { id: "baixarvideos" as TabType, label: "Baixar Videos", icon: Download },
    { id: "senhas" as TabType, label: "Senhas", icon: KeyIcon },
  ]

  return (
    <div className="min-h-screen bg-background grid-background">
      <div className="flex flex-col items-center px-4 py-12">
        {/* Header Icon */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
          <KeyIcon className="h-7 w-7 text-primary" />
        </div>

        {/* Title */}
        <h1 className="mb-8 text-2xl font-bold text-foreground">Utilidades</h1>

        {/* Tab Navigation */}
        <div className="mb-6 flex items-center gap-1 rounded-full bg-card/80 p-1.5 ring-1 ring-border backdrop-blur-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Subtitle Badge */}
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
          <Shield className="h-3.5 w-3.5" />
          Gere codigos de autenticacao de dois fatores
        </div>

        {/* Main Content */}
        {activeTab === "2fa" && (
          <div className="w-full max-w-xl">
            {/* 2FA Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>

            {/* Title */}
            <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
              2FA Bernadu
            </h2>
            <p className="mb-8 text-center text-sm text-muted-foreground">
              Gere codigos de autenticacao de dois fatores
            </p>

            {/* Secret Key Input Card */}
            <div className="mb-6 rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <KeyIcon className="h-4 w-4" />
                Chave secreta
              </div>
              
              <div className="flex gap-3">
                <Input
                  placeholder="Cole a chave secreta aqui..."
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="h-12 flex-1 rounded-xl border-border bg-input font-mono text-sm tracking-wider placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  onClick={generateNewCode}
                  className="h-12 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
                >
                  Gerar
                </Button>
              </div>
            </div>

            {/* Recent Codes */}
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Codigos Recentes
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    const newSecret = generateRandomSecret()
                    setSecret(newSecret)
                  }}
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
              </div>

              {recentCodes.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  Nenhum codigo gerado ainda
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentCodes.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-secondary/30"
                    >
                      <div>
                        <p className="font-mono text-sm font-medium text-foreground">
                          {item.code}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive active:scale-95"
                          onClick={() => deleteCode(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          ref={index === 0 ? copyButtonRef : undefined}
                          variant="ghost"
                          size="icon"
                          className={`relative h-8 w-8 text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-95 ${
                            copiedCode === item.code ? "copy-animation" : ""
                          }`}
                          onClick={() => copyCode(item.code)}
                        >
                          {copiedCode === item.code ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          {copiedCode === item.code && (
                            <span className="ripple-effect absolute inset-0 rounded-lg" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "meuip" && (
          <MeuIPTab />
        )}

        {activeTab === "baixarvideos" && (
          <BaixarVideosTab />
        )}

        {activeTab === "senhas" && (
          <SenhasTab triggerConfetti={triggerConfetti} />
        )}
      </div>

      {/* Help Dialog */}
      <InvalidCodeDialog
        open={showHelpDialog}
        onOpenChange={setShowHelpDialog}
      />
    </div>
  )
}

// Meu IP Tab Component
function MeuIPTab() {
  const [ip, setIp] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => {
        setIp(data.ip)
        setLoading(false)
      })
      .catch(() => {
        setIp("Erro ao obter IP")
        setLoading(false)
      })
  }, [])

  const copyIP = async () => {
    if (!ip || ip === "Erro ao obter IP") return
    await navigator.clipboard.writeText(ip)
    setCopied(true)
    toast.success("IP copiado!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-xl">
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Globe className="h-8 w-8 text-primary" />
        </div>
      </div>

      <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
        Meu IP
      </h2>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Veja seu endereco IP publico
      </p>

      <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Seu IP Publico</p>
            <p className="font-mono text-2xl font-bold text-foreground">
              {loading ? "Carregando..." : ip}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-xl text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-95"
            onClick={copyIP}
            disabled={loading}
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Baixar Videos Tab Component
function BaixarVideosTab() {
  const [url, setUrl] = useState("")

  return (
    <div className="w-full max-w-xl">
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Download className="h-8 w-8 text-primary" />
        </div>
      </div>

      <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
        Baixar Videos
      </h2>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Cole o link do video para baixar
      </p>

      <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm">
        <div className="flex gap-3">
          <Input
            placeholder="Cole o link do video aqui..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-12 flex-1 rounded-xl border-border bg-input font-mono text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
          <Button
            onClick={() => {
              if (url) {
                window.open(`https://www.y2mate.com/youtube/${encodeURIComponent(url)}`, '_blank')
              }
            }}
            disabled={!url}
            className="h-12 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50"
          >
            Baixar
          </Button>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Suporta YouTube, Instagram, TikTok e mais
        </p>
      </div>
    </div>
  )
}

// Senhas Tab Component
function SenhasTab({ triggerConfetti }: { triggerConfetti: () => void }) {
  const [password, setPassword] = useState("")
  const [length, setLength] = useState(16)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [copied, setCopied] = useState(false)

  const generatePassword = useCallback(() => {
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (includeNumbers) chars += "0123456789"
    if (includeSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(result)
  }, [length, includeNumbers, includeSymbols])

  useEffect(() => {
    generatePassword()
  }, [generatePassword])

  const copyPassword = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
    triggerConfetti()
    toast.success("Senha copiada!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-xl">
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <KeyIcon className="h-8 w-8 text-primary" />
        </div>
      </div>

      <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
        Gerador de Senhas
      </h2>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Gere senhas seguras e aleatorias
      </p>

      <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm">
        {/* Password Display */}
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-input p-4">
          <p className="flex-1 font-mono text-lg font-medium text-foreground break-all">
            {password}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 shrink-0 rounded-xl text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-95 ${
              copied ? "copy-animation" : ""
            }`}
            onClick={copyPassword}
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Length Slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Tamanho</span>
            <span className="text-sm font-medium text-foreground">{length}</span>
          </div>
          <input
            type="range"
            min="8"
            max="32"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Options */}
        <div className="mb-6 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
            />
            <span className="text-sm text-foreground">Numeros</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
            />
            <span className="text-sm text-foreground">Simbolos</span>
          </label>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generatePassword}
          className="h-12 w-full rounded-xl bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
        >
          <Shuffle className="mr-2 h-4 w-4" />
          Gerar Nova Senha
        </Button>
      </div>
    </div>
  )
}
