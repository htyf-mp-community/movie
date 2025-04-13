export * from './hooks';
export * from './utils';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '@/store';
import { handleError, isValidUrl } from '@/utils';
import { ERROR_MESSAGES } from '@/constants';
import type { TVideo } from '@/types';

/**
 * 使用视频数据
 * @param {string} url - 视频地址
 * @returns {Object} 视频数据和相关方法
 */
export const useVideoData = (url: string) => {
  const updateVideoData = useAppStore(state => state.updateVideoData);
  const getVideoData = useAppStore(state => state.getVideoData);
  const updateDBData = useAppStore(state => state.updateDBData);
  const getDBData = useAppStore(state => state.getDBData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取视频数据
   */
  const getData = useCallback(async () => {
    if (!url || !isValidUrl(url)) {
      setError(ERROR_MESSAGES.invalidUrl);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const storeData = getVideoData(url);
      const dbData = getDBData(url);

      if (storeData) {
        return {
          ...dbData,
          details: storeData
        } as TVideo;
      }
      return dbData as TVideo;
    } catch (error) {
      setError(ERROR_MESSAGES.unknownError);
      handleError(ERROR_MESSAGES.unknownError, error as Error);
    } finally {
      setLoading(false);
    }
  }, [url, getVideoData, getDBData]);

  /**
   * 更新视频数据
   */
  const updateData = useCallback(async (data: TVideo) => {
    if (!url || !isValidUrl(url)) {
      setError(ERROR_MESSAGES.invalidUrl);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (data.details) {
        updateVideoData(url, data.details);
      }
      updateDBData(data);
    } catch (error) {
      setError(ERROR_MESSAGES.unknownError);
      handleError(ERROR_MESSAGES.unknownError, error as Error);
    } finally {
      setLoading(false);
    }
  }, [url, updateVideoData, updateDBData]);

  return {
    loading,
    error,
    getData,
    updateData,
  };
};

/**
 * 使用分页
 * @param {number} initialPage - 初始页码
 * @returns {Object} 分页状态和方法
 */
export const usePagination = (initialPage: number = 1) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /**
   * 更新分页信息
   */
  const updatePagination = useCallback((page: number, total: number) => {
    setCurrentPage(page);
    setTotalPages(total);
    setHasMore(page < total);
  }, []);

  /**
   * 重置分页
   */
  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setTotalPages(1);
    setHasMore(true);
  }, [initialPage]);

  return {
    currentPage,
    totalPages,
    hasMore,
    updatePagination,
    resetPagination,
  };
};

/**
 * 使用底部弹窗
 * @returns {Object} 底部弹窗状态和方法
 */
export const useBottomSheet = () => {
  const bottomSheetRef = useRef<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  /**
   * 打开底部弹窗
   */
  const open = useCallback(() => {
    bottomSheetRef.current?.expand();
    setIsOpen(true);
  }, []);

  /**
   * 关闭底部弹窗
   */
  const close = useCallback(() => {
    bottomSheetRef.current?.close();
    setIsOpen(false);
  }, []);

  return {
    bottomSheetRef,
    isOpen,
    open,
    close,
  };
};

/**
 * 使用导航
 * @returns {Object} 导航方法
 */
export const useNavigationHook = () => {
  const navigation = useNavigation();

  /**
   * 导航到详情页
   */
  const navigateToDetails = useCallback((name: string, url: string) => {
    navigation.navigate('Details', {
      name,
      url: encodeURIComponent(url),
    });
  }, [navigation]);

  /**
   * 返回上一页
   */
  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    navigateToDetails,
    goBack,
  };
};
