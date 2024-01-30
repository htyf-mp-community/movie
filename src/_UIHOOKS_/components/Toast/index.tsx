import { View, Text, Image } from '@tarojs/components'
import classnames from 'classnames';
import './index.scss'
import AnimateWrap from './animate';

import { useEffect, useMemo } from 'react';
import Taro from '@tarojs/taro';

export type ToastProps = {
  open: boolean;
  mask?: boolean;
  wrapClassName?: string;
  className?: string;
  content?: string;
  afterClose?: () => void;
  onCancel?: () => void;
  onOk?: () => void;
}
export default function Toast(props: ToastProps) {
  const { open, content } = props;
  // console.log(showPrompt());
  useEffect(() => {
    console.log(open)
    if (open) {
      // Taro.hideTabBar({ animation: false })
    } else {
      // Taro.showTabBar({ animation: false })
    }
    return () => {
      // Taro.showTabBar({ animation: false })
    }
  }, [open])
  if (!open) {
    return undefined;
  }

  return (
    <View pointerEvents="none" className={classnames('uihooks-components-toast-interview-container', props.wrapClassName)} style={{ display: open ? 'block' : 'none' }}>
      <View className='uihooks-components-toast-operation-box-wrap'>
        <AnimateWrap>
          <View className={classnames('uihooks-components-toast-operation-box', props.className)}>
            <Text className={classnames('uihooks-components-toast-content-text')}>{content || 'loading...'}</Text>
          </View>
        </AnimateWrap>
      </View>
    </View>
  )
}
