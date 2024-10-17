import { BottomTabBarButtonProps, BottomTabBarProps, createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import React, { useEffect, useMemo, useRef } from 'react'
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useColorScheme, useWindowDimensions } from 'react-native'
import Icon, { Icons } from './components/Icons';
import Colors from './Colors';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '@react-navigation/native';
import {BlurView} from '@react-native-community/blur'

import * as routerConf from '@/pages';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabArr = [
  { route: 'Tab_Home', label: '首页', type: Icons.Ionicons, icon: 'rocket', component: routerConf.Home },
  { route: 'Tab_Course', label: '分类', type: Icons.Ionicons, icon: 'library', component: routerConf.List },
];

const Tab = createBottomTabNavigator();

const animate1 = { 0: { scale: .5, translateY: 7 }, .92: { translateY: -34 }, 1: { scale: 1, translateY: -24 } }
const animate2 = { 0: { scale: 1, translateY: -24 }, 1: { scale: 0.8, translateY: 7 } }

const circle1 = { 0: { scale: 0 }, 0.3: { scale: .9 }, 0.5: { scale: .2 }, 0.8: { scale: .7 }, 1: { scale: 1 } }
const circle2 = { 0: { scale: 1 }, 1: { scale: 0 } }

const TabButton = (props: BottomTabBarButtonProps) => {
  const { item, onPress, accessibilityState } = props;
  const focused = accessibilityState?.selected;
  const viewRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const textRef = useRef<any>(null);
  const isDarkMode = useColorScheme() === 'dark';

  const { colors } = useTheme()
  // const color = isDarkMode ? Colors.white : Colors.black;
  const color = Colors.black;
  const bgColor = colors.background;

  useEffect(() => {
    if (focused) {
      viewRef.current?.animate(animate1);
      circleRef.current?.animate(circle1);
      textRef.current?.transitionTo({ scale: 1 });
    } else {
      viewRef.current?.animate(animate2);
      circleRef.current?.animate(circle2);
      textRef.current?.transitionTo({ scale: 0 });
    }
  }, [focused])

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={styles.container}>
      <Animatable.View
        ref={viewRef}
        duration={600}
        useNativeDriver
        style={styles.container}>
        <View style={[styles.btn, { borderColor: bgColor, backgroundColor: bgColor }]}>
          <Animatable.View
            ref={circleRef}
            duration={600}
            useNativeDriver
            style={styles.circle} />
          <Icon size={35} type={item.type} name={item.icon} color={focused ? Colors.white : Colors.primary} />
        </View>
        <Animatable.Text
          ref={textRef}
          duration={600}
          useNativeDriver
          style={[styles.text, { color }]}>
          {item.label}
        </Animatable.Text>
      </Animatable.View>
    </TouchableOpacity>
  )
}

export default function AnimTab1() {
  const insets = useSafeAreaInsets()
  const size = useWindowDimensions()
  const tabHeight = 70;
  return (
    <Tab.Navigator
      initialRouteName='Tab_Home'
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => {
          return <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: tabHeight,
              borderRadius: 16,
              overflow: 'hidden'
          }}>
            <BlurView
              blurType="xlight"
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        }
      }}
      tabBar={(props) => {
        return <View 
          pointerEvents="box-none"
          style={{
            ...styles.tabBarWrap,
            height: tabHeight,
            bottom: Math.max(insets.bottom + 10, 40),
          }}
        >
          <View style={{
            height: tabHeight,
            width: Math.min(size.width - 32, 400),
          }}>
            <BottomTabBar {...props} />
          </View>
        </View>
      }}
    >
      {TabArr.map((item, index) => {
        return (
          <Tab.Screen key={index} name={item.route} component={item.component}
            options={{
              tabBarShowLabel: false,
              tabBarButton: (props) => <TabButton {...props} item={item} />
            }}
          />
        )
      })}
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
  },
  tabBarWrap: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    zIndex: 2,
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    paddingHorizontal: 16,
    backgroundColor: 'transparent'
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 99999,
    borderWidth: 4,
    borderColor: Colors.white,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  circle: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 25,
  },
  text: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
    color: Colors.primary,
    fontWeight: '500'
  }
})