import { Button, View, Text } from '@tarojs/components'
import './index.scss';
import { UIProvider, navigate } from '@/_UIHOOKS_';
import { Header } from '@/_UIHOOKS_/components';

function Index() {
  return (
    <View className='__global_pages_404_wrap__'>
      <Header title='404' />
      <View className='__global_pages_404_wrap_body_wrap__'>
        <View className='__global_pages_404_wrap_body_wrap_404__'>
          <View className='__global_pages_404_wrap_body_wrap_404_image_wrap__'>
            {/* <Image className="__global_pages_404_wrap_body_wrap_404_image__" src={icon} /> */}
          </View>
          <View>
            <Text className="__global_pages_404_wrap_body_wrap_404_text__">糟糕，加载错误</Text>
          </View>
          <Button 
            type="primary"
            onClick={() => {
              navigate.backToHome();
            }}
          >
            返回首页
          </Button>
        </View>
      </View>
    </View>
  )
}

export default () => <UIProvider><Index/></UIProvider>