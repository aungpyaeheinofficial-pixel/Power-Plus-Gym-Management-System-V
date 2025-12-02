import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.powerplusgym.app',
  appName: 'Power Plus Gym',
  webDir: 'dist',
  server: {
    // Load app from server for automatic updates
    // When you update the server, all apps get the update automatically!
    url: 'http://167.172.90.182:4000',
    cleartext: true  // Allow HTTP (use HTTPS in production)
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
