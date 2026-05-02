'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'

interface Props {
  initialAuthenticated: boolean
}

const MOBILE_BREAKPOINT = 768

function getVantaOptions(theme: string, mobile: boolean) {
  return {
    backgroundColor: theme === 'dark' ? 0x0f0f13 : 0xf6f3f1,
    baseColor: theme === 'dark' ? 0x7c3aed : 0xc2410c,
    size: mobile ? 0.65 : 1.5,
    amplitudeFactor: 1.2,
    xOffset: mobile ? 0 : 0.28,
    yOffset: mobile ? 0.05 : 0,
  }
}

export default function HeroSection({ initialAuthenticated }: Props) {
  const { status } = useSession()
  const { resolvedTheme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<{ destroy: () => void } | null>(null)
  const [visible, setVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const isAuthenticated = initialAuthenticated || status === 'authenticated'

  // track mobile breakpoint
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // init/reinit vanta whenever theme or mobile state changes
  useEffect(() => {
    if (isAuthenticated) return

    let cancelled = false

    const init = async () => {
      const THREE = await import('three')
      const HALO = (await import('vanta/dist/vanta.halo.min')).default
      if (cancelled || !containerRef.current) return

      effectRef.current?.destroy()
      effectRef.current = HALO({
        el: containerRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        ...getVantaOptions(resolvedTheme ?? 'light', isMobile),
      })
      setVisible(true)
    }

    init()

    return () => {
      cancelled = true
      effectRef.current?.destroy()
      effectRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, resolvedTheme, isMobile])

  if (isAuthenticated) return null

  const fadeStyle = { opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease' }

  if (isMobile) {
    return (
      <div
        ref={containerRef}
        className="relative w-full flex flex-col"
        style={{ height: '100dvh' }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-base))' }}
        />
        <div className="relative z-10 px-8 pt-16 flex flex-col items-center text-center gap-4" style={fadeStyle}>
          <h1 className="font-bold text-primary tracking-tight" style={{ fontSize: '2.75rem', lineHeight: 1.1 }}>
            MundoJam
          </h1>
          <p className="text-lg text-secondary max-w-sm">
            Find open jam sessions and connect with musicians anywhere in the world
          </p>
        </div>
        <div className="flex-1" />
        <div className="relative z-10 px-8 pb-32 flex gap-3 justify-center" style={fadeStyle}>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-md border border-[var(--border-focus)] text-accent font-medium hover:bg-accent hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-md bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center"
      style={{ height: '100dvh' }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-base))' }}
      />
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8">
        <div
          className="flex flex-col gap-6 items-start text-left"
          style={{ ...fadeStyle, maxWidth: '44%' }}
        >
          <h1 className="font-bold text-primary tracking-tight" style={{ fontSize: '3.75rem', lineHeight: 1.1 }}>
            MundoJam
          </h1>
          <p className="text-lg text-secondary max-w-sm">
            Find open jam sessions and connect with musicians anywhere in the world
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-md border border-[var(--border-focus)] text-accent font-medium hover:bg-accent hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-md bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
