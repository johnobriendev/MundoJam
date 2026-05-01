'use client'

interface JamPin {
  id: string
  title: string
  lat: number
  lng: number
  city: string
}

interface JamMapProps {
  jams: JamPin[]
  onSelect?: (id: string) => void
}

export default function JamMap({ jams, onSelect }: JamMapProps) {
  if (process.env.NEXT_PUBLIC_USE_REAL_MAP === 'true') {
    // Real Mapbox implementation goes here when USE_REAL_MAP is enabled.
    // Import mapbox-gl, render a map centred on the user, add markers for each jam.
    return <div>Real map not yet implemented</div>
  }

  return (
    <div className="rounded-lg border border-dashed bg-muted flex flex-col items-center justify-center p-8 text-center min-h-[280px]">
      <div className="text-4xl mb-3">🗺️</div>
      <p className="text-secondary text-sm font-medium">Map placeholder</p>
      <p className="text-secondary text-xs mt-1">
        Set <code className="bg-muted px-1 rounded">NEXT_PUBLIC_USE_REAL_MAP=true</code> to enable the live map
      </p>
      {jams.length > 0 && (
        <ul className="mt-4 text-left w-full max-w-xs space-y-1">
          {jams.map((jam) => (
            <li key={jam.id}>
              <button
                onClick={() => onSelect?.(jam.id)}
                className="text-accent hover:underline text-sm truncate w-full text-left"
              >
                {jam.title} — {jam.city}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
