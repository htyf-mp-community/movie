import sdk from './client';
import { $console } from './utils';

export * from './client';
export * from './types';

export default sdk;

$console({
  title: `${__SDK_NAME__}`,
  content: `version: ${__SDK_VERSION__} `,
  backgroundColor: 'rgba(72, 190, 57, 1.000)',
});
