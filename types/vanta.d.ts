declare module 'vanta/dist/vanta.halo.min' {
  import * as THREE from 'three'

  interface VantaHaloOptions {
    el: HTMLElement
    THREE: typeof THREE
    mouseControls?: boolean
    touchControls?: boolean
    backgroundColor?: number
    baseColor?: number
    size?: number
    amplitudeFactor?: number
    xOffset?: number
    yOffset?: number
  }

  interface VantaEffect {
    destroy: () => void
  }

  function HALO(options: VantaHaloOptions): VantaEffect
  export default HALO
}
