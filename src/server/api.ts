import jsCrawler, { host } from '@/utils/js-crawler';
import jssdk, { RequestOptions } from '@htyf-mp/js-sdk';

export async function auth() {
  const query = { name: '我', page: 1 };
  let data = await getSearch(query);
  if (!data) {
    data = await getSearch(query, {
      debug: true,
      timeout: 1000 * 60 * 3,
    });
  }
  return !!data;
}

export async function getSearch(
  query: { name: string; page: number },
  opt?: Partial<RequestOptions>,
) {
  const url = `${host}daoyongjiekoshibushiyoubing?q=${query?.name}&f=_all&p=${query.page || 1}`;
  const data = await jssdk?.puppeteer({
    url: url,
    jscode: `${jsCrawler}`,
    debug: opt?.debug,
    wait: 2000,
    timeout: 1000 * 10,
    callback: () => {},
    ...opt,
  });
  return data;
}

export async function getHome(query?: undefined, opt?: Partial<RequestOptions>) {
  const data = await jssdk?.puppeteer({
    url: `${host}`,
    jscode: `${jsCrawler}`,
    debug: opt?.debug,
    wait: 2000,
    timeout: 1000 * 10,
    callback: () => {},
  });
  return data;
}
