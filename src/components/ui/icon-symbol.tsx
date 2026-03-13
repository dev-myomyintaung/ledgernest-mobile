// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'viewfinder': 'center-focus-strong', // Mapped to MaterialIcons 'center-focus-strong'
  'chart.bar.fill': 'bar-chart',
  'rectangle.grid.2x2.fill': 'grid-view',
  'xmark': 'close',
  'checkmark': 'check',
  'cart.fill': 'shopping-cart',
  'cup.and.saucer.fill': 'local-cafe',
  'car.fill': 'directions-car',
  'lightbulb.fill': 'lightbulb',
  'film.fill': 'movie',
  'cross.case.fill': 'medical-services',
  'bag.fill': 'shopping-bag',
  'archivebox.fill': 'inventory-2',
  'dollarsign.circle.fill': 'monetization-on',
  'briefcase.fill': 'work',
  'star.fill': 'star',
  'fork.knife': 'restaurant',
  'gamecontroller.fill': 'sports-esports',
  'gift.fill': 'card-giftcard',
  'book.fill': 'menu-book',
  'heart.fill': 'favorite',
  'bolt.fill': 'bolt',
  'wifi': 'wifi',
  'camera.fill': 'photo-camera',
  'photo.fill': 'photo-library',
  'doc.text.fill': 'description',
  'chevron.down': 'keyboard-arrow-down',
  'square.and.pencil': 'edit',
  'arrow.left': 'arrow-back',
  'trash.fill': 'delete',
  'popcorn.fill': 'local-movies',
  'arrow.clockwise': 'refresh',
  'exclamationmark.triangle.fill': 'warning',
  'magnifyingglass': 'search',
  'slider.horizontal.3': 'tune',
  'banknote.fill': 'payments',
  'play.rectangle.fill': 'smart-display',
  'questionmark': 'help-outline',
  'person.circle.fill': 'account-circle',
  'rectangle.portrait.and.arrow.right': 'logout',
  'arrow.down.circle': 'arrow-drop-down-circle',
  'arrow.up.circle': 'arrow-circle-up',
  'doc.text': 'article',
  'pencil': 'edit',
  'xmark.circle.fill': 'cancel',
  'checkmark.circle.fill': 'check-circle',
  'folder': 'folder',
  'plus': 'add',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
