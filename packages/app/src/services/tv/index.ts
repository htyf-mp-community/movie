import { TVideoProvider } from './types'
import * as sample from './sample'

export * from './types'


export const TVService: Record<string, TVideoProvider> = {
    sample,
} as const