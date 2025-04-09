import URLParse from 'url-parse';
import jssdk from '@htyf-mp/js-sdk';
import type { TVideoProvider, TVideo, TVideoURL } from '../types';
import jsCrawler from './index.umd.string';
import { Alert } from 'react-native';

const host = "https://www.czzy77.com/"

// 视频项接口
interface VideoItem {
  href: string;
  img: string;
  title: string;
  status: string;
}

// 视频源接口
interface VideoSource {
  href: string;
  ep: string;
}

// 视频播放信息接口
interface VideoPlayInfo {
  url: string;
  headers: Record<string, string>;
}

// 视频详情接口
interface VideoDetail {
  [key: string]: VideoSource[];
}

// 搜索结果接口
interface SearchResult {
  page: number;
  list: VideoItem[];
}

// 首页视频列表接口
interface HomeVideoList {
  href: string;
  title: string;
  videos: VideoItem[];
}

/**
 * WebView 授权检查接口
 */
interface WebViewAuthResponse {
  items?: any[];
  [key: string]: any;
}

/**
 * 首页数据响应接口
 */
interface HomeDataResponse {
  items?: Array<{
    url: string;
    img: string;
    name: string;
  }>;
  [key: string]: any;
}

/**
 * 检查 WebView 是否已授权
 * 通过访问首页并检查返回数据来判断授权状态
 * @returns Promise<boolean> - 返回授权状态，true 表示已授权，false 表示未授权
 */
export const checkWebViewAuth = async (): Promise<boolean> => {
  const tryAuth = async (debug: boolean): Promise<boolean> => {
    try {
      const url = `${host}`;
      const data: boolean = await jssdk.puppeteer({
        url,
        jscode: `function(callback) {
          try {
            
            const isDebug = Boolean(${debug ? 'true' : 'false'})
            
            // 检查是否已存在样式标签
            const existingStyle = document.querySelector('style[data-custom-background]');
            if (!existingStyle) {
              const style = document.createElement('style');
              style.setAttribute('data-custom-background', '');
              style.textContent = 'body.custom-background { opacity: 0; }';
              document.head.appendChild(style);
            }
            
            document.body.style.opacity = isDebug ? '1' : '0'
            const isCloudflare = /Cloudflare/gi.test(document.body.innerHTML)
            if (isCloudflare) {
              console.log('检测到 Cloudflare 验证页面')
              if (!isDebug) {
                callback(undefined, false)
              } else {
                // alert('检测到 Cloudflare 验证页面' + window.location.href)
              }
            }
            
            const items = Array.from(document.querySelectorAll('li'))
            if (items.length > 0) {
              console.log('授权检查成功，找到视频列表')
              callback(undefined, true)
            }
          } catch (error) {
            console.error('授权检查发生错误:', error)
            callback(undefined, false)
          }
        }`,
        debug,
        wait: 100,
        timeout: 1000 * 60 * 3,
        callback: () => {},
      });
      return !!data;
    } catch (error) {
      console.error('WebView 授权检查失败:', error);
      return false;
    }
  };
  // 第一次尝试，debug=true
  const firstAttempt = await tryAuth(false);
  
  // 如果第一次失败，等待一段时间后再次尝试
  if (!firstAttempt) {
    console.log('第一次授权检查失败，等待 0.5 秒后重试...');
    await new Promise(resolve => setTimeout(resolve, 500));
    return await tryAuth(true);
  }
  
  return firstAttempt;
};


/**
 * 获取视频搜索结果
 * @param keyword - 搜索关键词
 * @param page - 页码，默认为1
 * @returns 搜索结果，包含视频列表和页码信息
 */
