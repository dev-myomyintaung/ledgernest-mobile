import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ui/themed-view';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStore, ThemePreference } from '@/store/themeStore';
import { Colors, zinc, brand } from '@/constants/theme';

const OPTIONS: { value: ThemePreference; label: string; icon: string; description: string }[] = [
    {
        value: 'system',
        label: 'System',
        icon: 'circle.lefthalf.filled',
        description: 'Follows your device setting',
    },
    {
        value: 'light',
        label: 'Light',
        icon: 'sun.max.fill',
        description: 'Always use light appearance',
    },
    {
        value: 'dark',
        label: 'Moon',
        icon: 'moon.fill',
        description: 'Always use dark appearance',
    },
];

export default function ThemeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const preference = useThemeStore((s) => s.preference);
    const setPreference = useThemeStore((s) => s.setPreference);

    return (
        <ThemedView className="flex-1" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="px-4 pt-4 pb-3 flex-row items-center gap-3">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-9 h-9 rounded-full items-center justify-center"
                    style={{ borderWidth: 1, borderColor: isDark ? zinc[700] : zinc[200] }}
                >
                    <IconSymbol
                        name="chevron.left"
                        size={18}
                        color={Colors[colorScheme ?? 'light'].icon}
                    />
                </TouchableOpacity>
                <ThemedText type="title">Theme</ThemedText>
            </View>

            {/* Options */}
            <View className="px-4 pt-2">
                <View
                    className="rounded-3xl overflow-hidden"
                    style={{
                        borderWidth: 1,
                        borderColor: isDark ? zinc[800] : zinc[200],
                        backgroundColor: isDark ? zinc[900] : zinc[50],
                    }}
                >
                    {OPTIONS.map((option, index) => {
                        const isSelected = preference === option.value;
                        const isLast = index === OPTIONS.length - 1;
                        return (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => setPreference(option.value)}
                                activeOpacity={1}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 20,
                                    paddingVertical: 16,
                                    borderBottomWidth: isLast ? 0 : 1,
                                    borderBottomColor: isDark ? zinc[800] : zinc[200],
                                }}
                            >
                                <View className="flex-row items-center gap-4">
                                    <View
                                        className="w-9 h-9 rounded-2xl items-center justify-center"
                                        style={{
                                            backgroundColor: isSelected
                                                ? isDark ? brand[400] : brand[500]
                                                : isDark ? zinc[800] : zinc[100],
                                        }}
                                    >
                                        <IconSymbol
                                            name={option.icon as any}
                                            size={17}
                                            color={isSelected
                                                ? isDark ? zinc[900] : '#ffffff'
                                                : isDark ? zinc[400] : zinc[500]}
                                        />
                                    </View>
                                    <View>
                                        <ThemedText type="defaultSemiBold" className="text-sm">
                                            {option.label}
                                        </ThemedText>
                                        <ThemedText className="text-xs text-zinc-500">
                                            {option.description}
                                        </ThemedText>
                                    </View>
                                </View>
                                {isSelected ? (
                                    <IconSymbol
                                        name="checkmark.circle.fill"
                                        size={22}
                                        color={isDark ? brand[400] : brand[500]}
                                    />
                                ) : (
                                    <View
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: 10,
                                            borderWidth: 2,
                                            borderColor: isDark ? zinc[600] : zinc[300],
                                            backgroundColor: isDark ? zinc[900] : zinc[50],
                                        }}
                                    />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </ThemedView>
    );
}
