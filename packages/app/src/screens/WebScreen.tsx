import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { i18n } from '../../i18n';
import { theme } from '../utils';
import { Button } from '../components';
import { RootStackParamList } from './types';
import { useDownloadContext, useOrientation } from '../hooks';

const INJECTED_REQUEST_INSPECT = `
(function () {
  const originalXHR = window.XMLHttpRequest;
  function newXHR() {
      const xhr = new originalXHR();
      const open = xhr.open
      xhr.addEventListener('readystatechange', function() {
        if (xhr.readyState === 4) {
          window.ReactNativeWebView.postMessage(JSON.stringify({url: xhr.responseURL}));
        }
      })
      return xhr;
  }
  window.XMLHttpRequest = newXHR

  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    return originalFetch.apply(this, args).then(response => {
        response.clone().text().then(text => {
          window.ReactNativeWebView.postMessage(JSON.stringify({url: response.url}));
        });
        return response;
    });
  };
})()
`;

const INJECTED_VIDEO_IFRAME = `
(function () {
  const videos = new Set()
  document.querySelectorAll('video').forEach(v=> {

    if(v.src.includes('blob:')){
      return
    }

    if (v.src === undefined || v.src === '') {
      let sources = v.querySelectorAll('source');
      sources.forEach(source => {
        if(!videos.has(source.src)) {
          videos.add(source.src);
        }
      });
    } else {
      if(!videos.has(v.src)) {
        videos.add(v.src);
      }
    }
  })
  
  window.ReactNativeWebView.postMessage(JSON.stringify({ videos: [...videos] }));

  const iframes = new Set()
  document.querySelectorAll('iframe').forEach(i=> {
    if(iframes.has(i.src)) {
      return
    }

    iframes.add(i.src)
  })
  window.ReactNativeWebView.postMessage(JSON.stringify({ iframes: [...iframes] }));
})()
`
const HOME_URL = "https://www.google.com/"

type Props = NativeStackScreenProps<RootStackParamList, 'Web'>;

