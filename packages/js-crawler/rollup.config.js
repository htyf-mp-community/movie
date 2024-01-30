import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import merge from 'lodash.merge';
import path from 'path';
import babel from 'rollup-plugin-babel';
import builtins from 'rollup-plugin-node-builtins';
import { uglify } from 'rollup-plugin-uglify';
import json from '@rollup/plugin-json';
import pkg from './package.json';
import md5 from 'md5';
const isWatch = process.env.ROLLUP_WATCH === "true";
const extensions = ['.js', '.ts'];
const pathResolve = function (...args) {
  return path.resolve(__dirname, ...args);
};
// 打包任务的个性化配置
const jobs = {
  esm: {
    output: {
      format: 'esm',
      file: pathResolve(pkg.module),
    },
  },
  umd: {
    output: {
      format: 'umd',
      file: pathResolve(pkg.main),
    },
  },
  min: {
    output: {
      format: 'umd',
      file: pathResolve(pkg.main.replace(/(.\w+)$/, '.min$1')),
    },
    plugins: [uglify()],
  },
};

// 从环境变量获取打包特征
const mergeConfig = jobs[process.env.NODE_ENV || 'esm'];

export default merge(
  {
    input: './src/index.ts',
    output: {
      file: './lib/index.js',
      format: 'umd',
      name: `__${md5(`${pkg.name}_${pkg.version}`)}__`,
    },
    plugins: [
      replace({
        values: {
          __SDK_NAME__: `"${pkg.name}"`,
          __SDK_VERSION__: `"${pkg.version}"`,
        },
        preventAssignment: true,
      }),
      builtins(),
      resolve({
        extensions,
        // modulesOnly: true,
      }),
      typescript({
        tsconfig: './tsconfig.json',
      }),
      babel({
        exclude: 'node_modules/**',
        extensions,
      }),
      commonjs({}),
      json(),
    ],
  },
  mergeConfig,
);
