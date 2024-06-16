import EventEmitter from 'eventemitter2';
// @ts-ignore
import config from './config.json'
console.log(config)
export type Config = {

};

export declare type LaunchOptions = {
  onError?: (err: any) => void;
};

class SDK extends EventEmitter {
  host: string = '';
  conf: Config = {};

  constructor(config: Config) {
    super();
    this.conf = {
      ...this.conf,
      ...config,
    };
  }

  run() {
    const pathname = window.location.pathname;
    if (/^\/$/gi.test(pathname)) {
      return this.getHome();
    } else if (/^\/movie\/.*\.html$/gi.test(pathname)) {
      return this.getDetail();
    } else if (/^\/v_play\/.*\.html$/gi.test(pathname)) {
      return this.getPlayUrl();
    } else if (/^\/daoyongjiekoshibushiyoubing/gi.test(pathname)) {
      return this.getSearch();
    } else if (/^\/(movie_bt|dbtop250|zuixindianying|dongmanjuchangban|benyueremen|gcj|meijutt|hanjutv|fanju)/gi.test(pathname)) {
      return this.getType();
    } else {
      return this.getPlayUrl();
    }
  }

  init() {
    try {
      const a =document.querySelector('button');
      if (/验证/gi.test(a.innerText)) {
        // @ts-ignore
        const v = eval(`${document.querySelector('form').firstChild.data?.replace('=', '')}`)
        const input = document.querySelector('input');
        input.value = v
        a.click()
      }
    } catch (error) {
      
    }
    try {
      // 定义要替换的文本
      const targetText = window.location.host;
      const replacementText = '影视基地';

      // 遍历所有文本节点并进行替换
      function replaceText(node) {
          // 如果是文本节点，进行替换
          if (node.nodeType === Node.TEXT_NODE) {
              node.nodeValue = node.nodeValue.replace(new RegExp(targetText, 'g'), replacementText);
          } else {
              // 否则，遍历子节点进行替换
              for (let child of node.childNodes) {
                  replaceText(child);
              }
          }
      }

      // 从文档的body开始替换
      replaceText(document.body);
    } catch (error) {
      
    }

    try {
      document.querySelector('.header').remove()
      document.querySelector('.v-sort-nav').remove()
      document.querySelector('.footer').remove()
    } catch (error) {
      
    }
  }

  getHome() {
    this.init()
    try {
      var items = Array.from(document.querySelectorAll('li'))
      .filter(function(i) {
        const a = i.querySelector('a');
        return a && /\/movie\/.*\.html$/i.test(a.href) && i.innerText
      })
      .map(function(i) {
        const a = i.querySelector('a');
        const img = i.querySelector('img') && i.querySelector('img').getAttribute('data-original');
        const dytit = i.querySelector('.dytit') as HTMLElement;
        const inzhuy = i.querySelector('.inzhuy') as HTMLElement;
        const rating = i.querySelector('.rating') as HTMLElement;
        const hdinfo = i.querySelector('.hdinfo') as HTMLElement;
        const jidi = i.querySelector('.jidi') as HTMLElement;
        return {
          img: img,
          url: a.href,
          name: dytit?.innerText?.replace(/[\n\s]/g, ''),
          inzhuy: inzhuy?.innerText?.replace(/[\n\s]/g, ''),
          rating: rating?.innerText?.replace(/[\n\s]/g, ''),
          hdinfo: hdinfo ? Array.from(hdinfo?.querySelectorAll('span')).map(i => {
            return i?.innerText?.replace(/[\n\s]/g, '') || '';
          }) : [],
          jidi: jidi ? Array.from(jidi?.querySelectorAll('span')).map(i => {
            return i?.innerText?.replace(/[\n\s]/g, '') || '';
          }) : [],
        }
      }).filter(function(i) {
        return i.img
      })
      console.log(Array.from(document.querySelectorAll('a')), items)
      if (items.length) {
        return {
          time: new Date().toString(),
          items: items
        }
      }
    } catch (error) {
      
    }
  }

  getDetail() {
    this.init()
    try {
      var items = Array.from(document.querySelectorAll('a'))
      .filter(function(i) {
        return /\/v_play\/.*\.html$/i.test(i.href) && i.innerText
      })
      .map(function(i) {
        return {
          name: i.innerText,
          url: i.href,
        }
      })
      let moviedteail_tt = []
      let moviedteail_list = []
      let yp_context = '';
      try {
        const dom = document.querySelector('.moviedteail_tt') as HTMLElement;
        const h3 = dom.querySelector('h3').innerText?.replace(/[\n\s]/g, '');
        const span = dom.querySelector('span').innerText?.replace(/[\n\s]/g, '');
        if (h3) {
          moviedteail_tt.push(h3)
        }
        if (span) {
          moviedteail_tt.push(span)
        }
      } catch (error) {
        
      }
      try {
        const dom = document.querySelector('.moviedteail_list') as HTMLElement;
        const li = dom.querySelectorAll('li');
        if (li) {
          Array.from(li).map((i) => {
            let label = '';
            let value = []
            const a = i.querySelectorAll('a')
            if (i?.firstChild) {
              // @ts-ignore
              label = `${i?.firstChild?.data}`?.replace(/[\n\s]/g, '')
            }
            if (a) {
              Array.from(a).map(b => {
                value.push(b?.innerText?.replace(/[\n\s]/g, ''))
              })
            }
            const v = {
              label: label,
              value: value
            }
            if (v) {
              moviedteail_list.push(v)
            }
          })
        }
      } catch (error) {
        
      }
      try {
        const dom = document.querySelector('.yp_context') as HTMLElement;
        yp_context = dom?.innerText
      } catch (error) {
        
      }
      if (items.length) {
        return {
          time: new Date().toString(),
          playList: items,
          moviedteail_tt: moviedteail_tt,
          moviedteail_list: moviedteail_list,
          yp_context: yp_context,
        }
      }
    } catch (error) {
      
    }
  }

