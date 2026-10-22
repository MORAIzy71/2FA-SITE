import type { Metadata, Viewport } from 'next'
import { Outfit, Mountains_of_Christmas } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const xmas = Mountains_of_Christmas({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-xmas',
})

export const metadata: Metadata = {
  title: 'BERNADU FERRAMENTAS - Gerador de Código 2FA',
  description: 'Gere seu código 2FA de forma rápida e segura, direto no seu navegador.',
  generator: 'v0.app',
  icons: {
    icon: '/icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0b0809',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`dark bg-background ${outfit.variable} ${xmas.variable}`}>
      <body className="font-sans antialiased bg-background">
        {children}
        <Toaster position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
