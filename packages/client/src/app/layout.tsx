import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ThemeRegistry from './registry'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flight Monitor',
  description: 'Monitor flight prices using Amadeus API',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}