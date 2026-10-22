import { ChevronDown } from "lucide-react"

const STEPS = [
  "Copie a chave secreta enviada na sua compra.",
  "Cole a chave no gerador 2FA.",
  "Pronto! Seu código será gerado e copiado automaticamente.",
]

export function InstructionsPanel() {
  return (
    <aside
      aria-labelledby="instructions-title"
      className="xmas-card snow-cap w-full rounded-3xl border border-border bg-card/85 p-6 pt-8 backdrop-blur-md"
    >
      <h2 id="instructions-title" className="text-lg font-semibold text-foreground">
        {"🎅 Como usar o gerador?"}
      </h2>

      <ol className="mt-6 flex flex-col gap-4">
        {STEPS.map((step, i) => (
          <li key={step} className="flex items-start gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-primary text-sm font-semibold text-primary-foreground">
              {i + 1}
            </span>
            <p className="pt-1 leading-relaxed text-foreground/90">{step}</p>
          </li>
        ))}
      </ol>

      <details className="group mt-6 rounded-2xl border border-border bg-background/60">
        <summary className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 py-4 font-medium text-foreground transition-colors hover:bg-secondary/60 focus-visible:outline-2 focus-visible:outline-gold">
          {"❄️ Código não funciona?"}
          <ChevronDown
            className="chevron h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300"
            aria-hidden="true"
          />
        </summary>
        <div className="flex flex-col gap-4 px-4 pb-5 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h3 className="font-semibold text-foreground">Verifique a chave</h3>
            <p className="mt-1">
              Copie a chave inteira, sem espaços sobrando no começo ou no fim. Ela usa apenas
              letras de A a Z e números de 2 a 7 (nunca 0, 1, 8 ou 9).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Sincronize o horário do Windows</h3>
            <p className="mt-1">
              O código depende do relógio do seu aparelho. Se o horário estiver errado, o código
              não será aceito:
            </p>
            <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5">
              <li>Clique com o botão direito no relógio da barra de tarefas.</li>
              <li>{'Escolha "Ajustar data e hora".'}</li>
              <li>{'Ative "Definir horário automaticamente".'}</li>
              <li>{'Clique em "Sincronizar agora" e gere um novo código.'}</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">No celular</h3>
            <p className="mt-1">
              {'Em Configurações > Data e hora, ative "Data e hora automáticas".'}
            </p>
          </div>
        </div>
      </details>
    </aside>
  )
}
