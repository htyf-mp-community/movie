import App from '@tarojs/rn-supporter/entry-file.js'
import { AppRegistry, View, Text } from 'react-native'
import { name as appName } from './app.json'
import { MiniAppsEnginesProvider } from '@htyf-mp/engines'
import SplashScreen from 'react-native-splash-screen';
SplashScreen.hide()
const Root = () => {
  return <MiniAppsEnginesProvider>
    <App />
  </MiniAppsEnginesProvider>
}

AppRegistry.registerComponent(appName, () => Root)
