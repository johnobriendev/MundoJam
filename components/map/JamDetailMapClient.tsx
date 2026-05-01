'use client'

import dynamic from 'next/dynamic'

const JamDetailMap = dynamic(() => import('./JamDetailMap'), { ssr: false })

export default function JamDetailMapClient({ lat, lng }: { lat: number; lng: number }) {
  return <JamDetailMap lat={lat} lng={lng} />
}
