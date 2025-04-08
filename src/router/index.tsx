import React, { useMemo } from 'react';
import { CardStyleInterpolators, createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import lodash from 'lodash';
import type { ComponentType } from 'react';

import * as routerConf from '@/pages';
import MainBottomTab from './bottomTab';

// 导出所有页面配置
export const allPages = routerConf;

// 获取所有路由名称
export const routers = lodash.compact(Object.keys(allPages)) as Array<keyof routerConf.RootStackParamList>;

// 创建根导航器
export const RootStack = createStackNavigator<routerConf.RootStackParamList>();

// 默认导航选项
const defaultScreenOptions: StackNavigationOptions = {
  headerShown: false,
};

// 页面组件类型
type PageComponent = ComponentType<any>;

/**
 * 创建路由组件
 * @returns 路由组件
 */
export default function createRouter(): ComponentType {
  /**
   * 路由组件
   * 管理应用的路由导航
   */
  function Router() {
    /**
     * 生成页面路由配置
     */
    const pages = useMemo(() => {
      return routers.map((name) => {
        const PageComponent = lodash.get(routerConf, name) as PageComponent | undefined;
        
        if (!PageComponent) {
          console.warn(`页面组件 ${name} 未找到`);
          return null;
        }

        return (
          <RootStack.Screen
            key={name}
            name={name}
            component={PageComponent}
            options={{
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
          />
        );
      });
    }, []);

    return (
      <RootStack.Navigator
        initialRouteName="MainBottomTab"
        screenOptions={defaultScreenOptions}
      >
        <RootStack.Screen
          name="MainBottomTab"
          component={MainBottomTab}
        />
        {pages}
      </RootStack.Navigator>
    );
  }

  return Router;
}