export const getVideoSearchResult: TVideoProvider['getVideoSearchResult'] = async (
  keyword: string,
  page: number = 1
) => {
  try {
    const isAuth = await checkWebViewAuth();
    if (!isAuth) {
      throw new Error('WebView 未授权，无法获取首页数据');
    }
    const url = `${host}daoyongjiekoshibushiy0ubing?q=${encodeURIComponent(keyword)}&f=_all&p=${page}`;
    const data = await jssdk.puppeteer({
      url,
      jscode: `function(callback) {
        try {
          function getMovieList() {
            const movieList = [];
            const movieItems = document.querySelectorAll('.search_list li');

            movieItems.forEach(item => {
              const movie = {
                title: item.querySelector('.dytit a').textContent,
                link: item.querySelector('.dytit a').href,
                image: item.querySelector('img').src,
                actors: item.querySelector('.inzhuy').textContent.replace('主演：', '')
              };
              movieList.push(movie);
            });

            return movieList;
          }

          // 获取分页信息
          function getPaginationInfo() {
            const pagination = {
              currentPage: 1,
              totalPages: 0,
              pages: []
            };

            const paginationLinks = document.querySelectorAll('.pagenavi_txt a');

            paginationLinks.forEach(link => {
              if (link.classList.contains('current')) {
                pagination.currentPage = parseInt(link.textContent);
              } else {
                const pageNum = parseInt(link.textContent);
                pagination.pages.push({
                  number: pageNum,
                  url: link.href
                });
              }
            });

            // 获取总页数
            pagination.totalPages = Math.max(...pagination.pages.map(p => p.number), pagination.currentPage);

            return pagination;
          }

          // 使用示例
          const movies = getMovieList();
          const pagination = getPaginationInfo();
          if (movies.length) {
            callback(undefined, {
              pagination,
              list: movies,
            });
          }
        } catch (error) {
          alert(error);
          callback(error, undefined);
        }
      }`,
      debug: false,
      wait: 2000,
      timeout: 1000 * 10,
      callback: () => {},
    });


    return data;
  } catch (error) {
    console.error('搜索视频失败:', error);
    return {
      page,
      list: [],
    };
  }
};

/**
 * 获取首页视频列表
 * 首先检查 WebView 授权状态，然后获取首页视频数据
 * @returns Promise<HomeVideoList[]> - 返回首页视频列表数据
 * @throws Error - 当未授权或获取数据失败时抛出错误
 */
export const getHomeVideoList: TVideoProvider['getHomeVideoList'] = async () => {
  try {
    // 检查授权状态
    const isAuth = await checkWebViewAuth();
    if (!isAuth) {
      throw new Error('WebView 未授权，无法获取首页数据');
    }

    const funStr = `function(callback) {
      try {
        // 用于存储已处理的URL，避免重复
        const processedUrls = new Set();
        
        const movieList = Array.from(document.querySelectorAll('li'))
          .filter((item) => {
              const link = item.querySelector('a');
              return link && /\\/movie\\/.*\\.html$/i.test(link.href) && item.textContent;
          })
          .map((item) => {
              const link = item.querySelector('a');
              const img = item.querySelector('img')?.getAttribute('data-original');
              const title = item.querySelector('.dytit')?.textContent?.replace(/[\\n\\s]/g, '') || '';
              const rating = item.querySelector('.rating')?.textContent?.replace(/[\\n\\s]/g, '') || '';
              const status = item.querySelector('.inzhuy')?.textContent?.replace(/[\\n\\s]/g, '') || '';
              const hdInfo = Array.from(item.querySelectorAll('.hdinfo span')).map(span => 
                  span?.textContent?.replace(/[\\n\\s]/g, '') || ''
              );
              const jidi = Array.from(item.querySelectorAll('.jidi span')).map(span => 
                  span?.textContent?.replace(/[\\n\\s]/g, '') || ''
              );
    
              return {
                  title: title,
                  url: link?.href || '',
                  img: img || '',
                  rating: rating,
                  status: status,
                  hdInfo: hdInfo,
                  jidi: jidi
              };
          })
          .filter(item => {
              // 过滤掉没有图片的电影
              if (!item.img) return false;
              
              // 检查URL是否已经处理过
              if (processedUrls.has(item.url)) {
                  return false;
              }
              
              // 将URL添加到已处理集合中
              processedUrls.add(item.url);
              return true;
          });
    
        callback(undefined, {
          items: movieList,
        });
      } catch (error) {
        alert(error);
        callback(undefined, {
          items: [],
        });
      }
    }`;
    // 获取首页数据
    const data: HomeDataResponse = await jssdk.puppeteer({
      url: `${host}`,
      jscode: `${funStr}`,
      debug: false,
      wait: 2000,
      timeout: 1000 * 10,
      callback: () => {},
    });

    // 处理返回数据
    const videos: VideoItem[] = Array.isArray(data?.items) 
      ? data.items.map((item) => ({
          href: item.url,
          img: item.img,
          title: item.title,
          status: '',
        }))
      : [];

    return [{
      href: '',
      title: '热门',
      videos,
    }];
  } catch (error) {
    console.error('获取首页视频列表失败:', error);
    // 返回空列表而不是抛出错误，保持接口稳定性
    return [{
      href: '',
      title: '热门',
      videos: [],
    }];
  }
};

