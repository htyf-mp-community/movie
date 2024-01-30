import { navigate } from "@/_UIHOOKS_"
import { View, Image, Text } from "@tarojs/components"
import './index.scss'

const Item = (props) => {
  const {item = {}} = props
  return <View
  key={item.url}
  className='component-item-item-wrap'
  onClick={() => {
    navigate.navigateTo({
      url: navigate.routes.pages.downlist,
      query: {
        url: encodeURIComponent(item.url)
      }
    })
  }}
>
  <View className='component-item-item-img-wrap'>
    <Image className='component-item-item-img' src={item.img}/>
    <View 
      className='component-item-item-info-left-top-tags-wrap'
    >
      {
        item?.hdinfo?.map(i => {
          return  <View
            key={i}
          className='component-item-item-tags-wrap'
        >
          <Text className='component-item-item-tags-text'>{i}</Text>
        </View>
        })
      }
    </View>
    <View 
      className='component-item-item-info-right-bottom-tags-wrap'
    >
      {
        item?.jidi?.map(i => {
          return  <View
            key={i}
          className='component-item-item-tags-wrap'
        >
          <Text className='component-item-item-tags-text'>{i}</Text>
        </View>
        })
      }
    </View>
  </View>
  {
    !props.hideTitle && <View className='component-item-item-info-wrap'>
      <View className='component-item-item-name-wrap'>
        <Text numberOfLines={1} className='component-item-item-name'>
          {item.name?.replace(/[\n\s]/g, '') || '---'}
        </Text>
      </View>
      <View className='component-item-item-sub-wrap'>
        <Text numberOfLines={1} className='component-item-item-sub'>
          {item.inzhuy || '---'}
        </Text>
      </View>
    </View>
  }
</View>
}

export default Item