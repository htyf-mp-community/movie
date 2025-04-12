import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import jssdk from '@htyf-mp/js-sdk';
import type { TVideo, TVideoDetails } from '@/services';

// MMKV 持久化配置
const asyncStoragePersistConfig = {
  setItem: async (key: string, value: string) => jssdk.getStorage().setItem(key, value),
  getItem: async (key: string) => jssdk.getStorage().getItem(key) || '',
  removeItem: async (key: string) => jssdk.getStorage().removeItem(key),
};

// 视频数据接口
interface VideoData {
  details: TVideoDetails;
  lastUpdated: number;
}

// 应用状态接口
export interface AppStore {
  // 视频数据存储
  videoData: Record<string, VideoData>;
  // 更新视频数据
  updateVideoData: (url: string, details: TVideoDetails) => void;
  // 获取视频数据
  getVideoData: (url: string) => TVideoDetails | null;
  // 清除所有数据
  clearVideoData: () => void;
  // 清除过期数据
  clearExpiredData: (expireTime: number) => void;
}

// 初始状态
const initialState: Omit<AppStore, keyof Pick<AppStore, 'updateVideoData' | 'getVideoData' | 'clearVideoData' | 'clearExpiredData'>> = {
  videoData: {},
};

// 创建 Zustand store
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // 更新视频数据
      updateVideoData: (url: string, details: TVideoDetails) => {
        set((state) => ({
          videoData: {
            ...state.videoData,
            [url]: {
              details,
              lastUpdated: Date.now(),
            },
          },
        }));
      },

      // 获取视频数据
      getVideoData: (url: string) => {
        const data = get().videoData[url];
        if (!data) return null;
        return data.details;
      },

      // 清除所有数据
      clearVideoData: () => {
        set({ videoData: {} });
      },

      // 清除过期数据
      clearExpiredData: (expireTime: number) => {
        const now = Date.now();
        set((state) => ({
          videoData: Object.fromEntries(
            Object.entries(state.videoData).filter(
              ([_, data]) => now - data.lastUpdated < expireTime
            )
          ),
        }));
      },
    }),
    {
      name: "video-store",
      storage: createJSONStorage(() => asyncStoragePersistConfig),
    }
  )
);
