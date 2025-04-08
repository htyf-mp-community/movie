import { TVideoProvider } from './types'
import * as czzy from './czzy'

export * from './types'


export const TVService: Record<string, TVideoProvider> = {
  czzy,
} as const