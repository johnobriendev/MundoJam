'use client'

import dynamic from 'next/dynamic'

const DashboardVanta = dynamic(() => import('./DashboardVanta'), { ssr: false })

export default function DashboardVantaLoader() {
  return <DashboardVanta />
}
