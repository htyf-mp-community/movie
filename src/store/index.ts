import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import jssdk from '@htyf-mp/js-sdk';
import { TVideo } from "@/services";

/**
 * 历史记录项接口
 * @interface HistoryItem
 * @property {string} url - 视频 URL
 * @property {string} playUrl - 播放地址
 * @property {number} time - 时间戳
 */
export interface HistoryItem {
  url: string;
  playUrl: string;
  time: number;
}

/**
 * 存储配置接口
 * @interface StorageConfig
 * @property {(key: string, value: string) => Promise<void>} setItem - 设置存储项
 * @property {(key: string) => Promise<string>} getItem - 获取存储项
 * @property {(key: string) => Promise<void>} removeItem - 删除存储项
 */
interface StorageConfig {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string>;
  removeItem: (key: string) => Promise<void>;
}

/**
 * 应用状态接口
 * @interface AppState
 */
interface AppState {
  videoData: Record<string, TVideo>;
  historyData: HistoryItem[];
  homeData: string[];
  updateVideoData: (url: string, data: TVideo) => void;
  getVideoData: (url: string) => TVideo | undefined;
  updateHistory: (url: string, playUrl: string) => void;
  getHistoryData: () => HistoryItem[];
  updateHomeData: (data: string[]) => void;
}

/**
 * MMKV 持久化配置
 * @constant {StorageConfig}
 */
const asyncStoragePersistConfig: StorageConfig = {
  setItem: async (key: string, value: string) => jssdk.getStorage().setItem(key, value),
  getItem: async (key: string) => {
    const value = await jssdk.getStorage().getItem(key);
    return value || '';
  },
  removeItem: async (key: string) => jssdk.getStorage().removeItem(key),
};

/**
 * 初始状态
 * @constant {Omit<AppState, keyof Pick<AppState, 'updateVideoData' | 'getVideoData' | 'updateHistory' | 'getHistoryData' | 'updateHomeData'>>}
 */
const initialState: Omit<AppState, keyof Pick<AppState, 'updateVideoData' | 'getVideoData' | 'updateHistory' | 'getHistoryData' | 'updateHomeData'>> = {
  videoData: {},
  historyData: [],
  homeData: [],
};

/**
 * 创建应用状态存储
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      /**
       * 更新视频数据
       */
      updateVideoData: (url: string, data: TVideo) => {
        set((state: AppState) => {
          const existingData = state.videoData[url] || {};
          const mergedData = {
            ...existingData,
            ...Object.fromEntries(
              Object.entries(data).filter(([_, value]) => {
                if (value === undefined || value === null || value === '') {
                  return false;
                }
                if (Array.isArray(value) && value.length === 0) {
                  return false;
                }
                if (typeof value === 'object' && Object.keys(value).length === 0) {
                  return false;
                }
                return true;
              })
            ),
          };
          
          return {
            videoData: {
              ...state.videoData,
              [url]: mergedData,
            },
          };
        });
      },

      /**
       * 获取视频数据
       */
      getVideoData: (url: string) => {
        const state = get();
        return state.videoData[url];
      },

      /**
       * 更新历史记录
       */
      updateHistory: (url: string, playUrl: string) => {
        set((state: AppState) => {
          // 移除已存在的相同 url
          const history = state.historyData.filter(item => item.url !== url);
          // 添加到开头
          return {
            historyData: [{ url, playUrl, time: Date.now() }, ...history],
          };
        });
      },

      /**
       * 获取历史记录数据
       */
      getHistoryData: () => {
        const state = get();
        return state.historyData;
      },

      /**
       * 更新首页数据
       */
      updateHomeData: (data: string[]) => {
        set({ homeData: data });
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => asyncStoragePersistConfig),
    }
  )
);
