import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import lodash from 'lodash';
import { setDBData, setHomeData, useAppSelector, useDispatch } from '@/_UIHOOKS_';
import jssdk from '@htyf-mp/js-sdk'
import Item from '@/components/item';
import jsCrawler, { host } from '@/utils/js-crawler';

const numColumns = 2;

function Home() {
  const apps = useAppSelector(i => i.apps)
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const home = apps?.home;
  const isDebug = apps?.__ENV__ === 'DEV';

  const getData = useCallback(async () => {
    return new Promise(async resolve => {
      if (jssdk) {
        setIsRefreshing(true);
        try {
          let data = await jssdk?.puppeteer({
            url: `${host}`,
            jscode: `${jsCrawler}`,
            debug: isDebug,
            wait: 2000,
            timeout: 1000 * 10,
            callback: () => {},
          });
          if (!data) {
            data = await jssdk?.puppeteer({
              url: `${host}`,
              jscode: `${jsCrawler}`,
              debug: isDebug,
              wait: 2000,
              timeout: 1000 * 60 * 10,
              callback: () => {},
            });
          }
          resolve(data);
          if (data?.items?.length) {
            dispatch(
              setHomeData({
                ...data,
                items: data?.items?.map(i => i.url),
              }),
            );
            dispatch(setDBData(data?.items));
          }
        } catch (error) {
          
        } finally {
          setIsRefreshing(false);
        }
      }
    });
  }, [isDebug]);

  const hisList = useMemo(() => {
    if (apps?.history) {
      return lodash.orderBy(Object.values(apps.history), ['time'], ['desc']);
    }
    return [];
  }, [apps?.history]);

  const renderListHeader = () => {
    if (!hisList?.length) {
      return undefined;
    }
    
    return (
      <View style={tw`mt-[20px]`}>
        <Text style={tw`text-[18px] font-bold mb-[10px] ml-[10px]`}>历史记录</Text>
        <FlatList
          data={hisList}
          renderItem={({item}) => {
            return <Item 
              key={item.url} 
              url={item.url} 
              onPress={(info: any) => {
                navigation.navigate(`Details`, {
                  name: info.name,
                  url: encodeURIComponent(info.url)
                })
              }}
            />
          }}
          keyExtractor={(item) => item.url}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw``}
          
        />
        <Text style={tw`text-[18px] font-bold mb-[10px] ml-[10px]`}>热门影视</Text>
      </View>
    )
  };

  useEffect(() => {
    getData();
  }, [])

  return <View style={tw`flex-1`}>
    <Appbar.Header
      mode="small"
      style={{
        height: 50
      }}
    >
      <Appbar.Content titleStyle={{fontSize: 18,}} title="首页" />
    </Appbar.Header>
    <TouchableOpacity
      style={tw`p-[10px] bg-[#f8f8f8] rounded-[20px] m-[10px]`}
      onPress={() => navigation.navigate('Search')} // 假设存在一个SearchScreen
    >
      <Text style={tw`text-[#888] text-[16px] text-center`}>点击搜索电影...</Text>
    </TouchableOpacity>
    <FlatList
      style={tw`flex-1`}
      data={home?.items || []}
      ListHeaderComponent={renderListHeader}
      ListFooterComponent={() => <View style={tw`h-[180px]`} />}
      renderItem={({ item }: any) => {
        return <Item url={item} 
          onPress={(info: any) => {
            navigation.navigate(`Details`, {
              name: info.name,
              url: encodeURIComponent(info.url)
            })
          }}
        />
      }}
      keyExtractor={(item, index) => `${index}_${item}`}
      numColumns={numColumns}
      contentContainerStyle={tw`pl-[10px] pr-[10px]`}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={getData} />}
      ItemSeparatorComponent={() => {
        return <>
          {
            jssdk.AdBanner ? <jssdk.AdBanner /> : undefined
          }
        </>
      }}
    />
  </View>;
}

export default Home;