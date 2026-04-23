export interface Coordinates {
  lat: number
  lng: number
}

const STUB_COORDS: Coordinates = { lat: 30.2672, lng: -97.7431 } // Austin, TX

export async function geocodeCity(city: string): Promise<Coordinates> {
  if (process.env.USE_REAL_MAP === 'true') {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) throw new Error('NEXT_PUBLIC_MAPBOX_TOKEN is not set')

    const encoded = encodeURIComponent(city)
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?types=place&limit=1&access_token=${token}`
    )
    if (!res.ok) throw new Error(`Mapbox geocoding failed: ${res.statusText}`)

    const data = await res.json()
    const [lng, lat] = data.features?.[0]?.center ?? []
    if (lat == null || lng == null) return STUB_COORDS
    return { lat, lng }
  }

  console.log(`[GEOCODING] Stub returning Austin coords for: "${city}"`)
  return STUB_COORDS
}

export async function geocodeAddress(address: string): Promise<Coordinates> {
  if (process.env.USE_REAL_MAP === 'true') {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) throw new Error('NEXT_PUBLIC_MAPBOX_TOKEN is not set')

    const encoded = encodeURIComponent(address)
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?limit=1&access_token=${token}`
    )
    if (!res.ok) throw new Error(`Mapbox geocoding failed: ${res.statusText}`)

    const data = await res.json()
    const [lng, lat] = data.features?.[0]?.center ?? []
    if (lat == null || lng == null) return STUB_COORDS
    return { lat, lng }
  }

  console.log(`[GEOCODING] Stub returning Austin coords for: "${address}"`)
  return STUB_COORDS
}
