"use client"

import { useState, useEffect } from "react"
import { TOTP } from "otpauth"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { InvalidCodeDialog } from "@/components/invalid-code-dialog"
import { 
  Copy, 
  Check, 
  Shield, 
  Download, 
  Key as KeyIcon,
  Trash2,
  Lock,
  HelpCircle,
  SplitSquareVertical,
  Users
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
  secret: string
  code: string
  timestamp: Date
}

interface SeparatedAccount {
  type: "rockstar" | "discord"
  original: string
  email: string
  password: string
  extra: string // Token para Discord, 2FA para Rockstar
  timestamp: Date
}

export function TOTPGenerator() {
  const [activeTab, setActiveTab] = useState<TabType>("2fa")
  const [secret, setSecret] = useState("")
  const [recentCodes, setRecentCodes] = useState<RecentCode[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [separatedAccounts, setSeparatedAccounts] = useState<SeparatedAccount[]>([])

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
    
    const cleanSecret = secret.trim().toUpperCase().replace(/\s+/g, "")
    const code = generateCode(cleanSecret)
    if (code) {
      const newCode: RecentCode = {
        secret: cleanSecret,
        code: code,
        timestamp: new Date()
      }
      setRecentCodes(prev => [newCode, ...prev.slice(0, 9)])
      setSecret("")
      toast.success("Codigo 2FA gerado!", {
        description: `Codigo: ${code}`,
      })
    } else {
      setShowHelpDialog(true)
    }
  }

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    triggerConfetti()
    toast.success("Copiado!", {
      description: "Copiado para a area de transferencia.",
    })
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const deleteCode = (index: number) => {
    setRecentCodes(prev => prev.filter((_, i) => i !== index))
    toast.success("Codigo removido!")
  }

  const deleteSeparatedAccount = (index: number) => {
    setSeparatedAccounts(prev => prev.filter((_, i) => i !== index))
    toast.success("Conta removida!")
  }

  const formatDate = (date: Date) => {
    return `${date.toLocaleDateString('pt-BR')} as ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }

  const getSubtitle = () => {
    switch(activeTab) {
      case "2fa":
        return "Gere codigos de autenticacao 2FA"
      case "separador":
        return "Separe contas Rockstar e Discord"
      case "baixarvideos":
        return "Baixe videos do TikTok e YouTube"
    }
  }

  const tabs = [
    { id: "2fa" as TabType, label: "2FA", icon: Shield },
    { id: "separador" as TabType, label: "Separador", icon: SplitSquareVertical },
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
          {getSubtitle()}
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
          <SeparadorTab 
            triggerConfetti={triggerConfetti} 
            copyCode={copyCode}
            copiedCode={copiedCode}
            separatedAccounts={separatedAccounts}
            setSeparatedAccounts={setSeparatedAccounts}
            deleteSeparatedAccount={deleteSeparatedAccount}
            formatDate={formatDate}
          />
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
  const [liveCode, setLiveCode] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState<number>(30)

  // Atualiza o codigo TOTP a cada segundo
  useEffect(() => {
    if (recentCodes.length === 0) return

    const updateCode = () => {
      const latestSecret = recentCodes[0].secret
      const newCode = generateCode(latestSecret)
      setLiveCode(newCode)
      
      // Calcula tempo restante (TOTP usa periodos de 30 segundos)
      const now = Math.floor(Date.now() / 1000)
      const remaining = 30 - (now % 30)
      setTimeLeft(remaining)
    }

    updateCode()
    const interval = setInterval(updateCode, 1000)
    return () => clearInterval(interval)
  }, [recentCodes])

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

        <div className="flex gap-2">
          <Button
            onClick={generateNewCode}
            disabled={!secret.trim()}
            className="flex-1 h-11 rounded-xl bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
          >
            Gerar Codigo
          </Button>
          <Button
            onClick={() => setShowHelpDialog(true)}
            variant="outline"
            className="h-11 rounded-xl border-primary/50 text-primary hover:bg-primary/10 hover:text-primary transition-all duration-300"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Live Code Display */}
      {recentCodes.length > 0 && liveCode && (
        <div className="mt-6 rounded-2xl border border-primary/30 bg-card/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Codigo Atual</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
              <span className={`text-sm font-mono ${timeLeft <= 5 ? 'text-red-400' : 'text-muted-foreground'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-input/30 rounded-xl px-6 py-4">
            <span className="font-mono text-3xl font-bold tracking-[0.3em] text-foreground">
              {liveCode}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-95 ${
                copiedCode === liveCode ? "copy-animation" : ""
              }`}
              onClick={() => copyCode(liveCode)}
            >
              {copiedCode === liveCode ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-primary'}`}
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent Codes */}
      {recentCodes.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Chaves Salvas
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
                    {item.secret.slice(0, 8)}...{item.secret.slice(-4)}
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
                      copiedCode === item.secret ? "copy-animation" : ""
                    }`}
                    onClick={() => copyCode(item.secret)}
                  >
                    {copiedCode === item.secret ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copiedCode === item.secret && (
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

// Separador Tab Component - Para separar contas Rockstar e Discord
interface SeparadorTabProps {
  triggerConfetti: () => void
  copyCode: (code: string) => Promise<void>
  copiedCode: string | null
  separatedAccounts: SeparatedAccount[]
  setSeparatedAccounts: React.Dispatch<React.SetStateAction<SeparatedAccount[]>>
  deleteSeparatedAccount: (index: number) => void
  formatDate: (date: Date) => string
}

function SeparadorTab({ 
  triggerConfetti, 
  copyCode,
  copiedCode,
  separatedAccounts,
  setSeparatedAccounts,
  deleteSeparatedAccount,
  formatDate
}: SeparadorTabProps) {
  const [accountType, setAccountType] = useState<"rockstar" | "discord">("rockstar")
  const [inputText, setInputText] = useState("")

  const separateAccount = () => {
    if (!inputText.trim()) {
      toast.error("Cole o texto da conta!")
      return
    }

    const text = inputText.trim()
    
    // Discord: EMAIL:SENHA:TOKEN
    // Rockstar: EMAIL:SENHA:2FA
    const parts = text.split(":").filter(p => p.trim())
    
    if (parts.length < 3) {
      toast.error(accountType === "discord" 
        ? "Formato incorreto. Use: EMAIL:SENHA:TOKEN" 
        : "Formato incorreto. Use: EMAIL:SENHA:2FA")
      return
    }

    const email = parts[0].trim()
    const password = parts[1].trim()
    const extra = parts.slice(2).join(":").trim() // Pega tudo depois da senha (token pode ter :)

    if (!email || !password || !extra) {
      toast.error("Todos os campos sao obrigatorios!")
      return
    }

    const newAccount: SeparatedAccount = {
      type: accountType,
      original: text,
      email,
      password,
      extra,
      timestamp: new Date()
    }

    setSeparatedAccounts(prev => [newAccount, ...prev.slice(0, 19)])
    setInputText("")
    triggerConfetti()
    toast.success("Conta separada com sucesso!")
  }

  return (
    <div className="w-full max-w-lg">
      {/* Separador Card */}
      <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-md">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Separador de Contas</h3>
            <p className="text-sm text-muted-foreground">
              {accountType === "discord" 
                ? "Formato: EMAIL:SENHA:TOKEN" 
                : "Formato: EMAIL:SENHA:2FA"}
            </p>
          </div>
        </div>

        {/* Account Type Toggle */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setAccountType("rockstar")}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
              accountType === "rockstar"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            Rockstar
          </button>
          <button
            onClick={() => setAccountType("discord")}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
              accountType === "discord"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            Discord
          </button>
        </div>

        <Textarea
          placeholder={accountType === "discord" 
            ? "Cole aqui: EMAIL:SENHA:TOKEN" 
            : "Cole aqui: EMAIL:SENHA:2FA"}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="mb-4 min-h-[100px] rounded-xl border-border/50 bg-input/50 font-mono text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none"
        />

        <Button
          onClick={separateAccount}
          disabled={!inputText.trim()}
          className="w-full h-11 rounded-xl bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
        >
          <SplitSquareVertical className="mr-2 h-4 w-4" />
          Separar Conta
        </Button>
      </div>

      {/* Separated Accounts List */}
      {separatedAccounts.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Contas Separadas
            </h3>
            <span className="text-xs text-muted-foreground">
              {separatedAccounts.length} conta(s)
            </span>
          </div>

          <div className="divide-y divide-border/50">
            {separatedAccounts.map((account, index) => (
              <div
                key={index}
                className="group px-6 py-4 transition-colors hover:bg-secondary/20"
              >
                {/* Header with type and delete */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    account.type === "discord" 
                      ? "bg-indigo-500/20 text-indigo-400" 
                      : "bg-orange-500/20 text-orange-400"
                  }`}>
                    {account.type === "discord" ? "Discord" : "Rockstar"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(account.timestamp)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive active:scale-95"
                      onClick={() => deleteSeparatedAccount(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-2">
                  {/* Email */}
                  <div className="flex items-center justify-between bg-input/30 rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-muted-foreground block">Email</span>
                      <p className="font-mono text-sm text-foreground truncate">{account.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 shrink-0 ml-2 text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-95 ${
                        copiedCode === account.email ? "copy-animation" : ""
                      }`}
                      onClick={() => copyCode(account.email)}
                    >
                      {copiedCode === account.email ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>

                  {/* Password */}
                  <div className="flex items-center justify-between bg-input/30 rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-muted-foreground block">Senha</span>
                      <p className="font-mono text-sm text-foreground truncate">{account.password}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 shrink-0 ml-2 text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-95 ${
                        copiedCode === account.password ? "copy-animation" : ""
                      }`}
                      onClick={() => copyCode(account.password)}
                    >
                      {copiedCode === account.password ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>

                  {/* Extra (Token/2FA) */}
                  <div className="flex items-center justify-between bg-input/30 rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-muted-foreground block">
                        {account.type === "discord" ? "Token" : "2FA"}
                      </span>
                      <p className="font-mono text-sm text-foreground truncate">{account.extra}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 shrink-0 ml-2 text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-95 ${
                        copiedCode === account.extra ? "copy-animation" : ""
                      }`}
                      onClick={() => copyCode(account.extra)}
                    >
                      {copiedCode === account.extra ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
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
  const [platform, setPlatform] = useState<"youtube" | "tiktok" | "instagram" | "twitter">("youtube")
  const [isLoading, setIsLoading] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState<string>("")
  const [downloadHistory, setDownloadHistory] = useState<Array<{url: string, platform: string, timestamp: Date}>>([])

  // Detecta automaticamente a plataforma pelo link
  const detectPlatform = (inputUrl: string) => {
    const lowerUrl = inputUrl.toLowerCase()
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
      setPlatform("youtube")
    } else if (lowerUrl.includes("tiktok.com") || lowerUrl.includes("vm.tiktok")) {
      setPlatform("tiktok")
    } else if (lowerUrl.includes("instagram.com")) {
      setPlatform("instagram")
    } else if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) {
      setPlatform("twitter")
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    if (newUrl.length > 10) {
      detectPlatform(newUrl)
    }
  }

  const downloadVideo = async () => {
    if (!url.trim()) {
      toast.error("Cole o link do video!")
      return
    }

    setIsLoading(true)
    setDownloadStatus("Obtendo link de download...")

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (data.error || data.fallback) {
        // Fallback: abre o Cobalt diretamente
        setDownloadStatus("Abrindo downloader externo...")
        const cobaltUrl = `https://cobalt.tools/?url=${encodeURIComponent(url.trim())}`
        window.open(cobaltUrl, '_blank')
        toast.info("Abrindo Cobalt...", {
          description: "O download iniciara no site"
        })
      } else if (data.status === "redirect" || data.status === "stream") {
        // Download direto
        setDownloadStatus("Iniciando download...")
        
        // Cria um link temporario para forcar o download
        const link = document.createElement('a')
        link.href = data.url
        link.download = data.filename || 'video.mp4'
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Adiciona ao historico
        setDownloadHistory(prev => [{
          url: url.trim(),
          platform,
          timestamp: new Date()
        }, ...prev.slice(0, 9)])
        
        toast.success("Download iniciado!", {
          description: "O video sera salvo automaticamente"
        })
      } else if (data.status === "picker" && data.options) {
        // Multiplas opcoes - pega a primeira (melhor qualidade)
        const bestOption = data.options[0]
        if (bestOption?.url) {
          const link = document.createElement('a')
          link.href = bestOption.url
          link.download = 'video.mp4'
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          toast.success("Download iniciado!")
        }
      }
    } catch (error) {
      console.error("Download error:", error)
      // Fallback em caso de erro
      const cobaltUrl = `https://cobalt.tools/?url=${encodeURIComponent(url.trim())}`
      window.open(cobaltUrl, '_blank')
      toast.info("Abrindo downloader externo...")
    } finally {
      setIsLoading(false)
      setDownloadStatus("")
      setUrl("")
    }
  }

  // Auto-download quando detecta um link valido colado
  const handlePaste = async (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text')
    if (pastedText && (
      pastedText.includes("youtube.com") || 
      pastedText.includes("youtu.be") ||
      pastedText.includes("tiktok.com") ||
      pastedText.includes("vm.tiktok") ||
      pastedText.includes("instagram.com") ||
      pastedText.includes("twitter.com") ||
      pastedText.includes("x.com")
    )) {
      // Pequeno delay para o estado atualizar
      setTimeout(() => {
        downloadVideo()
      }, 100)
    }
  }

  const platforms = [
    { id: "youtube" as const, name: "YouTube", icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )},
    { id: "tiktok" as const, name: "TikTok", icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    )},
    { id: "instagram" as const, name: "Instagram", icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )},
    { id: "twitter" as const, name: "X/Twitter", icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )},
  ]

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
              Cole o link e o download inicia automatico
            </p>
          </div>
        </div>

        {/* Platform Toggle */}
        <div className="mb-4 grid grid-cols-4 gap-2">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`rounded-xl px-2 py-2.5 text-xs font-medium transition-all duration-300 flex flex-col items-center justify-center gap-1.5 ${
                platform === p.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary/70"
              }`}
            >
              {p.icon}
              <span>{p.name}</span>
            </button>
          ))}
        </div>

        <div className="relative mb-4">
          <Input
            placeholder="Cole o link aqui (download automatico)..."
            value={url}
            onChange={handleUrlChange}
            onPaste={handlePaste}
            onKeyDown={(e) => e.key === "Enter" && downloadVideo()}
            className="h-12 rounded-xl border-border/50 bg-input/50 font-mono text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            disabled={isLoading}
          />
        </div>

        {/* Status */}
        {downloadStatus && (
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-primary">
            <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            {downloadStatus}
          </div>
        )}

        <Button
          onClick={downloadVideo}
          disabled={!url.trim() || isLoading}
          className="w-full h-11 rounded-xl bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Baixando...
            </span>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Baixar Video
            </>
          )}
        </Button>

        {/* Instructions */}
        <div className="mt-4 p-3 rounded-xl bg-secondary/30 border border-border/30">
          <p className="text-xs text-muted-foreground text-center">
            <span className="font-medium text-foreground">Dica:</span> Copie o link do video e cole acima. 
            O download iniciara automaticamente em todos os dispositivos.
          </p>
        </div>
      </div>

      {/* Download History */}
      {downloadHistory.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Downloads Recentes
            </h3>
          </div>
          <div className="divide-y divide-border/50">
            {downloadHistory.map((item, index) => (
              <div key={index} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    item.platform === "youtube" ? "bg-red-500/20 text-red-400" :
                    item.platform === "tiktok" ? "bg-pink-500/20 text-pink-400" :
                    item.platform === "instagram" ? "bg-purple-500/20 text-purple-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>
                    {item.platform}
                  </span>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {item.url}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
