'use client'

import Map, { Marker } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

interface JamDetailMapProps {
  lat: number
  lng: number
}

export default function JamDetailMap({ lat, lng }: JamDetailMapProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (!token) {
    return (
      <div className="rounded-lg border border-dashed bg-muted flex items-center justify-center h-48 text-secondary text-sm">
        Set <code className="mx-1 bg-muted px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> to show map
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden h-64">
      <Map
        mapboxAccessToken={token}
        initialViewState={{ latitude: lat, longitude: lng, zoom: 14 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <Marker latitude={lat} longitude={lng} />
      </Map>
    </div>
  )
}