export const WebScreen = ({ }: Props) => {
  const { height } = useOrientation()
  const { actions: { addDownloads } } = useDownloadContext()

  const webViewRef = useRef<WebView>(null);

  const [key, setKey] = useState(0)
  const [url, setUrl] = useState(HOME_URL);
  const [currentUrl, setCurrentUrl] = useState(HOME_URL);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState(new Set<string>())
  const [iFrames, setIFrames] = useState([] as string[])
  const [showMenu, setShowMenu] = useState(false)

  const handleMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data) as {
      iframes?: string[]
      videos?: string[]
      url?: string
    };
    if (data.iframes) {
      setIFrames(data.iframes.filter(i =>
        i.toUpperCase() !== "ABOUT:BLANK" && i.toUpperCase() !== "JAVASCRIPT:FALSE" &&
        !i.toUpperCase().includes("DATA:TEXT/HTML") && i !== ""
      ))
    }

    if (data.videos) {
      data.videos.forEach((v: any) => {
        if (v == '') {
          return
        }
        links.add(v)
      })
      setLinks(new Set(links))
    }

    if (data.url) {
      const hasM3U8 = `${data.url}`.includes('.m3u8')
      if (hasM3U8) {
        links.add(data.url)
        setLinks(new Set(links))
      }
    }
  };

  const handleBackPress = () => {
    if (!webViewRef.current || !canGoBack) {
      return
    }
    webViewRef.current.stopLoading()
    webViewRef.current.goBack();
  };

  const handleForwardPress = () => {
    if (!webViewRef.current || !canGoForward) {
      return
    }
    webViewRef.current.stopLoading()
    webViewRef.current.goForward();
  };

  const handleNewPress = (u: string) => {
    setCurrentUrl(u);
    setUrl(u)
  }

  const handleHomePress = () => {
    setKey(new Date().getDate())
    if (webViewRef.current) {
      webViewRef.current.stopLoading()
      if (webViewRef.current.clearHistory) {
        webViewRef.current.clearHistory()
      }
    }
    handleNewPress(HOME_URL)
  };

  const handleRefreshPress = () => {
    if (webViewRef.current) {
      webViewRef.current.stopLoading()
      webViewRef.current.reload();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.blackA(), position: 'relative' }}>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 5,
          backgroundColor: theme.grayA(0.3),
        }}
      >
        <TextInput
          style={{
            textAlign: 'left',
            flex: 1,
            marginLeft: 5,
            marginRight: 5,
            padding: 10,
            marginVertical: 5,
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 5,
            color: theme.whiteA(),
            backgroundColor: theme.grayA(0.4),
            borderTopWidth: 0,
            borderBottomWidth: 0,
            borderRightWidth: 0,
            borderLeftWidth: 0,
            height: 40
          }}
          value={url}
          onChangeText={setUrl}
          onSubmitEditing={() => {
            if (url.startsWith('http') && url.includes('.')) {
              handleNewPress(url)
              return
            }

            if (url.includes('.') && !url.startsWith('http')) {
              handleNewPress(`https://${url}`)
              return
            }

            handleNewPress(`${HOME_URL}search?q=${url}`)
          }}
          selectTextOnFocus
          editable={true}
        />
        <ActivityIndicator
          size="small"
          color={loading ? theme.primary : theme.transparent}
        />
      </View>

      <WebView
        key={key}
        containerStyle={{ flex: 5 }}
        style={{ flex: 1 }}
        ref={webViewRef}
        source={{ uri: currentUrl }}
        userAgent='Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
        cacheEnabled={false}
        originWhitelist={["*"]}
        setSupportMultipleWindows={false}
        javaScriptCanOpenWindowsAutomatically={false}
        injectedJavaScript={INJECTED_REQUEST_INSPECT}
        injectedJavaScriptForMainFrameOnly={false}
        injectedJavaScriptBeforeContentLoaded={INJECTED_REQUEST_INSPECT}
        injectedJavaScriptBeforeContentLoadedForMainFrameOnly={false}
        onMessage={handleMessage}
        onLoadStart={(event) => {
          setLoading(true)
          setLinks(new Set())
          setIFrames([])
        }}
        onLoadEnd={() => {
          webViewRef.current?.injectJavaScript(INJECTED_VIDEO_IFRAME)
          setLoading(false)
        }}
        onNavigationStateChange={(event) => {
          if (event.loading) {
            setLoading(true)
          }
          if (event.url.replace(currentUrl, "").startsWith("#")) {
            return
          }
          setCanGoForward(event.canGoForward)
          setCanGoBack(event.canGoBack)
          setUrl(event.url)
        }}
        forceDarkOn
        allowsFullscreenVideo
        webviewDebuggingEnabled
        thirdPartyCookiesEnabled
        useWebView2
        incognito
      />


      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          height: 50,
          backgroundColor: theme.grayA(0.3),
          position: 'relative',
          overflow: 'visible'
        }}
      >
        <Button text={!canGoBack ? "⊘" : "◀"} onPress={handleBackPress} disabled={!canGoBack}
          touchStyle={{ flex: 1 }} textStyle={{ padding: 0 }} style={{ padding: 0 }}
        />
        <Button text={!canGoForward ? "⊘" : "▶"} onPress={handleForwardPress} disabled={!canGoForward}
          touchStyle={{ flex: 1 }} textStyle={{ padding: 0 }} style={{ padding: 0 }}
        />
        <Button text="⌂" onPress={handleHomePress}
          touchStyle={{ flex: 1 }} textStyle={{ padding: 0 }} style={{ padding: 0 }}
        />
        <Button text="↺" onPress={handleRefreshPress}
          touchStyle={{ flex: 1 }} textStyle={{ padding: 0 }} style={{ padding: 0 }}
        />
        <Button
          text={"☰"}
          touchStyle={{ flex: 1 }} textStyle={{ padding: 0 }} style={{ padding: 0 }}
          onPress={() => {
            setShowMenu(m => !m)
            if (!iFrames.length && !links.size) {
              webViewRef.current?.injectJavaScript(INJECTED_VIDEO_IFRAME)
            }
          }} />
      </View>

      {showMenu
        &&
        <ScrollView
          style={{
            bottom: 50, left: 0, right: 0,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            padding: 10,
            paddingTop: 0,
            height: height * 0.5,
            flex: 1,
            position: 'absolute',
            backgroundColor: theme.blackA(0.9),
            borderTopWidth: 3,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderTopColor: theme.whiteA(0.3),
            borderLeftColor: theme.whiteA(0.3),
            borderRightColor: theme.whiteA(0.3),
          }} >

          <View style={{ flex: 0, alignItems: 'center', justifyContent: 'center' }}>
            {
              iFrames.length === 0 && links.size === 0 &&
              <Text style={{ color: theme.whiteA(), fontSize: 16, marginTop: 20 }}>{i18n.t('noItemsFound')}</Text>
            }
            <Button
              touchStyle={{
                borderRadius: 10,
                marginTop: 15,
              }}
              textStyle={{ fontSize: 12 }}
              style={{
                borderRadius: 10,
                paddingVertical: 2,
                paddingHorizontal: 10,
                backgroundColor: theme.whiteA(0.2),
                flex: 0
              }}
              text={i18n.t('loadMedia')}
              onPress={() => {
                webViewRef.current?.injectJavaScript(INJECTED_VIDEO_IFRAME)
              }} />
          </View>

          {iFrames.length > 0 &&
            <>
              <Text style={{ color: theme.whiteA(), fontSize: 16 }}>IFrames</Text>
              {
                iFrames.map((i) => {
                  return (
                    <Button
                      touchStyle={{ marginBottom: 5 }}
                      textStyle={{ padding: 0, fontSize: 10 }}
                      style={{
                        borderRadius: 5,
                        paddingVertical: 10,
                        paddingHorizontal: 10,
                        flex: 0,
                        justifyContent: 'flex-start',
                        backgroundColor: theme.whiteA(0.2),
                      }}
                      key={i}
                      text={i}
                      onPress={() => {
                        setCurrentUrl(i)
                        setUrl(i)
                      }} />
                  )
                })
              }
            </>
          }

          {[...links].length > 0 &&
            <>
              <Text style={{ color: theme.whiteA(), fontSize: 16 }}>Videos</Text>
              {
                [...links].map((l, idx) => {
                  return (
                    <Button
                      touchStyle={{ marginBottom: 5 }}
                      textStyle={{ padding: 0, fontSize: 10 }}
                      style={{
                        borderRadius: 5,
                        paddingVertical: 10,
                        paddingHorizontal: 10,
                        flex: 0,
                        justifyContent: 'flex-start',
                        backgroundColor: theme.whiteA(0.2),
                      }}
                      key={l}
                      text={l}
                      onPress={() => {
                        addDownloads([{
                          webview: true,
                          ep: '',
                          href: l,
                          name: `${new Date().getTime()}-${idx + 1}`,
                          provider: ''
                        }])
                      }} />
                  )
                })
              }
            </>
          }
        </ScrollView>
      }
    </View>
  );
};
