import React, { useMemo } from 'react';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import lodash from 'lodash';

import * as routerConf from '@/pages';
import MainBottomTab from './bottomTab';

export const allPages = routerConf;
export const routers = lodash.compact(Object.keys(allPages));

export const RootStack = createStackNavigator<routerConf.RootStackParamList>();

export default function createRouter(): React.ComponentType<any> {
  function Router() {
    const pages = useMemo(() => {
      return routers.map((name: string) => {
        const PageComponent = lodash.get(routerConf, name, undefined) as any;
        if (PageComponent === undefined) {
          return undefined;
        }
        return (
          <RootStack.Screen
            key={name}
            name={`${name}` as any}
            component={PageComponent}
            options={{
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
          />
        );
      })
    }, [routers])
    return (
      <RootStack.Navigator
        initialRouteName={'MainBottomTab'}
        screenOptions={{
          headerShown: false,
        }}>
        <RootStack.Screen
          name={`MainBottomTab`}
          component={MainBottomTab}
        />
        {pages}
      </RootStack.Navigator>
    );
  }

  return Router;
}

