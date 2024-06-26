export type pagesRouterConfig = {
  '/pages/index/index': {
    data: string;
  };
  '/pages/404/index': {};
};

export const routes = {
  pages: {
    // 全局相关 start
    home: '/pages/home/index',
    auth: '/pages/auth/index',
    404: '/pages/404/index',
    downlist: '/pages/downlist/index',
    search: '/pages/search/index',
    setting: '/pages/setting/index',
    type: '/pages/type/index',
  },
};
/**
 * 第一页
 */
export const indexPath = routes.pages.home;
/**
 * 启动路径（首页）
 */
export const entryPath = routes.pages.home;

export default routes;
