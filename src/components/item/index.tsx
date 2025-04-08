import { useMemo } from "react";
import { View, StyleSheet, Image, Text, Dimensions, TouchableOpacity, ViewStyle, TextStyle, ImageStyle } from "react-native";
import URLParse from "url-parse";
import lodash from 'lodash';
import { useAppSelector } from "@/_UIHOOKS_";
import type { TVideo } from '@/services';

// 常量定义
const NUM_COLUMNS = 2;
const WIDTH = Dimensions.get('window').width / NUM_COLUMNS - 20;

// 组件属性接口
interface ItemProps {
  url: string;
  onPress?: (info: TVideo) => void;
}

// 样式接口
interface Styles {
  list: ViewStyle;
  itemContainer: ViewStyle;
  image: ImageStyle;
  title: TextStyle;
}

/**
 * 电影项组件
 * 显示单个电影项，包括封面图片和标题
 * @param props - 组件属性
 * @returns 电影项组件
 */
const Item: React.FC<ItemProps> = (props) => {
  const apps = useAppSelector(i => i.apps);

  /**
   * 解析URL并获取电影信息
   */
  const info = useMemo(() => {
    try {
      const urlObj = new URLParse(props.url, true);
      const itemData = lodash.get(apps?.db || {}, `${urlObj.pathname}`, undefined) as TVideo | undefined;
      return itemData;
    } catch (error) {
      console.error('解析URL失败:', error);
      return undefined;
    }
  }, [apps.db, props.url]);

  /**
   * 处理点击事件
   */
  const handlePress = useMemo(() => {
    return () => {
      if (info) {
        props?.onPress?.(info);
      }
    };
  }, [info, props.onPress]);

  return (
    <TouchableOpacity 
      style={styles.itemContainer} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: info?.img }} 
        style={styles.image}
        resizeMode="cover"
      />
      <Text 
        style={styles.title}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {info?.title?.replace(/[\n\s]/g, '') || '---'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create<Styles>({
  list: {
    paddingHorizontal: 10,
  },
  itemContainer: {
    flex: 1,
    margin: 10,
    alignItems: 'center' as const,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: WIDTH,
    height: WIDTH * 1.5,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  title: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
    paddingHorizontal: 4,
  },
});

export default Item;