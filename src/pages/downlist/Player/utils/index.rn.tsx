import { useMiniAppSdk } from '@hongtangyun/react-native-mini-apps-engines';
import delay from 'delay';
import { Ref, forwardRef, useEffect, useImperativeHandle } from 'react';


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
  const sdk = useMiniAppSdk();

  useImperativeHandle(ref, () => ({
    play: async (data: PlayItem) => {
      sdk.openVideoPlayer({
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
      sdk.closeVideoPlayer()
    }
  }))

  return undefined
})

export default Play;