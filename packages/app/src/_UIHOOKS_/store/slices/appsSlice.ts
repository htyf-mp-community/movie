import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import lodash from 'lodash';
import URLParse from 'url-parse';
import { TVideo, TVideoSources, TVService } from '@/services'

enum ENV_ENUM {
  'MASTER',
  'QA',
  'DEV'
}

enum HOST_ENUM {
  'https://mini.xx.com/api',
  'https://mini.xxx.com/api',
}

export interface PlayListItem {
  url: string;
  name: string;
}

export interface AudioItem {
  time: number;
  url: string;
  name: string;
  source: string;
  file?: string;
  userAgent?: string;
  header?: {[key: string]: string};
}

export interface BookItem {
  img: string;
  url: string;
  name: string;
  author: Array<{
    name: string;
    url: string;
  }>;
  des?: string;
  update?: {
    des: string;
    time: string;
  };
  playList?: Array<PlayListItem>;
}

export interface HistoryItem {
  url: string;
  playUrl: string;
  time: number;
}

// 初始状态类型
export interface AppsState {
  __ENV__: keyof typeof ENV_ENUM;
  __HOST__: keyof typeof HOST_ENUM;
  token: string;
  source: keyof typeof TVService,
  db: {
    [key: string]: TVideo
  };
  dbVideoSources: {
    [key: string]: TVideoSources
  },
  home: {
    items: Array<string>
  },
  history: {
    [key: string]: HistoryItem
  },
}



// 定义一个初始状态
const initialState: AppsState = {
  source: '',
  __ENV__: ENV_ENUM[ENV_ENUM['MASTER']],
  __HOST__: HOST_ENUM[HOST_ENUM['https://mini.xx.com/api']],
  token: '',
  db: {},
  dbVideoSources: {},
  home: {},
  history: {},
} as AppsState;

const counterSlice = createSlice({
  name: '__AppGlobal__',
  initialState,
  reducers: {
    appStoreInit: (state) => {
      state.__ENV__ = initialState.__ENV__;
      state.__HOST__ = initialState.__HOST__;
      state.token = initialState.token;
      state.db = {};
      state.history = {};
      state.home = {
        items: []
      };
    },

    setEnv: (state, action: PayloadAction<AppsState['__ENV__']>) => {
      if (ENV_ENUM[action.payload]) {
        state.__ENV__ = action.payload;
      } else {
        state.__ENV__ = 'MASTER';
      }
      if (state.__ENV__ === 'MASTER') {
        state.__HOST__ = 'https://mini.xx.com/api' 
      } else {
        state.__HOST__ = 'https://mini.xxx.com/api'
      }
    },
 
    setHomeData: (state, action: PayloadAction<AppsState['home']>) => {
      state.home = action.payload;
    },

    setDBData: (state, action: PayloadAction<TVideo[] | TVideo>) => {
      let arr: Array<TVideo> = []
      if (action.payload) {
        if (lodash.isArray(action.payload)) {
          arr.push(...action.payload)
        } else if (lodash.isObject(action.payload)) {
          arr.push(action.payload)
        }
        if (!lodash.isObject(state.db)) {
          state.db = {}
        }
        for (const key in arr) {
          const element = arr[key];
          if (element && lodash.isObject(element)) {
            const href = lodash.get(element, 'href')
            if (href) {
              const urlObj = URLParse(href, true)
              const pathname = urlObj.pathname;
              let preInfo = lodash.get((state.db || {}), pathname, {})
              state.db[pathname] = lodash.merge(preInfo, element)
            }
          }
        }
      }
    },

    setDBVideoSources: (state, action: PayloadAction<{href: string, videoSources: TVideoSources}>) => {
      const {href, videoSources} = action.payload;
      state.dbVideoSources[href] = videoSources;
    },

    setHistoryData: (state, action: PayloadAction<HistoryItem>) => {
      if (action.payload) {
        if (!lodash.isObject(state.history)) {
          state.history = {}
        }
        state.history[action.payload.url] = action.payload
      }
    },
  },
});
// 每个 case reducer 函数会生成对应的 Action creators
export const {setEnv, appStoreInit, setHomeData, setDBData, setDBVideoSources, setHistoryData} = counterSlice.actions;

export default counterSlice.reducer;
