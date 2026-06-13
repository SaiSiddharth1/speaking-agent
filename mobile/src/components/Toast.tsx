import React from 'react';
import RNToast from 'react-native-toast-message';

export const Toast = () => <RNToast position="top" topOffset={50} />;

export const showToast = {
  success: (title: string, msg: string) =>
    RNToast.show({ type: 'success', text1: title, text2: msg }),
  error: (title: string, msg: string) =>
    RNToast.show({ type: 'error', text1: title, text2: msg }),
  info: (title: string, msg: string) =>
    RNToast.show({ type: 'info', text1: title, text2: msg }),
};
