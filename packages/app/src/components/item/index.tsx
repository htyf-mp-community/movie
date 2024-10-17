import { useMemo } from "react";
import { View, StyleSheet, Image, Text, Dimensions, TouchableOpacity,  } from "react-native"
import URLParse from "url-parse";
import lodash from 'lodash';
import { useAppSelector } from "@/_UIHOOKS_";

const numColumns = 2;
const WIDTH = Dimensions.get('window').width / numColumns - 20;


export default function Item(props: {url: string, onPress?: (info: any) => void}) {
  const apps = useAppSelector(i => i.apps)
  const info = useMemo(() => {
    const urlObj = new URLParse(props.url, true);
    const itemData = lodash.get(apps?.db || {}, `${urlObj.pathname}`, undefined);
    return itemData;
  }, [apps.db])
  return <TouchableOpacity style={styles.itemContainer} onPress={() => props?.onPress?.(info)}>
    <Image source={{ uri: info?.img }} style={styles.image} />
    <Text style={styles.title}>{info?.name?.replace(/[\n\s]/g, '') || '---'}</Text>
  </TouchableOpacity>
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 10,
  },
  itemContainer: {
    flex: 1,
    margin: 10,
    alignItems: 'center',
  },
  image: {
    width: WIDTH,
    height: WIDTH * 1.5,
    borderRadius: 8,
  },
  title: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});