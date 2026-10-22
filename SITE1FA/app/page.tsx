import { Lock } from "lucide-react"
import { TOTPGenerator } from "@/components/totp-generator"
import { InstructionsPanel } from "@/components/instructions-panel"
import { Snowfall } from "@/components/christmas/snowfall"
import { ChristmasLights, SantaParade, TitleStars } from "@/components/christmas/decorations"

export default function Home() {
  return (
    <div className="xmas-backdrop relative min-h-dvh overflow-x-hidden">
      <Snowfall />
      <SantaParade />
      <ChristmasLights />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-16 pt-20 sm:px-6 sm:pt-24">
        <header className="rise-in flex flex-col items-center gap-4 text-center">
          <div className="relative px-4">
            <TitleStars />
            <h1 className="font-display text-5xl font-bold leading-tight text-foreground text-balance sm:text-7xl">
              <span aria-hidden="true">{"🎄 "}</span>
              BERNADU <span className="text-gold">FERRAMENTAS</span>
            </h1>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground text-pretty">
            Gere seu código 2FA de forma rápida e segura!
          </p>
        </header>

        <div
          className="rise-in mx-auto grid w-full max-w-lg items-start gap-8 lg:max-w-none lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)_minmax(0,1fr)]"
          style={{ animationDelay: "150ms" }}
        >
          <div className="w-full min-w-0 lg:mx-auto lg:max-w-[500px] xl:col-start-2">
            <TOTPGenerator />
          </div>
          <div className="w-full min-w-0 lg:sticky lg:top-8 xl:col-start-3 xl:max-w-[320px] xl:justify-self-end">
            <InstructionsPanel />
          </div>
        </div>

        <p className="flex items-center justify-center gap-2 text-center text-sm leading-relaxed text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
          Tudo é gerado no seu navegador. Sua chave nunca é enviada nem salva.
        </p>
      </main>
    </div>
  )
}
