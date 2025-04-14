import { useUI } from '@/hooks';
import tw from 'twrnc';
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useImmer } from 'use-immer';
import lodash from 'lodash';
import Item from '@/components/item';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { TVideo } from '@/services';
import type { Categories, CategoryItem, MovieInfo, Pagination } from '@/types/categories';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useAppStore } from '@/store';

// 电影列表项接口
interface MovieItem {
  href: string;
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
  const isFocused = useIsFocused();
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
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  // 从 useAppStore 获取数据和方法
  const updateVideoData = useAppStore(state => state.updateVideoData);
  const getVideoData = useAppStore(state => state.getVideoData);
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
        console.error('response', response.pagination.currentPage, response.pagination.totalPages);
        if (response) {
          // 更新分类信息
          setCategories(response.categories);

          // 更新数据
          setDataObj(draft => {
            if (!url) {
              // 刷新时清空数据
              draft[selectedTab] = {
                items: response.list.map(movie => ({
                  href: movie.href
                }))
              };
            } else {
              // 加载更多时追加数据
              const currentItems = draft[selectedTab]?.items || [];
              draft[selectedTab] = {
                items: [
                  ...currentItems,
                  ...response.list.map(movie => ({
                    href: movie.href
                  }))
                ]
              };
            }
          });

          // 将每个电影数据保存到 useAppStore 中
          response.list.forEach(movie => {
            updateVideoData(movie.href, movie);
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
    [selectedTab, setDataObj, updateVideoData],
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
    console.error('handleLoadMore', isLoadingMore, pagination.hasMore);
    if (isLoadingMore || !pagination.hasMore) return;
    try {
      setIsLoadingMore(true);
      // 获取当前选中的分类URL
      const nextUrl = pagination.currentPage < pagination.totalPages ? `/page/${pagination.currentPage + 1}` : null;
      if (nextUrl) {
        // 构建分页URL，假设分页参数为page
        const pageUrl = `${nextUrl}`;
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
  const handleTabPress = useCallback((category: CategoryItem, type: 'year' | 'tag' | 'series') => {
    // 检查是否是取消选中
    const isDeselecting =
      (type === 'year' && selectedYear?.slug === category.slug) ||
      (type === 'tag' && selectedTag?.slug === category.slug) ||
      (type === 'series' && selectedSeries?.slug === category.slug);

    // 根据类型更新选中的分类
    if (isDeselecting) {
      if (type === 'year') setSelectedYear(null);
      if (type === 'tag') setSelectedTag(null);
      if (type === 'series') setSelectedSeries(null);
    } else {
      if (type === 'year') setSelectedYear(category);
      if (type === 'tag') setSelectedTag(category);
      if (type === 'series') setSelectedSeries(category);
    }

    // 获取当前选中的分类URL
    const currentUrl = selectedYear?.url || selectedTag?.url || selectedSeries?.url;

    // 如果取消选中后没有其他分类被选中，则重置为全部
    if (!currentUrl && !isDeselecting) {
      setDataObj({});
      setPagination({
        currentPage: 1,
        totalPages: 1,
        hasMore: true,
      });
      getData();
    } else {
      getData(currentUrl);
    }
  }, [selectedYear, selectedTag, selectedSeries, setDataObj, getData]);

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
  }, [isFocused]);

  /**
   * 渲染分类标签组
   */
  const renderCategoryGroup = useCallback((title: string, items: CategoryItem[], selectedItem: CategoryItem | null, onSelect: (item: CategoryItem, type: 'year' | 'tag' | 'series') => void, type: 'year' | 'tag' | 'series') => (
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
            onPress={() => onSelect(item, type)}
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

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        style={[props.style]}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

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
            handleTabPress,
            'year'
          )}
          {renderCategoryGroup(
            '影片类型',
            categories.tags.items,
            selectedTag,
            handleTabPress,
            'tag'
          )}
          {renderCategoryGroup(
            '分类',
            categories.series.items,
            selectedSeries,
            handleTabPress,
            'series'
          )}
        </>
      )}
    </View>
  ), [categories, selectedYear, selectedTag, selectedSeries, handleTabPress]);

  /**
   * 渲染选中的分类标签
   */
  const renderSelectedCategories = useCallback(() => (
    <View style={styles.selectedCategoriesContainer}>
      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => bottomSheetRef.current?.expand()}
      >
        <Text style={styles.expandButtonText}>展开分类</Text>
      </TouchableOpacity>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.selectedTagsScroll}
      >
        {selectedYear && (
          <TouchableOpacity
            style={styles.selectedTag}
            onPress={() => handleTabPress(selectedYear, 'year')}
          >
            <Text style={styles.selectedTagText}>{selectedYear.text}</Text>
          </TouchableOpacity>
        )}
        {selectedTag && (
          <TouchableOpacity
            style={styles.selectedTag}
            onPress={() => handleTabPress(selectedTag, 'tag')}
          >
            <Text style={styles.selectedTagText}>{selectedTag.text}</Text>
          </TouchableOpacity>
        )}
        {selectedSeries && (
          <TouchableOpacity
            style={styles.selectedTag}
            onPress={() => handleTabPress(selectedSeries, 'series')}
          >
            <Text style={styles.selectedTagText}>{selectedSeries.text}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  ), [selectedYear, selectedTag, selectedSeries, handleTabPress]);

  /**
   * 渲染列表头部
   */
  const renderListHeader = useCallback(() => (
    <View>
      {renderSelectedCategories()}
    </View>
  ), [renderSelectedCategories]);

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

  const renderMovieItem = useCallback(({ item }: { item: MovieItem }) => {
    const movieData = getVideoData(item.href);
    return (
      <Item
        url={item.href}
        title={movieData?.title || ''}
        year={movieData?.year || ''}
        cover={movieData?.cover}
        rating={movieData?.rating}
        type={movieData?.type || ''}
        description={movieData?.description || ''}
        onPress={handleMoviePress}
      />
    );
  }, [handleMoviePress]);

  return (
    <SafeAreaView style={styles.container}>
      {renderListHeader()}
      <View style={tw`flex-grow`}>
        <FlatList
          ref={flatListRef}
          data={list}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.href}
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

      <BottomSheet
        backdropComponent={renderBackdrop}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>分类</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => bottomSheetRef.current?.close()}
            >
              <Text style={styles.closeButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
          {renderCategories()}
        </View>
      </BottomSheet>
    </SafeAreaView>
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
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoriesHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  collapseButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  collapseButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedCategoriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  expandButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 10,
  },
  expandButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedTagsScroll: {
    flex: 1,
  },
  selectedTag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  selectedTagText: {
    color: '#fff',
    fontSize: 14,
  },
  bottomSheetBackground: {
    backgroundColor: '#1a1a1a',
  },
  bottomSheetIndicator: {
    backgroundColor: '#fff',
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 15,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default MovieListPage;
