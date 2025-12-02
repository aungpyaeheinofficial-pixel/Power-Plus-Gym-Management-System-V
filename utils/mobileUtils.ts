import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

// Initialize mobile features
export const initMobileApp = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // Set status bar style
      await StatusBar.setStyle({ style: Style.Dark });
      
      // Handle keyboard
      Keyboard.addListener('keyboardWillShow', () => {
        // Handle keyboard show if needed
        console.log('Keyboard will show');
      });
      
      Keyboard.addListener('keyboardWillHide', () => {
        // Handle keyboard hide if needed
        console.log('Keyboard will hide');
      });
      
      // Handle app state changes
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
      });
      
      // Handle back button (Android)
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });
      
      console.log('Mobile app initialized');
    } catch (error) {
      console.error('Error initializing mobile app:', error);
    }
  }
};

