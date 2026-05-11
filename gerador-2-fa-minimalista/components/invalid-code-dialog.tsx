"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Key, Clock } from "lucide-react"

interface InvalidCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvalidCodeDialog({ open, onOpenChange }: InvalidCodeDialogProps) {
  const windowsSteps = [
    "Clique com o botão direito no relógio (canto inferior direito)",
    'Selecione "Ajustar data/hora"',
    'Ative "Definir hora automaticamente"',
    'Clique em "Sincronizar agora"',
    "Reinicie o navegador e tente novamente",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-popover p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            Soluções para código inválido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-6">
          {/* Solução 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">1. Verifique a chave</span>
            </div>
            <p className="pl-6 text-sm text-muted-foreground">
              Certifique-se de que a chave TOTP está correta, sem espaços extras ou caracteres errados.
            </p>
          </div>

          {/* Solução 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">2. Horário dessincronizado</span>
            </div>
            <p className="pl-6 text-sm text-muted-foreground">
              Se a chave estiver correta, o problema pode ser o horário do seu computador.
            </p>

            {/* Windows Steps */}
            <div className="ml-6 rounded-lg border border-border bg-secondary/30 p-4">
              <h4 className="mb-3 text-sm font-medium">Como sincronizar o horário no Windows:</h4>
              <ol className="space-y-2">
                {windowsSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/20 text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
