import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config: expoConfig }: ConfigContext): ExpoConfig => {
  let name = '';
  let slug = '';
  let projectId = '';
  let ios = { bundleIdentifier: '', buildNumber: '' };
  let android = { package: '', versionCode: 1 };

  /**
   * dev configuration
   */
  function setDevConfig() {
    name = `DEV - ${expoConfig.name}`;
    slug = 'htyf-mp-dev';
    projectId = '3a2f44a2-b2cb-4445-91e0-5e41dad0b0c4';
    ios = {
      bundleIdentifier: 'com.watarumaeda.htyf-mp-dev',
      buildNumber: '1.0.0',
    };
    android = {
      package: 'com.watarumaeda.htyf_mp.dev',
      versionCode: 1,
    };
  }

  /**
   * prod configuration
   */
  function setProdConfig() {
    name = expoConfig.name ?? '';
    slug = 'htyf-mp';
    projectId = '18adc0d0-eb1d-11e9-8009-d524ed5cc4a7';
    ios = {
      bundleIdentifier: 'com.watarumaeda.htyf-mp',
      buildNumber: '1.0.0',
    };
    android = {
      package: 'com.watarumaeda.htyf_mp',
      versionCode: 1,
    };
  }

  // switch expo configuration based on environment
  const targetEnv = process.env.NODE_ENV;
  if (targetEnv === 'production') setProdConfig();
  else setDevConfig();

  const envConfig: ExpoConfig = {
    ...expoConfig,
    name,
    slug,
    updates: {
      url: `https://u.expo.dev/${projectId}`,
    },
    ios: {
      ...expoConfig.ios,
      ...ios,
    },
    android: {
      ...expoConfig.android,
      ...android,
    },
    extra: {
      ...expoConfig.extra,
      eas: { projectId },
    },
  };

  // console.log('[##] your expo config', envConfig);

  return envConfig;
};