  getPlayUrl() {
    this.init()
    try {
      var videoNode = document.querySelector('video')
      var iframe = document.querySelector('iframe')
      var url = '';
      var isIframe = false;
      if (videoNode) {
        url = videoNode.getAttribute('src') || videoNode.querySelector('source').src;
        try {
          var _dncry_;
          var _dncry_string_;
          function isBase64(str) {
            const regex = /^[A-Za-z0-9+/]*={0,2}$/;
            return regex.test(str);
          }
          for (var key in window) {
            const element = window[key] as any;
            if (typeof element === 'function' && /dncry/gi.test(element.toString())) {
              _dncry_ = element
            }
            if (typeof element === 'string' && isBase64(element) && element.length > 150) {
              _dncry_string_ = element
            }
          }
          const videoString = _dncry_(_dncry_string_)
          var match = videoString.match(/url:\s*"([^"]+)"/i)
          if (match && match[1]) {
            url = match[1];
          }
        } catch (error) {
        
        }
      } else if (iframe) {
        isIframe = true;
        // var iframeDocument = iframeElement.contentDocument || iframeElement.contentWindow.document;
        // var videoNode = iframeDocument.querySelector('video')
        // url = videoNode.getAttribute('src') || videoNode.querySelector('source').src;
        url = iframe.src;
      }

      if (url) {
        return {
          time: new Date().toString(),
          // @ts-ignore
          name: document.querySelector('.jujiinfo h3')!?.innerText,
          isIframe: isIframe,
          url: url,
          cookie: document.cookie,
          userAgent: navigator.userAgent,
          referer: window.location.origin,
        }
      }
    } catch (error) {
        
    }
  }

  getSearch() {
    this.init()
    try {
      var items = Array.from(document.querySelectorAll('li'))
      .filter(function(i) {
        const a = i.querySelector('a');
        return a && /\/movie\/.*\.html$/i.test(a.href) && i.innerText
      })
      .map(function(i) {
        const a = i.querySelector('a');
        const img = i.querySelector('img') && i.querySelector('img').getAttribute('data-original');
        const dytit = i.querySelector('.dytit') as HTMLElement;
        const inzhuy = i.querySelector('.inzhuy') as HTMLElement;
        const rating = i.querySelector('.rating') as HTMLElement;
        const hdinfo = i.querySelector('.hdinfo') as HTMLElement;
        const jidi = i.querySelector('.jidi') as HTMLElement;
        return {
          img: img,
          url: a.href,
          name: dytit?.innerText?.replace(/[\n\s]/g, ''),
          author: '',
          inzhuy: inzhuy?.innerText?.replace(/[\n\s]/g, ''),
          rating: rating?.innerText?.replace(/[\n\s]/g, ''),
          hdinfo: hdinfo ? Array.from(hdinfo?.querySelectorAll('span')).map(i => {
            return i?.innerText?.replace(/[\n\s]/g, '') || '';
          }) : [],
          jidi: jidi ? Array.from(jidi?.querySelectorAll('span')).map(i => {
            return i?.innerText?.replace(/[\n\s]/g, '') || '';
          }) : [],
        }
      }).filter(function(i) {
        return i.img
      })
      console.log(Array.from(document.querySelectorAll('a')), items)
      if (items.length) {
        return {
          time: new Date().toString(),
          items: items
        }
      }
    } catch (error) {
        
    }
  }

  getType() {
    this.init()
    try {
      var items = Array.from(document.querySelectorAll('li'))
      .filter(function(i) {
        const a = i.querySelector('a');
        return a && /\/movie\/.*\.html$/i.test(a.href) && i.innerText
      })
      .map(function(i) {
        const a = i.querySelector('a');
        const img = i.querySelector('img') && i.querySelector('img').getAttribute('data-original');
        const dytit = i.querySelector('.dytit') as HTMLElement;
        const inzhuy = i.querySelector('.inzhuy') as HTMLElement;
        const rating = i.querySelector('.rating') as HTMLElement;
        const hdinfo = i.querySelector('.hdinfo') as HTMLElement;
        const jidi = i.querySelector('.jidi') as HTMLElement;
        return {
          img: img,
          url: a.href,
          name: dytit?.innerText?.replace(/[\n\s]/g, ''),
          author: '',
          inzhuy: inzhuy?.innerText?.replace(/[\n\s]/g, ''),
          rating: rating?.innerText?.replace(/[\n\s]/g, ''),
          hdinfo: hdinfo ? Array.from(hdinfo?.querySelectorAll('span')).map(i => {
            return i?.innerText?.replace(/[\n\s]/g, '') || '';
          }) : [],
          jidi: jidi ? Array.from(jidi?.querySelectorAll('span')).map(i => {
            return i?.innerText?.replace(/[\n\s]/g, '') || '';
          }) : [],
        }
      }).filter(function(i) {
        return i.img
      })
      console.log(Array.from(document.querySelectorAll('a')), items)
      if (items.length) {
        return {
          time: new Date().toString(),
          items: items
        }
      }
    } catch (error) {
        
    }
  }

}

export default (callback: (error: any, data: any) => void = console.log) => {
  const client = new SDK({})
  const data = client.run()
  if (data) {
    callback(undefined, data)
  }
  return data;
};
