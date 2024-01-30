const path = require('path')
const pkg = require('../package.json');

const config = {
  projectName: 'mini-apps-template',
  date: '2023-4-23',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {
    /**
     * app 版本号
     */
    __APP_DEFINE_VERSION__: `"${pkg.version}"`,
    /**
     * app 打包时间
     */
    __APP_DEFINE_BUILD_TIME__:`"${new Date().getTime()}"`,
  },
  copy: {
    patterns: [
      { from: 'public/', to: 'dist/' },
      // { from: 'dgz/build/outputs/app.json', to: 'dist/' },
      // { from: 'dgz/build/outputs/dist.zip', to: 'dist/' },
    ],
    options: {
    }
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    // https://github.com/NervJS/taro/issues/13271
    prebundle: {
      enable: false,
    },
  },
  cache: {
    enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {

        }
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          maxRootSize: 1024,
        },
      },
      autoprefixer: {
        enable: true,
        config: {
        }
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    // fix https://github.com/NervJS/taro/issues/13674
    webpackChain(chain, webpack) {
      chain.merge({
        module: {
          rule: {
            myloader: {
              test: /\.js$/,
              use: [
                {
                  loader: 'babel-loader',
                  options: {},
                },
              ],
            },
          },
        },
      });
    },
  },
  rn: {
    appName: 'apps',
    postcss: {
      cssModules: {
        url: {
          enable: true,
          config: {
            limit: 1024 * 1000 // 设定转换尺寸上限
          }
        },
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  alias: {
    '@': path.resolve(__dirname, '..', 'src')
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
