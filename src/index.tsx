import React, { memo } from 'react'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { UIProvider } from '@/hooks'

import createRouter from './router'

const RootStack = createStackNavigator();

const router = createRouter();

function RootFix(props: any) {
  return <RootStack.Navigator
    initialRouteName={'MainScreen'}
    screenOptions={{
      headerShown: false,
      presentation: 'modal',
    }}>
    <RootStack.Screen
      name={'MainScreen'}
      component={router}
      options={{
        cardStyleInterpolator:
          CardStyleInterpolators.forVerticalIOS,
      }}
    />
  </RootStack.Navigator>
}


const MiniApp = () => {
  return (
    <NavigationContainer>
      <UIProvider>
        <RootFix />
      </UIProvider>
    </NavigationContainer>
  );
};


export default memo(MiniApp);

