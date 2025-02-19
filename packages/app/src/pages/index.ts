export {default as Home} from './Home';
export {default as Details} from './Details';
export {default as List} from './List';
export {default as Search} from './Search';

export type RootStackParamList = {
  MainBottomTab: undefined;
  /** 首页 */
  Home: undefined;
  /** 列表 */
  Details: {
    name?: string;
    /** 默认选中tab */
    url?: string;
  };
  /** 搜索 */
  Search: undefined;
  /** 小程序源管理 */
  List: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}