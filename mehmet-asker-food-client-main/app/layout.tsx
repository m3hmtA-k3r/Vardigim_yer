import './globals.css'
import 'antd/dist/reset.css'
import { Inter } from 'next/font/google'
import { Providers } from '../lib/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Food Delivery',
  description: 'Food Delivery Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>

      </body>
    </html>
  )
}
