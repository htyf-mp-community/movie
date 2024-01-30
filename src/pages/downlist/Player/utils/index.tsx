import { Ref, forwardRef, useEffect, useImperativeHandle } from 'react';


export interface PlayItem {
  url: string;
  title:string;
  artist:string;
  artwork:string;
  duration: number;
  userAgent?: string;
  headers?: {[key: string]: string}
}

export interface PlayData {
  items: Array<PlayItem>;
  currentIdex: number;
  reset:boolean;
}

export interface PlayRef {
  play:  (data: PlayItem) => Promise<void>;
}

const Play = forwardRef((props, ref: Ref<PlayRef | undefined>) => {

  useImperativeHandle(ref, () => ({
    play: async (data: PlayItem) => {
      // sdk.openAudioPlayer({
      //   type: 'add',
      //   items: [data],
      //   currentIdex: 0,
      // })
      // sdk.openAudioPlayer({
      //   type: 'open',
      // })
    },
  }))

  return undefined
})

export default Play;