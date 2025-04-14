import { useMemo } from "react";
import { View, StyleSheet, Image, Text, Dimensions, TouchableOpacity, ViewStyle, TextStyle, ImageStyle } from "react-native";
import URLParse from "url-parse";
import { useAppStore } from "@/store";
import type { TVideo } from '@/services';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// 常量定义
const NUM_COLUMNS = 2;
const WIDTH = Dimensions.get('window').width / NUM_COLUMNS - 20;

// 组件属性接口
interface ItemProps {
  url: string;
  title?: string;
  year?: string;
  cover?: string;
  rating?: string;
  type?: string;
  description?: string;
  onPress?: (info: TVideo) => void;
}

// 样式接口
interface Styles {
  list: ViewStyle;
  itemContainer: ViewStyle;
  imageContainer: ViewStyle;
  image: ImageStyle;
  title: TextStyle;
  year: TextStyle;
  overlay: ViewStyle;
  textContainer: ViewStyle;
  ratingContainer: ViewStyle;
  ratingText: TextStyle;
  typeText: TextStyle;
  descriptionText: TextStyle;
  infoRow: ViewStyle;
}

/**
 * 电影项组件
 * 显示单个电影项，包括封面图片和详细信息
 * @param props - 组件属性
 * @returns 电影项组件
 */
const Item: React.FC<ItemProps> = (props) => {
  const appStore = useAppStore();

  /**
   * 解析URL并获取电影信息
   */
  const info = useMemo(() => {
    try {
      return appStore.getVideoData(props.url);
    } catch (error) {
      console.error('解析URL失败:', error);
      return undefined;
    }
  }, [appStore, props.url]);

  /**
   * 处理点击事件
   */
  const handlePress = useMemo(() => {
    return () => {
      if (info) {
        props?.onPress?.({
          ...info,
        });
      }
    };
  }, [props.url, info, props.onPress]);

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: props.cover || info?.cover }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        {props.rating && (
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{props.rating}</Text>
          </View>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text
          style={styles.title}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {props.title || info?.title?.replace(/[\n\s]/g, '') || '---'}
        </Text>
        <View style={styles.infoRow}>
          {props.year && (
            <Text style={styles.year}>{props.year}</Text>
          )}
          {props.type && (
            <Text style={styles.typeText}>{props.type}</Text>
          )}
        </View>
        {props.description && (
          <Text
            style={styles.descriptionText}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {props.description}
          </Text>
        )}
      </View>
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
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
    height: WIDTH * 1.5,
    backgroundColor: '#333',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  ratingContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 12,
    marginLeft: 2,
    fontWeight: '600',
  },
  textContainer: {
    padding: 8,
    width: '100%',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  year: {
    fontSize: 12,
    color: '#888',
    marginRight: 8,
  },
  typeText: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#E50914',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
    color: '#aaa',
    lineHeight: 16,
  },
});

export default Item;