/**
 * 获取视频分类列表
 * @returns 视频分类列表数据
 */
export const getVideoCategory: TVideoProvider['getVideoSearchResult'] = async (url?: string) => {
  try {
    const isAuth = await checkWebViewAuth();
    if (!isAuth) {
      throw new Error('WebView 未授权，无法获取首页数据');
    }
    const data = await jssdk.puppeteer({
      url: url || `${host}/movie_bt`,
      jscode: `function(callback) {
        try {
          // 获取所有分类信息
          function getCategories() {
            // 初始化默认返回值
            const defaultCategories = {
              year: {
                label: '年份',
                items: [],
                selected: null
              },
              tags: {
                label: '影片类型',
                items: [],
                selected: null
              },
              series: {
                label: '分类',
                items: [],
                selected: null
              }
            };

            try {
              // 获取年份分类
              const yearElements = document.querySelectorAll('#beautiful-taxonomy-filters-tax-movie_bt_year .catmi');
              if (yearElements && yearElements.length > 0) {
                yearElements.forEach(element => {
                  try {
                    const slug = element.getAttribute('slug') || '';
                    const text = element.textContent || '';
                    const isSelected = element.classList.contains('selected-att');
                    const url = element.getAttribute('cat-url') || '';

                    defaultCategories.year.items.push({
                      slug,
                      text,
                      url
                    });

                    if (isSelected) {
                      defaultCategories.year.selected = {
                        slug,
                        text,
                        url
                      };
                    }
                  } catch (e) {
                    console.warn('处理年份分类项时出错:', e);
                  }
                });
              }

              // 获取影片类型分类
              const tagsElements = document.querySelectorAll('#beautiful-taxonomy-filters-tax-movie_bt_tags .catmi');
              if (tagsElements && tagsElements.length > 0) {
                tagsElements.forEach(element => {
                  try {
                    const slug = element.getAttribute('slug') || '';
                    const text = element.textContent || '';
                    const isSelected = element.classList.contains('selected-att');
                    const url = element.getAttribute('cat-url') || '';

                    defaultCategories.tags.items.push({
                      slug,
                      text,
                      url
                    });

                    if (isSelected) {
                      defaultCategories.tags.selected = {
                        slug,
                        text,
                        url
                      };
                    }
                  } catch (e) {
                    console.warn('处理影片类型分类项时出错:', e);
                  }
                });
              }

              // 获取分类
              const seriesElements = document.querySelectorAll('#beautiful-taxonomy-filters-tax-movie_bt_series .catmi');
              if (seriesElements && seriesElements.length > 0) {
                seriesElements.forEach(element => {
                  try {
                    const slug = element.getAttribute('slug') || '';
                    const text = element.textContent || '';
                    const isSelected = element.classList.contains('selected-att');
                    const url = element.getAttribute('cat-url') || '';

                    defaultCategories.series.items.push({
                      slug,
                      text,
                      url
                    });

                    if (isSelected) {
                      defaultCategories.series.selected = {
                        slug,
                        text,
                        url
                      };
                    }
                  } catch (e) {
                    console.warn('处理分类项时出错:', e);
                  }
                });
              }

              return defaultCategories;
            } catch (error) {
              console.error('获取分类信息时发生错误:', error);
              return defaultCategories;
            }
          }

          // 获取所有电影信息
          function getMovieInfo() {
              try {
                  const movies = [];
                  const movieElements = document.querySelectorAll('.bt_img.mi_ne_kd.mrb ul li');
                  
                  if (!movieElements || movieElements.length === 0) {
                      console.warn('未找到电影列表元素');
                      return movies;
                  }
                  
                  movieElements.forEach(movie => {
                      try {
                          const titleElement = movie.querySelector('.dytit a');
                          const ratingElement = movie.querySelector('.rating');
                          const actorsElement = movie.querySelector('.inzhuy');
                          const typeElement = movie.querySelector('.furk');
                          const episodesElement = movie.querySelector('.jidi span');
                          const imageElement = movie.querySelector('.thumb.lazy');
                          
                          const movieInfo = {
                              title: titleElement?.textContent?.trim() || '未知标题',
                              rating: ratingElement?.textContent?.trim() || '暂无评分',
                              actors: actorsElement?.textContent?.replace('主演：', '')?.trim() || '未知演员',
                              type: typeElement?.textContent?.trim() || '未知类型',
                              episodes: episodesElement?.textContent?.trim() || '未知集数',
                              url: titleElement?.href || '',
                              image: imageElement?.getAttribute('data-original') || ''
                          };
                          
                          // 只添加有效数据的电影
                          if (movieInfo.title && movieInfo.url) {
                              movies.push(movieInfo);
                          }
                      } catch (itemError) {
                          console.error('处理单个电影项时出错:', itemError);
                          // 继续处理下一个电影项
                      }
                  });
                  
                  return movies;
              } catch (error) {
                  console.error('获取电影信息时出错:', error);
                  return [];
              }
          }

          // 获取分页信息
          function getPaginationInfo() {
              try {
                  const pagination = {
                      currentPage: 1,
                      totalPages: 1,
                      pages: []
                  };
                  
                  const paginationElement = document.querySelector('.pagenavi_txt');
                  if (!paginationElement) {
                      console.warn('未找到分页元素');
                      return pagination;
                  }
                  
                  const links = paginationElement.querySelectorAll('a');
                  if (!links || links.length === 0) {
                      console.warn('未找到分页链接');
                      return pagination;
                  }
                  
                  links.forEach(link => {
                      try {
                          const pageText = link.textContent?.trim();
                          if (!pageText) return;
                          
                          const pageNum = parseInt(pageText);
                          if (!isNaN(pageNum)) {
                              const pageInfo = {
                                  number: pageNum,
                                  url: link.href || '',
                                  isCurrent: link.classList.contains('current')
                              };
                              
                              pagination.pages.push(pageInfo);
                              
                              if (pageInfo.isCurrent) {
                                  pagination.currentPage = pageNum;
                              }
                          }
                      } catch (linkError) {
                          console.error('处理分页链接时出错:', linkError);
                          // 继续处理下一个链接
                      }
                  });
                  
                  // 计算总页数
                  if (pagination.pages.length > 0) {
                      pagination.totalPages = Math.max(...pagination.pages.map(p => p.number));
                  }
                  
                  return pagination;
              } catch (error) {
                  console.error('获取分页信息时出错:', error);
                  return {
                      currentPage: 1,
                      totalPages: 1,
                      pages: []
                  };
              }
          }

          // 使用示例
          const movies = getMovieInfo();
          const pagination = getPaginationInfo();
          const categories = getCategories();
          console.log('电影信息：', movies);
          console.log('分页信息：', pagination);
          if (movies.length) {
            callback(undefined, {
              categories,
              pagination,
              list: movies,
            });
          }
        } catch (error) {
          alert(error);
          callback(error, undefined);
        }
      }`,
      debug: false,
      wait: 2000,
      timeout: 1000 * 10,
      callback: () => {},
    });


    return data;
  } catch (error) {
    console.error('搜索视频失败:', error);
    throw error;
  }
};

