import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
    FLOATING_TAB_DOCK_HEIGHT,
    FLOATING_TAB_FAB_SIZE,
    getFloatingTabBottomOffset,
} from '@/constants/layout';
import { Colors, zinc } from '@/constants/theme';

const TAB_HEIGHT = FLOATING_TAB_DOCK_HEIGHT;
const CENTER_BUTTON_SIZE = FLOATING_TAB_FAB_SIZE;
const FAB_SPACE = 64;
const HORIZONTAL_MARGIN = 16;

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = Colors[colorScheme ?? 'light'];
    const activeColor = colors.tabIconSelected;
    const inactiveColor = colors.tabIconDefault;
    const dockBackground = colors.background;
    const dockBorder = isDark ? zinc[800] : zinc[200];
    const fabBackground = colors.primary;
    const fabIconColor = colors.primaryForeground;
    const bottomOffset = getFloatingTabBottomOffset(insets.bottom);

    const routes = state.routes;

    return (
        <View style={styles.wrapper} pointerEvents="box-none">
            <View
                style={[
                    styles.dock,
                    {
                        bottom: bottomOffset,
                        backgroundColor: dockBackground,
                        borderColor: dockBorder,
                    },
                ]}>
                <View style={styles.content}>
                    {routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        return (
                            <React.Fragment key={route.key}>
                                {index === 2 ? <View style={styles.spacer} /> : null}
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    accessibilityState={isFocused ? { selected: true } : {}}
                                    accessibilityLabel={options.tabBarAccessibilityLabel}
                                    onPress={onPress}
                                    style={styles.tabItem}>
                                    {options.tabBarIcon?.({
                                        focused: isFocused,
                                        color: isFocused ? activeColor : inactiveColor,
                                        size: 24,
                                    })}
                                </TouchableOpacity>
                            </React.Fragment>
                        );
                    })}
                </View>
            </View>

            <View
                style={[
                    styles.fabContainer,
                    {
                        bottom: bottomOffset + TAB_HEIGHT - CENTER_BUTTON_SIZE / 2,
                    },
                ]}
                pointerEvents="box-none">
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: fabBackground }]}
                    onPress={() => {
                        const parentNavigation = navigation.getParent();
                        if (parentNavigation) {
                            parentNavigation.navigate('scan' as never);
                            return;
                        }
                        router.push('/scan');
                    }}>
                    <IconSymbol name="viewfinder" size={28} color={fabIconColor} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        ...StyleSheet.absoluteFillObject,
    },
    dock: {
        position: 'absolute',
        left: HORIZONTAL_MARGIN,
        right: HORIZONTAL_MARGIN,
        height: TAB_HEIGHT,
        borderWidth: 1,
        borderRadius: 34,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 12,
        elevation: 10,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spacer: {
        width: FAB_SPACE,
        height: '100%',
    },
    fabContainer: {
        position: 'absolute',
        left: '50%',
        marginLeft: -CENTER_BUTTON_SIZE / 2,
        width: CENTER_BUTTON_SIZE,
        height: CENTER_BUTTON_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    fab: {
        width: CENTER_BUTTON_SIZE,
        height: CENTER_BUTTON_SIZE,
        borderRadius: CENTER_BUTTON_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
});
