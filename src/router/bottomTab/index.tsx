import { BottomTabBarButtonProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon, { Icons } from './components/Icons';
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
  { route: 'Tab_Search', label: '搜索', type: 'Ionicons', icon: 'search', component: routerConf.Search },
];

const Tab = createBottomTabNavigator();

interface CustomTabButtonProps extends Omit<BottomTabBarButtonProps, 'children'> {
  item: TabItem;
}

const TabButton = (props: CustomTabButtonProps) => {
  const { item, onPress, accessibilityState } = props;
  const focused = accessibilityState?.selected;

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
    </TouchableOpacity>
  )
}

export default function NetflixTab() {
  const insets = useSafeAreaInsets()

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
        ),
      }}

    >
      {TabArr.map((item, index) => (
        <Tab.Screen
          key={index}
          name={item.route}
          component={item.component}
          options={{
            tabBarShowLabel: true,
            tabBarButton: (props) => (
              <TabButton {...props} item={item} />
            ),
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
    width: '100%',
    height: '100%',
  },
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
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