/**
 * 获取视频详情和播放源
 * @param path - 视频路径
 * @returns Promise<VideoDetail> - 返回视频详情信息，包含播放源列表
 * @throws Error - 当获取数据失败时抛出错误
 */
export const getVideoSources: TVideoProvider['getVideoSources'] = async (path: string) => {
  try {
    // 检查授权状态
    const isAuth = await checkWebViewAuth();
    if (!isAuth) {
      throw new Error('WebView 未授权，无法获取首页数据');
    }
    const urlObj = new URLParse(path, true);
    const data: TVideo = await jssdk.puppeteer({
      url: urlObj.set('origin', host?.replace(/\/$/gi, '')).toString(),
      jscode: `function(callback) {
        try {
          const movie = {
            href: window.location.href,
            // 基本信息
            title: document.querySelector('.dy_tit_big')?.textContent?.split('|')[0]?.trim() || '',
            year: document.querySelector('.dy_tit_big span')?.textContent?.trim() || '',
            cover: document.querySelector('.dyimg img')?.src || '',
            
            // 详细信息
            details: {
              type: Array.from(document.querySelectorAll('.moviedteail_list li') || []).find(li => li?.textContent?.includes('类型'))?.querySelector('a')?.textContent || '',
              region: Array.from(document.querySelectorAll('.moviedteail_list li') || []).find(li => li?.textContent?.includes('地区'))?.querySelector('a')?.textContent || '',
              year: Array.from(document.querySelectorAll('.moviedteail_list li') || []).find(li => li?.textContent?.includes('年份'))?.querySelector('a')?.textContent || '',
              alias: Array.from(Array.from(document.querySelectorAll('.moviedteail_list li') || []).find(li => li?.textContent?.includes('又名'))?.querySelectorAll('a') || []).map(a => a?.textContent || '').filter(Boolean) || [],
              releaseDate: Array.from(document.querySelectorAll('.moviedteail_list li') || []).find(li => li?.textContent?.includes('上映'))?.querySelector('span')?.textContent || '',
              director: Array.from(Array.from(document.querySelectorAll('.moviedteail_list li') || []).find(li => li?.textContent?.includes('导演'))?.querySelectorAll('span') || []).map(span => span?.textContent || '').filter(Boolean) || [],
              writer: Array.from(Array.from(document.querySelectorAll('.moviedteail_list li') || []).find(li => li?.textContent?.includes('编剧'))?.querySelectorAll('span') || []).map(span => span?.textContent || '').filter(Boolean) || [],
              actors: Array.from(Array.from(document.querySelectorAll('.moviedteail_list li') || []).find(li => li?.textContent?.includes('主演'))?.querySelectorAll('span') || []).map(span => span?.textContent || '').filter(Boolean) || [],
              language: Array.from(document.querySelectorAll('.moviedteail_list li') || []).find(li => li?.textContent?.includes('语言'))?.querySelector('span')?.textContent || ''
            },
            
            // 剧情简介
            description: document.querySelector('.yp_context')?.textContent?.trim() || '',
            
            // 播放列表
            playList: Array.from(document.querySelectorAll('.paly_list_btn a') || []).map(a => ({
              title: a?.textContent || '',
              url: a?.href || ''
            })).filter(item => item.title && item.url)
          };
          if (movie.playList.length) {
            callback(undefined, movie);
          } else {
            callback(undefined, movie);
          }
        } catch (error) {
          alert(error);
          callback(error, undefined);
        }
      }`,
      debug: false,
      wait: 2000,
      timeout: 1000 * 30,
      callback: () => {},
    });
    return data;
  } catch (error) {
    console.error('获取视频详情失败:', error);
    throw error;
  }
};

