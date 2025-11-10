// app/layout.js

import './globals.css';  // Tailwind directives (processed via PostCSS)

import { Inter } from 'next/font/google';
import SessionProviderWrapper from './SessionProviderWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Styled - Welcome',
  description: 'Fashion discovery with contextual insights',
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
