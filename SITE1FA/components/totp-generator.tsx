"use client"

import { useState, useEffect, useCallback } from "react"
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
  Lock,
  HelpCircle,
  Code2
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

type TabType = "2fa" | "separador" | "baixarvideos"

interface RecentCode {
  code: string
  timestamp: Date
}

interface RecentIP {
  ip: string
  timestamp: Date
}

export function TOTPGenerator() {
  const [activeTab, setActiveTab] = useState<TabType>("2fa")
  const [secret, setSecret] = useState("")
  const [recentCodes, setRecentCodes] = useState<RecentCode[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showHelpDialog, setShowHelpDialog] = useState(false)

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

      confettiFunc({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
        colors: ["#dc2626", "#ef4444", "#b91c1c", "#f87171", "#991b1b", "#fca5a5"],
        startVelocity: 30,
        gravity: 0.8,
        scalar: 1.1,
        ticks: 100,
      })
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
      setSecret("")
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
    { id: "separador" as TabType, label: "Separador", icon: Code2 },
    { id: "baixarvideos" as TabType, label: "Baixar Videos", icon: Download },
  ]

  return (
    <div className="min-h-screen bg-background grid-background">
      <div className="flex flex-col items-center px-4 py-16">
        {/* Header Icon */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
          <Lock className="h-8 w-8 text-primary" />
        </div>

        {/* Title */}
        <h1 className="mb-10 text-2xl font-bold tracking-wide text-foreground">
          2FA - BERNADU FERRAMENTAS
        </h1>

        {/* Tab Navigation */}
        <div className="mb-8 flex items-center gap-1 rounded-full bg-card/60 p-1.5 ring-1 ring-border/50 backdrop-blur-md">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
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
        <div className="mb-12 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/40 px-5 py-2 text-sm text-muted-foreground backdrop-blur-md">
          <Shield className="h-4 w-4 text-primary" />
          Gere codigos de autenticacao 2FA
        </div>

        {/* Main Content */}
        {activeTab === "2fa" && (
          <TwoFATab
            secret={secret}
            setSecret={setSecret}
            recentCodes={recentCodes}
            generateNewCode={generateNewCode}
            copyCode={copyCode}
            deleteCode={deleteCode}
            copiedCode={copiedCode}
            formatDate={formatDate}
            setShowHelpDialog={setShowHelpDialog}
          />
        )}

        {activeTab === "separador" && (
          <SeparadorTab triggerConfetti={triggerConfetti} />
        )}

        {activeTab === "baixarvideos" && (
          <BaixarVideosTab />
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

// 2FA Tab Component
interface TwoFATabProps {
  secret: string
  setSecret: (value: string) => void
  recentCodes: RecentCode[]
  generateNewCode: () => void
  copyCode: (code: string) => Promise<void>
  deleteCode: (index: number) => void
  copiedCode: string | null
  formatDate: (date: Date) => string
  setShowHelpDialog: (value: boolean) => void
}

function TwoFATab({ 
  secret, 
  setSecret, 
  recentCodes, 
  generateNewCode, 
  copyCode, 
  deleteCode,
  copiedCode,
  formatDate,
  setShowHelpDialog
}: TwoFATabProps) {
  return (
    <div className="w-full max-w-lg">
      {/* Secret Key Input Card */}
      <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-md">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
            <KeyIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Chave Secreta</h3>
            <p className="text-sm text-muted-foreground">
              Insira a chave que foi enviada no chat da compra.
            </p>
          </div>
        </div>
        
        <Input
          placeholder="Cole a chave secreta TOTP aqui..."
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateNewCode()}
          className="mb-4 h-12 rounded-xl border-border/50 bg-input/50 font-mono text-sm tracking-wider placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />

        <Button
          onClick={() => setShowHelpDialog(true)}
          variant="outline"
          className="w-full h-11 rounded-xl border-primary/50 text-primary hover:bg-primary/10 hover:text-primary transition-all duration-300"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          Codigo Invalido?
        </Button>
      </div>

      {/* Recent Codes */}
      {recentCodes.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Codigos Recentes
            </h3>
          </div>

          <div className="divide-y divide-border/50">
            {recentCodes.map((item, index) => (
              <div
                key={index}
                className="group flex items-center justify-between px-6 py-4 transition-colors hover:bg-secondary/20"
              >
                <div>
                  <p className="font-mono text-sm font-medium text-foreground">
                    {item.code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.timestamp)}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive active:scale-95"
                    onClick={() => deleteCode(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
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
        </div>
      )}
    </div>
  )
}

// Separador Tab Component (Meu IP com IPs Recentes)
function SeparadorTab({ triggerConfetti }: { triggerConfetti: () => void }) {
  const [ip, setIp] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [recentIPs, setRecentIPs] = useState<RecentIP[]>([])
  const [copiedIP, setCopiedIP] = useState<string | null>(null)

  useEffect(() => {
    fetchIP()
  }, [])

  const fetchIP = () => {
    setLoading(true)
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => {
        setIp(data.ip)
        setLoading(false)
        
        // Add to recent IPs if not already there
        setRecentIPs(prev => {
          const exists = prev.some(item => item.ip === data.ip)
          if (!exists) {
            return [{ ip: data.ip, timestamp: new Date() }, ...prev.slice(0, 9)]
          }
          return prev
        })
      })
      .catch(() => {
        setIp("Erro ao obter IP")
        setLoading(false)
      })
  }

  const copyIP = async (ipToCopy?: string) => {
    const targetIP = ipToCopy || ip
    if (!targetIP || targetIP === "Erro ao obter IP") return
    await navigator.clipboard.writeText(targetIP)
    if (ipToCopy) {
      setCopiedIP(ipToCopy)
      setTimeout(() => setCopiedIP(null), 2000)
    } else {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    triggerConfetti()
    toast.success("IP copiado!")
  }

  const deleteIP = (index: number) => {
    setRecentIPs(prev => prev.filter((_, i) => i !== index))
    toast.success("IP removido!")
  }

  const formatDate = (date: Date) => {
    return `${date.toLocaleDateString('pt-BR')} as ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <div className="w-full max-w-lg">
      {/* Current IP Card */}
      <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-md">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Meu IP</h3>
            <p className="text-sm text-muted-foreground">
              Seu endereco IP publico atual.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-input/50 p-4">
          <p className="font-mono text-xl font-bold text-foreground">
            {loading ? "Carregando..." : ip}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 rounded-xl text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-95 ${
              copied ? "copy-animation" : ""
            }`}
            onClick={() => copyIP()}
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

      {/* Recent IPs */}
      {recentIPs.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              IPs Recentes
            </h3>
          </div>

          <div className="divide-y divide-border/50">
            {recentIPs.map((item, index) => (
              <div
                key={index}
                className="group flex items-center justify-between px-6 py-4 transition-colors hover:bg-secondary/20"
              >
                <div>
                  <p className="font-mono text-sm font-medium text-foreground">
                    {item.ip}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.timestamp)}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive active:scale-95"
                    onClick={() => deleteIP(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`relative h-8 w-8 text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-95 ${
                      copiedIP === item.ip ? "copy-animation" : ""
                    }`}
                    onClick={() => copyIP(item.ip)}
                  >
                    {copiedIP === item.ip ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copiedIP === item.ip && (
                      <span className="ripple-effect absolute inset-0 rounded-lg" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Baixar Videos Tab Component
function BaixarVideosTab() {
  const [url, setUrl] = useState("")

  return (
    <div className="w-full max-w-lg">
      {/* Download Card */}
      <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-md">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Baixar Videos</h3>
            <p className="text-sm text-muted-foreground">
              Cole o link do video para baixar.
            </p>
          </div>
        </div>

        <Input
          placeholder="Cole o link do video aqui..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mb-4 h-12 rounded-xl border-border/50 bg-input/50 font-mono text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />

        <Button
          onClick={() => {
            if (url) {
              window.open(`https://www.y2mate.com/youtube/${encodeURIComponent(url)}`, '_blank')
            }
          }}
          disabled={!url}
          className="w-full h-11 rounded-xl bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
        >
          <Download className="mr-2 h-4 w-4" />
          Baixar Video
        </Button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Suporta YouTube, Instagram, TikTok e mais
        </p>
      </div>
    </div>
  )
}
