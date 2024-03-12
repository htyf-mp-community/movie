import delay from 'delay';
import { Ref, forwardRef, useEffect, useImperativeHandle } from 'react';
import jssdk from '@htyf-mp/js-sdk'

export interface PlayItem {
  url: string;
  title:string;
  artist:string;
  artwork:string;
  duration: number;
  headers: {[key: string]: string}
}

export interface PlayData {
  items: Array<PlayItem>;
  currentIdex: number;
  reset:boolean;
  onPlayEnd?: () => void;
  onPlayError?: () => void;
}

export interface PlayRef {
  play: (data: PlayItem) => Promise<void>;
}

const Play = forwardRef((props, ref: Ref<PlayRef | undefined>) => {

  useImperativeHandle(ref, () => ({
    play: async (data: PlayItem) => {
      jssdk?.openVideoPlayer({
        playList: {
          items: [
            {
              itemSource: {
                source: {
                  uri: data.url
                },
                title: data.title
              },
            },
          ],
          currentIndex: 0,
        },
        onPlayEnd: data.onPlayEnd,
        onPlayError: data.onPlayError,
      });
    },
    close: async () => {
      jssdk.closeVideoPlayer()
    }
  }))

  return undefined
})

export default Play;