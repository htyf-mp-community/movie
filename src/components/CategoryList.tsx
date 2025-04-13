import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import type { CategoryItem, Categories } from '@/types';

/**
 * 分类列表组件属性接口
 * @interface CategoryListProps
 */
interface CategoryListProps {
  categories: Categories;
  selectedYear: CategoryItem | null;
  selectedTag: CategoryItem | null;
  selectedSeries: CategoryItem | null;
  onSelect: (item: CategoryItem, type: 'year' | 'tag' | 'series') => void;
}

/**
 * 分类列表组件
 * 用于显示电影分类，支持选择不同分类
 * @component CategoryList
 */
const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedYear,
  selectedTag,
  selectedSeries,
  onSelect,
}) => {
  /**
   * 渲染分类标签组
   */
  const renderCategoryGroup = useCallback((
    title: string,
    items: CategoryItem[],
    selectedItem: CategoryItem | null,
    type: 'year' | 'tag' | 'series'
  ) => (
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
  ), [onSelect]);

  return (
    <View style={styles.categoriesContainer}>
      {renderCategoryGroup('年份', categories.year.items, selectedYear, 'year')}
      {renderCategoryGroup('影片类型', categories.tags.items, selectedTag, 'tag')}
      {renderCategoryGroup('分类', categories.series.items, selectedSeries, 'series')}
    </View>
  );
};

const styles = StyleSheet.create({
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

export default CategoryList; 