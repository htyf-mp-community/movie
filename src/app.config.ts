import { snakeCase } from 'lodash';
import { routes, entryPath, indexPath } from './routes';

const mixinConfig: {
  pages: string[];
  subPackages: { root: string; pages: string[] }[];
  entryPagePath: string;
} = {
  pages: [],
  subPackages: [],
  entryPagePath: entryPath.slice(1),
};

for (const key in routes) {
  if (routes.hasOwnProperty(key)) {
    if (key === 'pages') {
      for (const pageskey in routes.pages) {
        const path = routes.pages[pageskey];
        if (indexPath === path) mixinConfig.pages.unshift(path.slice(1));
        else mixinConfig.pages.push(path.slice(1));
      }
    } else {
      const root = snakeCase(key);
      mixinConfig.subPackages.push({
        root,
        pages: Object.values(routes[key]).map((v: string) => v.replace(`/${root}/`, '')),
      });
    }
  }
}

export default defineAppConfig({
  ...mixinConfig,
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F7F9FF',
  },
  tabBar: {
    custom: false,
    color: '#757FA1',
    selectedColor: '#4172F5',
    backgroundColor: '#1b1b1b',
    list: [
      {
        pagePath: routes.pages.home.slice(1),
        selectedIconPath: './assets/tabbar/tabbar_home_on.png',
        iconPath: './assets/tabbar/tabbar_home.png',
        text: '首页',
      },
      {
        pagePath: routes.pages.type.slice(1),
        selectedIconPath: './assets/tabbar/tabbar_explore_on.png',
        iconPath: './assets/tabbar/tabbar_explore.png',
        text: '分类',
      },
      // {
      //   pagePath: routes.pages.setting.slice(1),
      //   selectedIconPath: './assets/tabbar/tabbar_me_on.png',
      //   iconPath: './assets/tabbar/tabbar_me.png',
      //   text: '我的',
      // },
    ],
  },
});
