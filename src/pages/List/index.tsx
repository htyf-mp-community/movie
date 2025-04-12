import { setDBData, useAppSelector, useDispatch, useUI } from '@/_UIHOOKS_';
import jsCrawler, { host } from '@/utils/js-crawler';
import tw from 'twrnc';
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView, Alert } from 'react-native';
import jssdk from '@htyf-mp/js-sdk';
import { useImmer } from 'use-immer';
import lodash from 'lodash';
import Item from '@/components/item';
import { useNavigation } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';
import type { TVideo } from '@/services';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { Categories, CategoryItem, MovieInfo, Pagination } from '@/types/categories';

// 电影列表项接口
interface MovieItem {
  url: string;
  name: string;
  img?: string;
  [key: string]: any;
}

// 数据对象接口
interface DataObject {
  [key: string]: {
    items: MovieItem[];
    [key: string]: any;
  };
}

// 分页信息接口
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * 电影列表页面组件
 * 显示不同分类的电影列表，支持下拉刷新和上拉加载更多
 */
const MovieListPage: React.FC = () => {
  // 引用和状态
  const flatListRef = useRef<FlatList<MovieItem>>(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const apps = useAppSelector((state) => state.apps);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedTab, setSelectedTab] = useState('全部');
  const [categories, setCategories] = useState<Categories | null>(null);
  const [dataObj, setDataObj] = useImmer<DataObject>({});
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    hasMore: true,
  });
  const ui = useUI();
  const [selectedYear, setSelectedYear] = useState<CategoryItem | null>(null);
  const [selectedTag, setSelectedTag] = useState<CategoryItem | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<CategoryItem | null>(null);

  const isDebug = apps?.__ENV__ === 'DEV';

  /**
   * 获取电影列表数据
   */
  const getData = useCallback(
    async (url?: string) => {
      // 只有在刷新时才滚动到顶部
      if (!url && flatListRef.current) {
        setIsRefreshing(true);
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      } else if (url) {
        // 加载更多时显示加载状态
        setIsLoadingMore(true);
      }

      try {
        const response = await ui.getVideoCategory(url);
        if (response) {
          // 更新分类信息
          setCategories(response.categories);

          // 更新数据
          setDataObj(draft => {
            if (!url) {
              // 刷新时清空数据
              draft[selectedTab] = {
                items: response.list.map(movie => ({
                  url: movie.href,
                  name: movie.title,
                  img: movie.cover,
                  year: movie.year,
                  details: movie.details
                }))
              };
            } else {
              // 加载更多时追加数据
              const currentItems = draft[selectedTab]?.items || [];
              draft[selectedTab] = {
                items: [
                  ...currentItems,
                  ...response.list.map(movie => ({
                    url: movie.href,
                    name: movie.title,
                    img: movie.cover,
                    year: movie.year,
                    details: movie.details
                  }))
                ]
              };
            }
          });

          // 更新分页信息
          setPagination({
            currentPage: response.pagination.currentPage,
            totalPages: response.pagination.totalPages,
            hasMore: response.pagination.currentPage < response.pagination.totalPages
          });
        }
      } catch (error) {
        console.error('获取电影列表失败:', error);
      } finally {
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [selectedTab, setDataObj],
  );

  /**
   * 处理下拉刷新
   */
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await getData();
    } catch (error) {
      console.error('刷新失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  /**
   * 处理上拉加载更多
   */
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !pagination.hasMore) return;
    try {
      setIsLoadingMore(true);
      // 获取当前选中的分类URL
      const currentUrl = selectedYear?.url || selectedTag?.url || selectedSeries?.url;
      if (currentUrl) {
        // 构建分页URL，假设分页参数为page
        const pageUrl = `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}page=${pagination.currentPage + 1}`;
        await getData(pageUrl);
      }
    } catch (error) {
      console.error('加载更多失败:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, pagination.hasMore, getData, selectedYear, selectedTag, selectedSeries, pagination.currentPage]);

  /**
   * 合并所有页面的电影列表
   */
  const list = useMemo(() => {
    const _list: MovieItem[] = [];
    for (const key in dataObj) {
      const items = lodash.get(dataObj, `[${key}]['items']`, []) as MovieItem[];
      _list.push(...items);
    }
    return _list;
  }, [dataObj]);

  /**
   * 处理分类切换
   */
  const handleTabPress = useCallback((category: CategoryItem) => {
    setSelectedTab(category.text);
    setDataObj({}); // 清空数据
    setPagination({
      currentPage: 1,
      totalPages: 1,
      hasMore: true,
    });
    // 传入分类URL获取数据
    getData(category.url);
  }, [setDataObj, getData]);

  /**
   * 处理电影项点击
   */
  const handleMoviePress = useCallback((info: TVideo) => {
    navigation.navigate('Details', {
      name: info.title,
      url: encodeURIComponent(info.href),
    });
  }, [navigation]);

  // 初始化加载数据
  useEffect(() => {
    getData();
  }, []);

  /**
   * 渲染分类标签组
   */
  const renderCategoryGroup = useCallback((title: string, items: CategoryItem[], selectedItem: CategoryItem | null, onSelect: (item: CategoryItem) => void) => (
    <View style={styles.categoryGroup}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScrollContainer}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.slug}
            style={[
              styles.tabItem,
              selectedItem?.slug === item.slug && styles.selectedTabItem,
            ]}
            onPress={() => onSelect(item)}
          >
            <Text style={[
              styles.tabText,
              selectedItem?.slug === item.slug && styles.selectedTabText,
            ]}>
              {item.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  ), []);

  /**
   * 渲染所有分类
   */
  const renderCategories = useCallback(() => (
    <View style={styles.categoriesContainer}>
      {categories && (
        <>
          {renderCategoryGroup(
            '年份',
            categories.year.items,
            selectedYear,
            (item) => {
              setSelectedYear(item);
              handleTabPress(item);
            }
          )}
          {renderCategoryGroup(
            '影片类型',
            categories.tags.items,
            selectedTag,
            (item) => {
              setSelectedTag(item);
              handleTabPress(item);
            }
          )}
          {renderCategoryGroup(
            '分类',
            categories.series.items,
            selectedSeries,
            (item) => {
              setSelectedSeries(item);
              handleTabPress(item);
            }
          )}
        </>
      )}
    </View>
  ), [categories, selectedYear, selectedTag, selectedSeries, handleTabPress]);

  /**
   * 渲染加载状态
   */
  const renderLoading = useCallback(() => (
    <View style={tw`h-[180px] justify-start items-center`}>
      {isLoadingMore && pagination.currentPage > 1 && (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
    </View>
  ), [isLoadingMore, pagination.currentPage]);

  const renderMovieItem = useCallback(({ item }: { item: MovieItem }) => (
    <Item
      url={item.url}
      title={item.name}
      year={item.year}
      cover={item.img}
      onPress={handleMoviePress}
    />
  ), [handleMoviePress]);

  return (
    <View style={styles.container}>
      <Appbar.Header mode="small" style={[tw`h-[50px]`, { backgroundColor: 'transparent' }]}>
        <Appbar.Content titleStyle={[tw`text-[18px]`, { color: '#fff' }]} title="分类" />
      </Appbar.Header>

      <View style={tw`flex-grow`}>
        {renderCategories()}
        <View style={tw`flex-grow h-0`}>
          {jssdk.AdBanner && <jssdk.AdBanner />}
          <FlatList
            ref={flatListRef}
            data={list}
            renderItem={renderMovieItem}
            keyExtractor={(item) => item.url}
            numColumns={2}
            contentContainerStyle={styles.movieList}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={['#E50914']}
                tintColor="#E50914"
                title="正在刷新..."
                titleColor="#E50914"
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderLoading}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  categoriesContainer: {
    paddingVertical: 15,
  },
  categoryGroup: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 15,
    color: '#fff',
  },
  movieList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  tabsScrollContainer: {
    paddingHorizontal: 10,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  selectedTabItem: {
    backgroundColor: '#E50914',
  },
  tabText: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#fff',
  },
  selectedTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MovieListPage;
