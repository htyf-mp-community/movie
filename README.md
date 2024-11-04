## [红糖云服app下载 https://mp.dagouzhi.com/ ](https://mp.dagouzhi.com/)

### 使用红糖云服app 扫码添加小程序

[![小程序码](./qrcode.png)](https://share.dagouzhi.com/#/pages/index/index?data=%7B%22type%22%3A%22app%22%2C%22name%22%3A%22%E7%94%B5%E5%BD%B1%E5%9F%BA%E5%9C%B0%22%2C%22projectname%22%3A%22%E7%94%B5%E5%BD%B1%E5%9F%BA%E5%9C%B0%22%2C%22appid%22%3A%22movie_996%22%2C%22appUrlConfig%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2Fhtyf-mp-community%2Fmovie%2Fmain%2Fdgz%2Fbuild%2Foutputs%2Fapp.json%22%2C%22zipUrl%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2Fhtyf-mp-community%2Fmovie%2Fmain%2Fdgz%2Fbuild%2Foutputs%2Fdist.dgz%22%7D)

>更多小程序demo 请查看[https://github.com/htyf-mp-community/demo](https://github.com/htyf-mp-community/demo)

## 预览

| 首页  | 搜索 | 详情 | 播放 |
| ------------- | ------------- | ------------- | ------------- |
| ![小程序码](./docs/IMG_5063_.png)  | ![小程序码](./docs/IMG_5064_.png) | ![小程序码](./docs/IMG_5065_.png)  | ![小程序码](./docs/IMG_5066_.png)  |


## 开发步骤

### 1. 安装依赖,时入项目根目录

```shell
yarn
# ios
npm run ios
# android
npm run android
# H5
npm run dev:h5
# 微信小程序
npm run dev:weapp
# 红糖云小程序(选真机调试)
npm run dgz
```

### 2. 打包

> 打包其它小程序按 taro 官方文档打包

> 如打包红糖云服小程序

```
npm run build:dgz
```

### 3. 上传运行红糖云服小程序

> 把打包出来的根目录 dgz/build/outputs 目录上传自己的 oss/cos 上

```
{
  "type": "app",
  "name": "RN模版",
  "projectname": "RN模版",
  "appid": "__rn_temp_appid__",
  "appUrlConfig": "https://raw.githubusercontent.com/htyf-mp-community/htyf-mp/main/mini-apps-template-rn/dgz/build/outputs/app.json",
  "zipUrl": "https://raw.githubusercontent.com/htyf-mp-community/htyf-mp/main/mini-apps-template-rn/dgz/build/outputs/dist.dgz"
}
```

并将以上 json 生成二维码就可以用红糖云服 app 扫码加入小程序

## 投食

开发迭代不易，觉得 App 好用的，有能力的请投喂一下，也可以给个星星

| 微信  | 支付宝 |
| ------------- | ------------- |
| ![微信](./docs/IMG_5087.jpg)  | ![支付宝](./docs/IMG_5088.jpg) |