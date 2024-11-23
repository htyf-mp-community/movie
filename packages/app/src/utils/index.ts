import URLParse from 'url-parse';

export * from './asset'
export * from './theme'

export const encodedVideoUri = (source: string, headers?: {}) => {
  const __headers__ = encodeURI(JSON.stringify({
    // ...(item.headers || {}),
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
      'Origin': headers?.Host || `${headers?.origin}`,
  }));
  const sourceObj = URLParse(source, true);
  sourceObj.set('query', {
      ...sourceObj.query,
      __headers__: __headers__,
  })
}

export const decodeVideoUri = (url: string) => {
  const _u = URLParse(url, true);
  const _u2 = URLParse(url, true);
  delete _u.query['__headers__']
  _u.set('query', {
    ..._u.query,
  })
  const __headers__ = _u2?.query?.__headers__;
  const headers = __headers__ ? JSON.parse(decodeURI(__headers__)) : {};
  return {
    url: _u.toString(),
    headers: headers,
  }
}