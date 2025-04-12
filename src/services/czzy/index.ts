import URLParse from 'url-parse';
import jssdk from '@htyf-mp/js-sdk';
import type { TVideoProvider, TVideo, TVideoURL, SearchResult, CategoryResponse } from '../types';

// 常量定义
const HOST = "https://www.czzy77.com/";
const DEFAULT_TIMEOUT = 1000 * 30; // 30秒
const DEFAULT_WAIT = 2000; // 2秒

interface VideoPlaybackInfo {
  isIframe: boolean;
  url: string;
  headers: Record<string, string>;
}

/**
 * 检查 WebView 是否已授权
 * 通过访问首页并检查返回数据来判断授权状态
 * 使用双重检查机制，第一次快速检查，失败后等待重试
 * 
 * @returns Promise<boolean> - 返回授权状态，true 表示已授权，false 表示未授权
 */
export const checkWebViewAuth = async (): Promise<boolean> => {
  /**
   * 尝试进行授权检查
   * @param debug - 是否启用调试模式
   * @returns Promise<boolean> - 授权检查结果
   */
  const tryAuth = async (debug: boolean): Promise<boolean> => {
    try {
      const url = HOST;
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

  // 第一次快速检查
  const firstAttempt = await tryAuth(__DEV__ ? true : false);
  
  // 如果第一次失败，等待后重试
  if (!firstAttempt) {
    console.log('第一次授权检查失败，等待 0.5 秒后重试...');
    await new Promise(resolve => setTimeout(resolve, 500));
    return await tryAuth(true);
  }
  
  return firstAttempt;
};

/**
 * 获取视频搜索结果
 * 通过 puppeteer 获取视频搜索结果，支持分页
 * 
 * @param keyword - 搜索关键词
 * @param page - 页码，默认为1
 * @returns Promise<SearchResult> - 返回搜索结果和分页信息
 * @throws Error - 当未授权或获取数据失败时抛出错误
 */
export const getVideoSearchResult: TVideoProvider['getVideoSearchResult'] = async (
  keyword: string,
  page: number = 1
): Promise<SearchResult> => {
  try {
    // 检查授权状态
    const isAuth = await checkWebViewAuth();
    if (!isAuth) {
      throw new Error('WebView 未授权，无法获取首页数据');
    }

    // 构建搜索 URL
    const url = `${HOST}daoyongjiekoshibushiy0ubing?q=${encodeURIComponent(keyword)}`;
    // 使用 puppeteer 获取搜索结果
    const data = await jssdk.puppeteer({
      url,
      jscode: `function(callback) {
        try {
          /**
           * 获取电影列表
           * @returns {TVideo[]} 电影列表
           */
          function getMovieList() {
            try {
              var movieList = [];
              var movieItems = document.querySelectorAll('.search_list li');

              movieItems.forEach(function(item) {
                try {
                  var titleElement = item.querySelector('.dytit a');
                  var imageElement = item.querySelector('img');
                  var actorsElement = item.querySelector('.inzhuy');

                  if (!titleElement || !imageElement || !actorsElement) {
                    console.warn('电影项缺少必要元素');
                    return;
                  }

                  var href = titleElement.getAttribute('href');
                  var title = titleElement.textContent ? titleElement.textContent.trim() : '';
                  var cover = imageElement.getAttribute('src');
                  var actorsText = actorsElement.textContent ? actorsElement.textContent.replace('主演：', '').trim() : '';

                  if (!href || !title || !cover) {
                    console.warn('电影项数据不完整');
                    return;
                  }

                  movieList.push({
                    href: href,
                    title: title,
                    year: '',
                    cover: cover,
                    details: {
                      type: '',
                      region: '',
                      year: '',
                      alias: [],
                      releaseDate: '',
                      director: [],
                      writer: [],
                      actors: actorsText ? actorsText.split(',').map(function(actor) { return actor.trim(); }) : [],
                      language: ''
                    },
                    description: '',
                    playList: []
                  });
                } catch (itemError) {
                  console.warn('处理单个电影项时出错:', itemError);
                }
              });

              return movieList;
            } catch (error) {
              console.error('获取电影列表时出错:', error);
              return [];
            }
          }

          function getPaginationInfo() {
            try {
              var pagination = {
                currentPage: 1,
                totalPages: 0,
                pages: []
              };

              var paginationLinks = document.querySelectorAll('.pagenavi_txt a');

              paginationLinks.forEach(function(link) {
                try {
                  var pageText = link.textContent ? link.textContent.trim() : '';
                  if (!pageText) {
                    console.warn('分页链接文本为空');
                    return;
                  }

                  var pageNum = parseInt(pageText);
                  if (isNaN(pageNum)) {
                    console.warn('分页链接文本不是有效数字:', pageText);
                    return;
                  }

                  var href = link.getAttribute('href');
                  if (!href) {
                    console.warn('分页链接缺少href属性');
                    return;
                  }

                  if (link.classList.contains('current')) {
                    pagination.currentPage = pageNum;
                  } else {
                    pagination.pages.push({
                      number: pageNum,
                      url: href,
                      isCurrent: false
                    });
                  }
                } catch (linkError) {
                  console.warn('处理分页链接时出错:', linkError);
                }
              });

              // 计算总页数
              pagination.totalPages = Math.max.apply(null, 
                pagination.pages.map(function(p) { return p.number; }).concat([pagination.currentPage])
              );

              return pagination;
            } catch (error) {
              console.error('获取分页信息时出错:', error);
              return {
                currentPage: 1,
                totalPages: 0,
                pages: []
              };
            }
          }

          // 获取数据
          var movies = getMovieList();
          var pagination = getPaginationInfo();

          if (movies.length > 0) {
            callback(undefined, {
              pagination: pagination,
              list: movies,
            });
          } else {
            console.warn('未找到搜索结果');
            callback(new Error('未找到搜索结果'), undefined);
          }
        } catch (error) {
          console.error('获取搜索结果时出错:', error);
          callback(error, undefined);
        }
      }`,
      debug: false,
      wait: DEFAULT_WAIT,
      timeout: DEFAULT_TIMEOUT,
      callback: () => {},
    });

    return data;
  } catch (error) {
    console.error('搜索视频失败:', error);
    return {
      pagination: {
        currentPage: page,
        totalPages: 0,
        pages: []
      },
      list: []
    };
  }
};

/**
 * 获取首页视频列表
 * 首先检查 WebView 授权状态，然后获取首页视频数据
 * @returns Promise<TVideo[]> - 返回首页视频列表数据
 * @throws Error - 当未授权或获取数据失败时抛出错误
 */
export const getHomeVideoList: TVideoProvider['getHomeVideoList'] = async (): Promise<TVideo[]> => {
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
                  href: link?.href || '',
                  title: title,
                  year: '',
                  cover: img || '',
                  rating: rating,
                  details: {
                      type: '',
                      region: '',
                      year: '',
                      alias: [],
                      releaseDate: '',
                      director: [],
                      writer: [],
                      actors: status.split(',').map(actor => actor.trim()),
                      language: ''
                  },
                  description: '',
                  playList: []
              };
          })
          .filter(item => {
              // 过滤掉没有图片的电影
              if (!item.cover) return false;
              
              // 检查URL是否已经处理过
              if (processedUrls.has(item.href)) {
                  return false;
              }
              
              // 将URL添加到已处理集合中
              processedUrls.add(item.href);
              return true;
          });
    
        callback(undefined, movieList);
      } catch (error) {
        alert(error);
        callback(undefined, []);
      }
    }`;

    // 获取首页数据
    const data: TVideo[] = await jssdk.puppeteer({
      url: `${HOST}`,
      jscode: `${funStr}`,
      debug: false,
      wait: 2000,
      timeout: 1000 * 10,
      callback: () => {},
    });

    return data;
  } catch (error) {
    console.error('获取首页视频列表失败:', error);
    // 返回空数组而不是抛出错误，保持接口稳定性
    return [];
  }
};

/**
 * 获取视频分类列表
 * @param url - 分类URL
 * @returns Promise<CategoryResponse> - 返回分类列表数据
 */
export const getVideoCategory: TVideoProvider['getVideoCategory'] = async (url?: string): Promise<CategoryResponse> => {
  try {
    const isAuth = await checkWebViewAuth();
    if (!isAuth) {
      throw new Error('WebView 未授权，无法获取首页数据');
    }
    const data = await jssdk.puppeteer({
      url: url || `${HOST}/movie_bt`,
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
                              href: titleElement?.href || '',
                              title: titleElement?.textContent?.trim() || '未知标题',
                              year: '',
                              cover: imageElement?.getAttribute('data-original') || '',
                              details: {
                                  type: typeElement?.textContent?.trim() || '未知类型',
                                  region: '',
                                  year: '',
                                  alias: [],
                                  releaseDate: '',
                                  director: [],
                                  writer: [],
                                  actors: actorsElement?.textContent?.replace('主演：', '')?.trim().split(',') || [],
                                  language: ''
                              },
                              description: '',
                              playList: []
                          };
                          
                          // 只添加有效数据的电影
                          if (movieInfo.title && movieInfo.href) {
                              movies.push(movieInfo);
                          }
                      } catch (itemError) {
                          console.error('处理单个电影项时出错:', itemError);
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
 * 通过 puppeteer 获取视频详情信息，包含播放源列表
 * 优化了数据提取和错误处理
 * 
 * @param path - 视频路径
 * @returns Promise<TVideo> - 返回视频详情信息，包含播放源列表
 * @throws Error - 当获取数据失败时抛出错误
 */
export const getVideoSources: TVideoProvider['getVideoSources'] = async (path: string): Promise<TVideo> => {
  try {
    // 检查授权状态
    const isAuth = await checkWebViewAuth();
    if (!isAuth) {
      throw new Error('WebView 未授权，无法获取首页数据');
    }

    // 构建完整的 URL
    const urlObj = new URLParse(path, true);
    const fullUrl = urlObj.set('origin', HOST?.replace(/\/$/gi, '')).toString();

    // 使用 puppeteer 获取视频详情
    const data: TVideo = await jssdk.puppeteer({
      url: fullUrl,
      jscode: `function(callback) {
        try {
          /**
           * 获取电影详情信息
           * @returns {TVideo} 电影详情
           */
          const getMovieInfo = () => {
            // 基本信息
            const titleElement = document.querySelector('.dy_tit_big');
            const yearElement = document.querySelector('.dy_tit_big span');
            const coverElement = document.querySelector('.dyimg img');
            
            // 详细信息
            const details = {
              type: '',
              region: '',
              year: '',
              alias: [],
              releaseDate: '',
              director: [],
              writer: [],
              actors: [],
              language: ''
            };

            // 提取详细信息
            const detailItems = document.querySelectorAll('.moviedteail_list li');
            detailItems.forEach(item => {
              const text = item.textContent?.trim() || '';
              const value = item.querySelector('span, a')?.textContent?.trim() || '';
              
              if (text.includes('类型')) {
                details.type = value;
              } else if (text.includes('地区')) {
                details.region = value;
              } else if (text.includes('年份')) {
                details.year = value;
              } else if (text.includes('又名')) {
                details.alias = Array.from(item.querySelectorAll('a'))
                  .map(a => a.textContent?.trim() || '')
                  .filter(Boolean);
              } else if (text.includes('上映')) {
                details.releaseDate = value;
              } else if (text.includes('导演')) {
                details.director = Array.from(item.querySelectorAll('span'))
                  .map(span => span.textContent?.trim() || '')
                  .filter(Boolean);
              } else if (text.includes('编剧')) {
                details.writer = Array.from(item.querySelectorAll('span'))
                  .map(span => span.textContent?.trim() || '')
                  .filter(Boolean);
              } else if (text.includes('主演')) {
                details.actors = Array.from(item.querySelectorAll('span'))
                  .map(span => span.textContent?.trim() || '')
                  .filter(Boolean);
              } else if (text.includes('语言')) {
                details.language = value;
              }
            });

            // 获取播放列表
            const playList = Array.from(document.querySelectorAll('.paly_list_btn a'))
              .map(a => ({
                title: a.textContent?.trim() || '',
                url: a.href || ''
              }))
              .filter(item => item.title && item.url);

            return {
              href: window.location.href,
              title: titleElement?.textContent?.split('|')[0]?.trim() || '',
              year: yearElement?.textContent?.trim() || '',
              cover: coverElement?.src || '',
              details,
              description: document.querySelector('.yp_context')?.textContent?.trim() || '',
              playList
            };
          };

          // 使用 MutationObserver 监听 DOM 变化
          const observer = new MutationObserver(() => {
            const movie = getMovieInfo();
            if (movie.playList.length > 0) {
              observer.disconnect();
              callback(undefined, movie);
            }
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true
          });

          // 初始检查
          const initialMovie = getMovieInfo();
          if (initialMovie.playList.length > 0) {
            observer.disconnect();
            callback(undefined, initialMovie);
          }
        } catch (error) {
          console.error('获取视频详情时出错:', error);
          callback(error, undefined);
        }
      }`,
      debug: false,
      wait: DEFAULT_WAIT,
      timeout: DEFAULT_TIMEOUT,
      callback: () => {},
    });

    return data;
  } catch (error) {
    console.error('获取视频详情失败:', error);
    throw error;
  }
};

/**
 * 获取视频播放地址
 * 通过 puppeteer 获取视频播放地址，支持直接播放和 iframe 嵌套播放两种情况
 * 优化了错误处理和重试机制
 * 
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
    const fullUrl = urlObj.set('origin', HOST?.replace(/\/$/gi, '')).toString();

    // 提取视频信息的 JavaScript 代码
    const extractVideoInfoCode = `function(callback) {
      try {
        /**
         * 获取视频信息
         * @returns {VideoPlaybackInfo | null} 视频播放信息
         */
        const getVideoInfo = () => {
          // 检查 iframe
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

          // 检查 video 标签
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

        // 使用 MutationObserver 监听 DOM 变化
        const observer = new MutationObserver(() => {
          const videoInfo = getVideoInfo();
          if (videoInfo) {
            observer.disconnect();
            callback(undefined, videoInfo);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        // 初始检查
        const initialVideoInfo = getVideoInfo();
        if (initialVideoInfo) {
          observer.disconnect();
          callback(undefined, initialVideoInfo);
        }
      } catch (error) {
        console.error('获取视频信息时出错:', error);
        callback(error, undefined);
      }
    }`;

    // 通用请求头
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
      wait: DEFAULT_WAIT,
      timeout: DEFAULT_TIMEOUT,
      callback: () => {},
    }) as VideoPlaybackInfo;

    if (!data?.url) {
      throw new Error('无法获取视频播放地址');
    }

    // 处理直接播放的情况
    if (!data.isIframe) {
      return {
        url: data.url,
        headers: {
          ...headers,
          host: URLParse(HOST, true).host || '',
        },
      };
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
      wait: DEFAULT_WAIT,
      timeout: DEFAULT_TIMEOUT,
      callback: () => {},
    }) as VideoPlaybackInfo;

    if (!iframeData?.url) {
      throw new Error('无法获取 iframe 中的视频播放地址');
    }

    return {
      url: iframeData.url,
      headers: {
        ...headers,
        'Host': URLParse(iframeData.url, true).host || '',
      },
    };

  } catch (error) {
    console.error('获取视频播放地址失败:', error);
    throw error;
  }
};