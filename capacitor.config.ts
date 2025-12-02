import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.powerplusgym.app',
  appName: 'Power Plus Gym',
  webDir: 'dist',
  server: {
    // For development, you can use your local IP
    // For production, remove this or set to your production URL
    // url: 'http://YOUR_LOCAL_IP:5173',
    // cleartext: true
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    }
  }
};

export default config;
