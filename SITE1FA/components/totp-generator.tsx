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

    // Tenta extrair email e senha do texto
    // Formatos comuns: "email:senha", "email|senha", "email senha"
    const text = inputText.trim()
    let email = ""
    let password = ""

    // Tenta diferentes separadores
    const separators = [":", "|", " ", "\t", "\n"]
    for (const sep of separators) {
      if (text.includes(sep)) {
        const parts = text.split(sep).filter(p => p.trim())
        if (parts.length >= 2) {
          // Procura por algo que parece email
          const emailPart = parts.find(p => p.includes("@"))
          if (emailPart) {
            email = emailPart.trim()
            password = parts.find(p => p !== emailPart)?.trim() || parts[1].trim()
          } else {
            email = parts[0].trim()
            password = parts[1].trim()
          }
          break
        }
      }
    }

    if (!email || !password) {
      // Se nao conseguiu separar, usa o texto inteiro como "original"
      toast.error("Formato nao reconhecido. Use email:senha ou email|senha")
      return
    }

    const newAccount: SeparatedAccount = {
      type: accountType,
      original: text,
      email,
      password,
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
              Cole a conta para separar email e senha.
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
          placeholder="Cole aqui: email:senha ou email|senha"
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
            <span className="text-xs text-muted-foreground/60">
              {separatedAccounts.length} conta(s)
            </span>
          </div>

          <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
            {separatedAccounts.map((account, index) => (
              <div
                key={index}
                className="group px-6 py-4 transition-colors hover:bg-secondary/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    account.type === "rockstar" 
                      ? "bg-orange-500/20 text-orange-400" 
                      : "bg-indigo-500/20 text-indigo-400"
                  }`}>
                    {account.type === "rockstar" ? "Rockstar" : "Discord"}
                  </span>
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
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
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-input/30 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                      <p className="font-mono text-sm text-foreground">{account.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-95 ${
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
                  
                  <div className="flex items-center justify-between bg-input/30 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Senha</p>
                      <p className="font-mono text-sm text-foreground">{account.password}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-95 ${
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
                </div>

                <p className="text-xs text-muted-foreground/60 mt-2">
                  {formatDate(account.timestamp)}
                </p>
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
  const [platform, setPlatform] = useState<"youtube" | "tiktok">("youtube")

  const downloadVideo = () => {
    if (!url.trim()) {
      toast.error("Cole o link do video!")
      return
    }

    let downloadUrl = ""
    
    if (platform === "youtube") {
      downloadUrl = `https://www.y2mate.com/youtube/${encodeURIComponent(url)}`
    } else {
      downloadUrl = `https://ssstik.io/pt`
    }

    window.open(downloadUrl, '_blank')
    toast.success("Abrindo downloader...")
  }

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
              Baixe videos do YouTube e TikTok.
            </p>
          </div>
        </div>

        {/* Platform Toggle */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setPlatform("youtube")}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
              platform === "youtube"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            YouTube
          </button>
          <button
            onClick={() => setPlatform("tiktok")}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
              platform === "tiktok"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            TikTok
          </button>
        </div>

        <Input
          placeholder={`Cole o link do ${platform === "youtube" ? "YouTube" : "TikTok"} aqui...`}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && downloadVideo()}
          className="mb-4 h-12 rounded-xl border-border/50 bg-input/50 font-mono text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />

        <Button
          onClick={downloadVideo}
          disabled={!url.trim()}
          className="w-full h-11 rounded-xl bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
        >
          <Download className="mr-2 h-4 w-4" />
          Baixar Video
        </Button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Sera redirecionado para o site de download
        </p>
      </div>
    </div>
  )
}
