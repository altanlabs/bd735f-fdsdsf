import './globals.css'
import { ThemeProvider } from "@/theme/theme-provider"
import { ThemeToggle } from '@/components/theme-toggle'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Windows XP</title>
        <link rel="icon" href="https://i.imgur.com/jD177JQ.png" />
      </head>
      <body>
        <ThemeProvider defaultTheme="light">
          <div className="min-h-screen bg-background text-foreground">
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}