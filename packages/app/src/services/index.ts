import { TVideoProvider } from './types'
import * as sample from './czzy'

export * from './types'


export const TVService: Record<string, TVideoProvider> = {
    sample,
} as const