/**
 * 视频播放信息接口
 */
interface VideoPlaybackInfo {
  isIframe: boolean;
  url: string;
  headers: {
    referer: string;
    origin: string;
    host: string;
    cookie?: string;
  };
}

/**
 * 获取视频播放地址
 * @description 通过 puppeteer 获取视频播放地址，支持直接播放和 iframe 嵌套播放两种情况
 * @param path - 视频页面路径
 * @returns Promise<TVideoURL> - 返回视频播放信息，包含播放地址和必要的请求头
 * @throws Error - 当 WebView 未授权或无法获取播放地址时抛出错误
 */
export const getVideoUrl: TVideoProvider['getVideoUrl'] = async (path: string): Promise<TVideoURL> => {
  try {
    // 检查授权状态
    const isAuth = await checkWebViewAuth();
    if (!isAuth) {
      throw new Error('WebView 未授权，无法获取视频数据');
    }

    // 构建完整的 URL
    const urlObj = new URLParse(path, true);
    const fullUrl = urlObj.set('origin', host?.replace(/\/$/gi, '')).toString();

    // 提取视频信息的 JavaScript 代码
    const extractVideoInfoCode = `function(callback) {
      try {
        const getVideoInfo = () => {
          const iframe = document.querySelector('iframe');
          if (iframe?.src) {
            return {
              isIframe: true,
              url: iframe.src,
              headers: {
                referer: window.location.href,
                origin: window.location.origin,
                host: window.location.host,
                cookie: document.cookie
              }
            };
          }

          const videoNode = document.querySelector('video');
          const videoUrl = videoNode?.getAttribute('src') || videoNode?.querySelector('source')?.src;
          if (videoUrl) {
            return {
              isIframe: false,
              url: videoUrl,
              headers: {
                referer: window.location.href,
                origin: window.location.origin,
                host: window.location.host,
                cookie: document.cookie
              }
            };
          }
          
          return null;
        };

        const videoInfo = getVideoInfo();
        if (videoInfo) {
          callback(undefined, videoInfo);
        } else {
          callback(new Error('未找到视频元素'), undefined);
        }
      } catch (error) {
        callback(error, undefined);
      }
    }`;

    const headers = {
      'Accept': '*/*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Range': 'bytes=0-',
      'Sec-Fetch-Dest': 'video',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-Storage-Access': 'active',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
    };

    // 获取视频信息
    const data = await jssdk.puppeteer({
      url: fullUrl,
      jscode: extractVideoInfoCode,
      debug: false,
      wait: 2000,
      timeout: 1000 * 30,
      callback: () => {},
    }) as VideoPlaybackInfo;

    if (!data?.url) {
      throw new Error('无法获取视频播放地址');
    }

    // 处理直接播放的情况
    if (!data.isIframe) {
      const videoInfo = {
        url: data.url,
        headers: {
          ...headers,
          host: URLParse(host, true).host || '',
        },
      }
      return videoInfo;
    }

    // 处理 iframe 播放的情况
    const iframeData = await jssdk.puppeteer({
      url: data.url,
      jscode: extractVideoInfoCode,
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        referer: data.headers.referer,
        'sec-fetch-dest': 'iframe',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'cross-site',
      },
      debug: false,
      wait: 2000,
      timeout: 1000 * 30,
      callback: () => {},
    }) as VideoPlaybackInfo;

    if (!iframeData?.url) {
      throw new Error('无法获取 iframe 中的视频播放地址');
    }
    const videoInfo = {
      url: iframeData.url,
      headers: {
        ...headers,
        'Host': URLParse(iframeData.url, true).host || '',
      },
    };
    return videoInfo;

  } catch (error) {
    console.error('获取视频播放地址失败:', error);
    throw error;
  }
};