import { Platform } from 'react-native';

export const FLOATING_TAB_DOCK_HEIGHT = 68;
export const FLOATING_TAB_FAB_SIZE = 62;

export const getFloatingTabBottomOffset = (insetsBottom: number) => {
  if (Platform.OS === 'android') {
    // Keep clear distance from Android 3-button system navigation bars.
    // Insets can vary by device, so we add extra spacing on top.
    return Math.max(insetsBottom + 14, 34);
  }

  return Math.max(insetsBottom > 0 ? insetsBottom - 4 : 10, 8);
};

export const getFloatingTabContentPaddingBottom = (insetsBottom: number) => {
  const bottomOffset = getFloatingTabBottomOffset(insetsBottom);
  const highestOverlayPoint = bottomOffset + FLOATING_TAB_DOCK_HEIGHT + FLOATING_TAB_FAB_SIZE / 2;
  return highestOverlayPoint + (Platform.OS === 'android' ? 16 : 10);
};
