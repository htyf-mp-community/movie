import React from 'react';
import { Image, Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { i18n } from '../../i18n';
import { imgAssets, theme } from '../utils';
import { RootStackParamList } from './types';

import { WebScreen } from './WebScreen';
import { HomeScreen } from './HomeScreen';
import { LibraryScreen } from './LibraryScreen';
import { VideoListScreen } from './VideoListScreen';
import { VideoPlayScreen } from './VideoPlayScreen';
import { VideoDetailScreen } from './VideoDetailScreen';
import { VideoCategoryScreen } from './VideoCategoryScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

export const Screen = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="HomeTabs"
        screenOptions={{
          header: () => null,
          contentStyle: {
            backgroundColor: theme.blackA()
          }
        }}
      >
        {(!Platform.isTV && Platform.OS !== 'web') ?
          <Stack.Screen name="HomeTabs" component={Tabs} />
          :
          <Stack.Screen name="Home" component={HomeScreen} />
        }
        <Stack.Screen name="Category" component={VideoCategoryScreen} />
        <Stack.Screen name="List" component={VideoListScreen} />
        <Stack.Screen name="Detail" component={VideoDetailScreen} />
        <Stack.Screen name="Play" component={VideoPlayScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => null,
        tabBarStyle: {
          backgroundColor: theme.blackA()
        },
        tabBarLabel: ({ children, focused }) => {
          return <Text style={{ color: focused ? theme.whiteA() : theme.grayA() }}>
            {i18n.t(children.toLowerCase())}
          </Text>
        },
        tabBarIcon: ({ focused }) => {
          if (route.name === 'Home') {
            return (
              <Image
                style={{ height: 24 }}
                resizeMode='contain'
                source={focused ? imgAssets.homeFill : imgAssets.homeLine} />
            )
          }
          if (route.name === 'Web') {
            return (
              <Text style={{ fontSize: 20 }}>🌐</Text>
            )
          }
          return (
            <Image
              style={{ height: 24 }}
              resizeMode='contain'
              source={focused ? imgAssets.libraryFill : imgAssets.libraryLine} />
          )
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Web" component={WebScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
    </Tab.Navigator>
  );
}