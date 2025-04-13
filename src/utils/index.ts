import React from "react";
import asyncStorage, { AsyncStorageStatic } from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import type {MMKV} from 'react-native-mmkv'
import URLParse from 'url-parse';

export const minisdkRef =  React.createRef<any>();

let storage = asyncStorage;

if (Platform.OS !== 'web') {
  try {
    const MMKV_KEY = `app_${__APP_DEFINE_APPID__}_storage`;
    const Mmkv = require('react-native-mmkv').MMKV;
    const ReactNativeBlobUtil = require('react-native-blob-util').default
    const mmkvStorage = new Mmkv({
      id: MMKV_KEY,
      path: `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${MMKV_KEY}`,
      encryptionKey: `${MMKV_KEY}_encryptionKey`
    }) as MMKV;
    storage = {
      async getItem(key: string) {
        const res = mmkvStorage.getString(key)
        return res;
      },

      async setItem(key: string, data: string) {
        return mmkvStorage.set(key, data)
      },

      async removeItem(key: string) {
        return mmkvStorage.delete(key)
      },

      async clear(callback) {
        mmkvStorage.clearAll()
        callback?.();
      }
    } as AsyncStorageStatic
  } catch (error) {
    console.error('localStorage mmkv error: ', error)
  }
}

export const localStorage: AsyncStorageStatic = storage;

/**
 * 处理错误情况
 * @param {string} message - 错误消息
 * @param {Error} [error] - 错误对象
 */
export const handleError = (message: string, error?: Error) => {
  console.error(message, error);
  Alert.alert('错误', message);
};

/**
 * 检查 URL 是否有效
 * @param {string} url - 要检查的 URL
 * @returns {boolean} URL 是否有效
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 比较两个 URL 的路径是否相同
 * @param {string} url1 - 第一个 URL
 * @param {string} url2 - 第二个 URL
 * @returns {boolean} 路径是否相同
 */
export const compareUrlPath = (url1: string, url2: string): boolean => {
  const url1Obj = new URLParse(url1);
  const url2Obj = new URLParse(url2);
  return url1Obj.pathname === url2Obj.pathname;
};

/**
 * 格式化时间戳
 * @param {number} timestamp - 时间戳
 * @returns {string} 格式化后的时间
 */
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

/**
 * 防抖函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间
 * @returns {Function} 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

/**
 * 节流函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间
 * @returns {Function} 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timer) return;
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
};
