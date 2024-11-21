type RGB = `rgb(${string})`
type RGBA = `rgba(${string})`
type HEX = `#${string}`
type HSL = `hsl(${string})`
type HSLA = `hsla(${string})`
type VAR = `var(${string})`

type CssGlobals = 'inherit' | 'initial' | 'revert' | 'unset'

export type CssColorType = 'currentColor' | 'transparent' | RGB | RGBA | HEX | HSL | HSLA | VAR | CssGlobals
