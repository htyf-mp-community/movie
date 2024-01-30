import Taro from '@tarojs/taro';
import { View, Text, Image, StandardProps } from '@tarojs/components'
import { useState, useEffect, ReactNode, useMemo } from 'react';
import classnames from 'classnames';
import { navigate, useNavigationBarInfo } from '@/_UIHOOKS_';
import './index.scss'
import searchIcon from '@/assets/search.png'

export interface HeaderProps extends StandardProps {
  title?: string,
  mode?: boolean,
  left?: Function | boolean;
  right?: ReactNode | boolean;
  backIcon?: 'black' | 'white'
  onBack?: () => void,
  titleStyle?: StandardProps['style']
}

export function Header(props: HeaderProps) {
  const { navigationContentHeight, statusBarHeight } = useNavigationBarInfo();
  return <View
    {...props}
    style={props.style}
    className={classnames('pages-index-header-wrap', props.className)}
  >
    <View
      style={{
        flexShrink: 0,
        width: '100%',
        height: statusBarHeight || 0,
      }}
    /> 
    <View
      className={classnames('pages-index-header-body')}
      style={navigationContentHeight ? {
        minHeight: navigationContentHeight
      } : {}}
    >
      {/* 标题内容容器 */}
      <View className={classnames('pages-index-header-body-center')}>
        <View className={classnames('pages-index-header-search-wrap')}
          onClick={() => {
            navigate.navigateTo({
              url: navigate.routes.pages.search
            })
          }}
        >
          <Image className='pages-index-header-search-icon' src={searchIcon} />
          <Text className={classnames('pages-index-header-search-text')}>电影名称/明星/导演/年份</Text>
        </View>
      </View>
      <View className={classnames('pages-index-header-body-right')}>

      </View>
    </View>
  </View>
}

export default Header;
