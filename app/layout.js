import { Inter } from 'next/font/google'
import './output.css'  // ✅ use compiled CSS, not raw globals.css

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'YourApp - Welcome',
  description: 'Your amazing application description',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
