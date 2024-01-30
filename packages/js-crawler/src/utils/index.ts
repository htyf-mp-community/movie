export interface Conf {
  title: string;
  content: string;
  backgroundColor: string;
}
export function $console(data: Conf) {
  try {
    const { title, content, backgroundColor } = data;
    const msg = [
      '%c '.concat(title, ' %c ').concat(content, ' '),
      'padding: 1px; border-radius: 3px 0 0 3px; color: #fff; background: '.concat(
        '#606060',
        ';',
      ),
      'padding: 1px; border-radius: 0 3px 3px 0; color: #fff; background: '.concat(
        backgroundColor,
        ';',
      ),
    ];
    if (console && console?.log) {
      console.log.apply(null, msg);
    }
  } catch (error) {
    console.error(error);
  }
}
