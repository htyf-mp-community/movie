import { BottomTabBarButtonProps, BottomTabBarProps, createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import React, { useEffect, useMemo, useRef } from 'react'
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useColorScheme, useWindowDimensions } from 'react-native'
import Icon, { Icons } from './components/Icons';
import Colors from './Colors';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '@react-navigation/native';
import { BlurView } from '@react-native-community/blur'

import * as routerConf from '@/pages';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabItem {
  route: string;
  label: string;
  type: keyof typeof Icons;
  icon: string;
  component: React.ComponentType<any>;
}

const TabArr: TabItem[] = [
  { route: 'Tab_Home', label: '首页', type: 'Ionicons', icon: 'home', component: routerConf.Home },
  { route: 'Tab_Course', label: '分类', type: 'Ionicons', icon: 'grid', component: routerConf.List },
];

const Tab = createBottomTabNavigator();

interface CustomTabButtonProps extends Omit<BottomTabBarButtonProps, 'children'> {
  item: TabItem;
}

const TabButton = (props: CustomTabButtonProps) => {
  const { item, onPress, accessibilityState } = props;
  const focused = accessibilityState?.selected;
  const isDarkMode = useColorScheme() === 'dark';
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tabButton}>
      <View style={styles.tabButtonContent}>
        <Icon
          size={24}
          type={Icons[item.type]}
          name={item.icon}
          color={focused ? '#E50914' : '#808080'}
        />
        <Text style={[
          styles.tabLabel,
          { color: focused ? '#E50914' : '#808080' }
        ]}>
          {item.label}
        </Text>
      </View>
      {focused && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  )
}

export default function NetflixTab() {
  const insets = useSafeAreaInsets()
  const size = useWindowDimensions()
  const tabHeight = 60;

  return (
    <Tab.Navigator
      initialRouteName='Tab_Home'
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <BlurView
              blurType="dark"
              blurAmount={20}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        )
      }}
      tabBar={(props) => (
        <View
          style={[
            styles.tabBarContainer,
            {
              height: tabHeight,
              bottom: Math.max(insets.bottom, 0),
            }
          ]}
        >
          <View style={styles.tabBarContent}>
            {props.state.routes.map((route, index) => {
              const { options } = props.descriptors[route.key];
              const isFocused = props.state.index === index;
              const item = TabArr[index];

              return (
                <TabButton
                  key={route.key}
                  item={item}
                  onPress={() => props.navigation.navigate(route.name)}
                  accessibilityState={{ selected: isFocused }}
                />
              );
            })}
          </View>
        </View>
      )}
    >
      {TabArr.map((item, index) => (
        <Tab.Screen
          key={index}
          name={item.route}
          component={item.component}
          options={{
            tabBarShowLabel: true,
          }}
        />
      ))}
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    height: 60,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E50914',
  },
})