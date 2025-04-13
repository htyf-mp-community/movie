import React, { useCallback } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import tw from 'twrnc';

/**
 * 搜索栏组件属性接口
 * @interface SearchBarProps
 */
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

/**
 * 搜索栏组件
 * 用于提供搜索输入功能
 * @component SearchBar
 */
const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = '搜索电影...',
}) => {
  /**
   * 处理搜索提交
   */
  const handleSubmit = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <View style={styles.searchContainer}>
      <TextInput
        placeholderTextColor="#808080"
        style={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    padding: 15,
    backgroundColor: 'transparent',
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 20,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
});

export default SearchBar; 