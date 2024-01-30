import iconv from 'iconv-lite';

export default (utf8Str: string) => {
  return iconv.encode(utf8Str, 'gbk').reduce((pre, cur) => `${pre}%${cur.toString(16)}`, "").toLocaleUpperCase()
}