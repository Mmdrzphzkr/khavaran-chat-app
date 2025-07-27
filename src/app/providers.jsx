// src/app/providers
'use client'
import { SessionProvider } from 'next-auth/react'

export default function Providers({ children, session }) {
  return (
    <SessionProvider 
      session={session}
      basePath="/api/auth"  // ← Critical addition
    >
      {children}
    </SessionProvider>
  )
}