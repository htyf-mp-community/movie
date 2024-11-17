import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Text, View, StyleSheet, ScrollView, Image, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { setAduioData, setDBData, setHistoryData, useAppSelector, useDispatch } from '@/_UIHOOKS_';
import jssdk from '@htyf-mp/js-sdk';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Appbar, MD2Colors } from 'react-native-paper';
import lodash from 'lodash'
import URLParse from 'url-parse';
import jsCrawler, { host } from '@/utils/js-crawler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function App() {
  const {bottom} = useSafeAreaInsets();
  const bottomSheetRef = useRef(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const router = useRoute();
  const apps = useAppSelector(i => i.apps);
  const isDebug = apps?.__ENV__ === 'DEV';
  const db = useAppSelector(i => i.apps?.db || {});
  const [refreshing, setRefreshing] = useState(false);
  const [playLoading, setPlayLoading] = useState(false);
  const params = router.params;

  const url = decodeURIComponent(`${params?.url}`);
  const snapPoints = useMemo(() => ['25%', '50%'], []);
  const movieDetail = useMemo(() => {
    const urlObj = URLParse(url, true);
    const pathname = urlObj.pathname;
    return lodash.get(db, `${pathname}`, undefined);
  }, [db, url]) as BookItem;

  const historyInfo = useMemo(() => {
    return lodash.get(apps?.history, `${url}`, undefined);
  }, [apps?.history, url]);

  const getData = useCallback(async () => {
    return new Promise(async resolve => {
      if (!url) {
        return;
      }
      if (jssdk) {
        setRefreshing(true)
        try {
          const urlObj = new URLParse(url, true);
          const data = await jssdk?.puppeteer({
            url: urlObj.set('origin', host?.replace(/\/$/gi, '')).toString(),
            jscode: `${jsCrawler}`,
            debug: isDebug,
            wait: 2000,
            timeout: 1000 * 30,
            callback: () => {},
          });
          resolve(data);
          if (data?.playList?.length) {
            dispatch(
              setDBData({
                ...data,
                url: url,
              }),
            );
          }
        } catch (error) {
          
        } finally {
          setRefreshing(false)
        }
      }
    });
  }, [params, isDebug]);

  const getPlayUrl = useCallback(async (url: string, hasPlay: boolean = false): Promise<any> => {
    return new Promise(async (resolve) => {
      if (!url) {
        resolve('')
        return;
      }
      if (jssdk) { 
        setPlayLoading(true)
        try {
          const urlObj = new URLParse(url, true);
          const data = await jssdk?.puppeteer({
            url: urlObj.set('origin', host?.replace(/\/$/gi, '')).toString(),
            jscode: `${jsCrawler}`,
            debug: isDebug,
            wait: 2000,
            timeout: 1000 * 30,
            callback: () => {}
          })
          const item = {
            time: Date.now(),
            url: url,
            name: data?.name,
            source: data.isIframe ? '' : data?.url,
            file: '',
            headers: {
              Host: URLParse(data?.url).host,
              "user-agent": data?.userAgent,
              Referer: data?.referer,
              Cookie: data?.cookie,
            },
          }
          if (!data.isIframe && data.url) {
            // playback();
          } else {
            const getHtml = (htmUrl: string): Promise<string> => {
              return new Promise(async (resolve, reject) => {
                try {
                  const res = await fetch(htmUrl, {
                    headers: {
                      "content-type": "text/html; charset=UTF-8",
                      "referer": `${host}`,
                      "sec-ch-ua": `"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"`,
                      "sec-ch-ua-mobile": `?0`,
                      "sec-ch-ua-platform": `"macOS"`,
                      "sec-fetch-dest": `iframe`,
                      "sec-fetch-mode": `navigate`,
                      "sec-fetch-site": `cross-site`,
                    }
                  })
                  resolve(res.text())
                } catch (error) {
                  reject(error)
                }
              })
            }
            const iframeOright = URLParse(data.url).origin;
            let iframeHtml = await getHtml(data.url);
            iframeHtml = `${iframeHtml}`.replace(/src="\/\//gi, `src="https://`).replace(/src="\//gi, `src="${iframeOright}/`)
            const res = await getIframData(data.url, iframeHtml, {
              "referer": `${host}`,
              "sec-fetch-dest": `iframe`,
              "sec-fetch-mode": `navigate`,
              "sec-fetch-site": `cross-site`,
            })
          
            item['source'] = res?.source;
            item['headers'] = {
              ...(item['headers'] || {}),
              Host: URLParse(res?.url).host,
              "user-agent": res?.userAgent,
              Referer: res?.referer,
              Cookie: res?.cookie,
            };
          }
          dispatch(setAduioData(item))
          resolve(item)
          if (hasPlay && item.source) {
            jssdk.openVideoPlayer({
              url: item.source,
              title: item.name,
              artist: `test`,
              artwork: `${movieDetail?.img}`,
              duration: 143,
              userAgent: data.userAgent,
              headers: {
                // ...(item?.headers || {}),
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Origin': item?.headers.Referer,
              },
              onPlayEnd: () => {
                const list = lodash.cloneDeep(movieDetail?.playList || [])
                const index = list.findIndex(i => i.url === url)
                const nextObj = lodash.get(list, `${index+1}`, {})
                if (nextObj.url) {
                  // getData(nextObj.url, true)
                  // dispatch(setHistoryData({
                  //   url: bookUrl,
                  //   playUrl: nextObj.url,
                  //   time: Date.now(),
                  // }))
                }
              },
              onPlayError: () => {

              }
            })
            // if (bookInfo?.playList && bookInfo?.playList?.length) {
            //   for (const key in book Info?.playList) {
            //     if (isShow.current) {
            //       const element = bookInfo?.playList[key];
            //       await getData(element.url)
            //     }
            //   }
            // }
          }
        } catch (error) {
          
        } finally {
          setPlayLoading(false)
        }
      }
    })
  }, [movieDetail, isDebug])

  const getIframData = useCallback(async (url: string, html: string, headers?: {[key: string]: string;}): Promise<any> => {
    return new Promise(async (resolve) => {
      if (!url) {
        resolve('')
        return;
      }
      if (jssdk) {
        const htmlEncodeString = encodeURIComponent(`${html}`)
        const data = await jssdk?.puppeteer({
          url: `${url}`,
          jscode: `function(callback) {
            try {
              if (!window.__global_document_write__) {
                var html = decodeURIComponent("${htmlEncodeString}");
                document.write(html);
                window.__global_document_write__ = true;
              }
            } catch (error) {
              alert(error)  
            }
            (${jsCrawler})(callback)
          }`,
          headers: {
            'userAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ...(headers || {}),
          },
          debug: isDebug,
          wait: 2000,
          timeout: 1000 * 30,
          callback: () => {}
        })
        resolve({
          source: data?.url,
        })
      }
    })
  }, [movieDetail, isDebug])

  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

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

  const renderDetailItem = ({ item }) => (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{item.label}</Text>
      <Text style={styles.detailValue}>{item.value.join(', ')}</Text>
    </View>
  );

  const renderPlayItem = ({ item }) => {
    const itemUrlObj = new URLParse(`${item.url}`);
    const hisUrlObj = new URLParse(`${historyInfo?.playUrl}`);
    const hisBtn = itemUrlObj.pathname === hisUrlObj.pathname;
    const loading = hisBtn && playLoading;
    return (
      <TouchableOpacity 
      style={[
        styles.playItem,
        tw`gap-[8px]`,
        hisBtn ? tw`bg-red-300` : undefined
      ]} 
      disabled={loading}
      onPress={() => {
        dispatch(
          setHistoryData({
            url: url,
            playUrl: item.url,
            time: Date.now(),
          }),
        );
        getPlayUrl(item.url, true)
      }}>
        <Text style={styles.playText}>{item.name}</Text>
        {
          loading ? 
          <View
            style={tw`justify-center items-center gap-[8px] flex-row`}
          >
            <ActivityIndicator animating={true} color={MD2Colors.red800} />
            <Text style={tw`text-[${MD2Colors.red800}]`}>加载视频中...</Text>
          </View>
          : undefined
        }
      </TouchableOpacity>
    )
  };


  useEffect(() => {
    getData();
  }, [])

  return <View style={{
    flex: 1,
    flexDirection: 'column'
  }}>
    <Appbar.Header
      mode="small"
      style={{
        height: 50
      }}
    >
      <Appbar.BackAction onPress={() => {
        navigation.goBack();
      }} />
      <Appbar.Content titleStyle={{fontSize: 18,}} title={params?.name} />
    </Appbar.Header>
    <View style={tw`flex-1`}>
      <View style={tw`h-0 flex-grow`}>
        <ScrollView style={tw`flex-grow`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing} // 刷新状态
              onRefresh={getData} // 下拉刷新时触发的函数
              colors={['#ff0000']} // iOS & Android刷新图标的颜色
              tintColor="#ff0000" // 仅限iOS
              title="正在刷新..." // 仅限iOS
              titleColor="#ff0000" // 仅限iOS
            />
          }
        >
          <View style={tw`p-[16px]`}>
            {/* 封面图和标题 */}
            <Image source={{ uri: movieDetail.img }} style={styles.movieImage} />
            <Text style={styles.movieTitle}>{movieDetail.name}</Text>

            {/* 评分 */}
            <Text style={styles.rating}>评分: {movieDetail.rating}</Text>
            {
              jssdk.AdBanner ? <jssdk.AdBanner /> : undefined
            }
            {/* 详细信息 */}
            <FlatList
              data={movieDetail.moviedteail_list}
              renderItem={renderDetailItem}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.detailList}
            />

            {/* 电影简介 */}
            <Text style={styles.context}>{movieDetail.yp_context}</Text>
          </View>
        </ScrollView>
      </View>
      {/* 底部播放按钮 */}
      <TouchableOpacity style={[
        styles.playButton,
        tw`pb-[${bottom}px]`
      ]} onPress={handleOpenBottomSheet}>
        <Text style={styles.playButtonText}>选择播放列表</Text>
      </TouchableOpacity>
    </View>
    {/* Bottom Sheet for playlist */}
    <BottomSheet
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      ref={bottomSheetRef}
      index={-1}  // initial state is hidden
      snapPoints={snapPoints}
    >
      <View style={[
        styles.bottomSheetContent,
        tw`pb-[${bottom}px]`
      ]}>
        <Text style={styles.sheetHeader}>播放列表：</Text>
        <FlatList
          data={movieDetail.playList}
          renderItem={renderPlayItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.playlist}
        />
      </View>
    </BottomSheet>
  </View>;
}

export default App;

const styles = StyleSheet.create({
  container: {
    flexGrow: 2,
    backgroundColor: '#fff',
  },
  movieImage: {
    width: '100%',
    height: 400,
    borderRadius: 10,
  },
  movieTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  rating: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  detailList: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  detailLabel: {
    fontWeight: 'bold',
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
  },
  playButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
  },
  sheetHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  playItem: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 5,
  },
  playText: {
    color: '#007bff',
    textAlign: 'center',
  },
  context: {
    fontSize: 16,
    marginVertical: 20,
    lineHeight: 24,
  },
});

