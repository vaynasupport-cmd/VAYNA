import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vayna.app',
  appName: 'Vayna',
  webDir: 'dist',
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#09090b",
      androidSplashResourceName: "splash",
      androidScaleType: "FIT_CENTER",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#3b82f6",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
