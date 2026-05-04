'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

const MOBILE_BREAKPOINT = 768

function getVantaOptions(theme: string, mobile: boolean) {
  return {
    backgroundColor: theme === 'dark' ? 0x0f0f13 : 0xf6f3f1,
    baseColor: theme === 'dark' ? 0x7c3aed : 0xc2410c,
    size: mobile ? 0.45 : 0.75,
    amplitudeFactor: 0.7,
    xOffset: 0,
    yOffset: 0,
  }
}

export default function DashboardVanta() {
  const { resolvedTheme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<{ destroy: () => void } | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const THREE = await import('three')
      const HALO = (await import('vanta/dist/vanta.halo.min')).default
      if (cancelled || !containerRef.current) return

      effectRef.current?.destroy()
      effectRef.current = HALO({
        el: containerRef.current,
        THREE,
        mouseControls: false,
        touchControls: false,
        ...getVantaOptions(resolvedTheme ?? 'light', isMobile),
      })
    }

    init()

    return () => {
      cancelled = true
      effectRef.current?.destroy()
      effectRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme, isMobile])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0.35,
      }}
    />
  )
}
