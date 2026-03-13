import { useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    TextInput,
    TouchableOpacity,
    View,
    type LayoutChangeEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocalSearchParams } from 'expo-router';

const categorySchema = z.object({
    name: z.string().min(1, 'Name is required').max(30, 'Name is too long'),
    type: z.enum(['expense', 'income']),
    color: z.string().min(1, 'Color is required'),
    icon: z.string().min(1, 'Icon is required'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const ICONS = [
    'cart.fill',
    'cup.and.saucer.fill',
    'car.fill',
    'lightbulb.fill',
    'film.fill',
    'cross.case.fill',
    'bag.fill',
    'archivebox.fill',
    'dollarsign.circle.fill',
    'briefcase.fill',
    'chart.bar.fill',
    'star.fill',
    'fork.knife',
    'house.fill',
    'gamecontroller.fill',
    'gift.fill',
    'book.fill',
    'heart.fill',
    'bolt.fill',
    'wifi',
] as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hslToHex = (h: number, s = 0.85, l = 0.52) => {
    const hue = clamp(h, 0, 360) / 360;
    const saturation = clamp(s, 0, 1);
    const lightness = clamp(l, 0, 1);

    if (saturation === 0) {
        const gray = Math.round(lightness * 255);
        const hex = gray.toString(16).padStart(2, '0');
        return `#${hex}${hex}${hex}`.toUpperCase();
    }

    const q =
        lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;

    const hueToRgb = (t: number) => {
        let temp = t;
        if (temp < 0) temp += 1;
        if (temp > 1) temp -= 1;
        if (temp < 1 / 6) return p + (q - p) * 6 * temp;
        if (temp < 1 / 2) return q;
        if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
        return p;
    };

    const r = Math.round(hueToRgb(hue + 1 / 3) * 255);
    const g = Math.round(hueToRgb(hue) * 255);
    const b = Math.round(hueToRgb(hue - 1 / 3) * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
        .toString(16)
        .padStart(2, '0')}`.toUpperCase();
};

const hexToHue = (hex: string) => {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return 140;

    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    if (delta === 0) return 0;

    let hue = 0;
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;

    return Math.round(((hue * 60) + 360) % 360);
};

type HuePickerProps = {
    value: string;
    onChange: (nextColor: string) => void;
    isDark: boolean;
};

function HuePicker({ value, onChange, isDark }: HuePickerProps) {
    const [trackWidth, setTrackWidth] = useState(0);
    const currentHue = useMemo(() => hexToHue(value), [value]);

    const updateColor = (locationX: number) => {
        if (trackWidth <= 0) return;
        const ratio = clamp(locationX / trackWidth, 0, 1);
        onChange(hslToHex(ratio * 360));
    };

    const onTrackLayout = (event: LayoutChangeEvent) => {
        setTrackWidth(event.nativeEvent.layout.width);
    };

    const thumbLeft = trackWidth > 0 ? (currentHue / 360) * trackWidth : 0;

    return (
        <View>
            <View
                onLayout={onTrackLayout}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={(event) => updateColor(event.nativeEvent.locationX)}
                onResponderMove={(event) => updateColor(event.nativeEvent.locationX)}
                className="h-9 rounded-full overflow-hidden justify-center">
                <LinearGradient
                    colors={['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                />
                {trackWidth > 0 ? (
                    <View
                        style={{
                            position: 'absolute',
                            left: thumbLeft - 10,
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: value,
                            borderWidth: 2,
                            borderColor: isDark ? '#09090b' : '#ffffff',
                        }}
                    />
                ) : null}
            </View>
            <View className="mt-2 flex-row items-center justify-between">
                <ThemedText className="text-xs text-zinc-500">Drag to pick</ThemedText>
                <View className="px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                    <ThemedText className="text-xs text-zinc-500">{value.toUpperCase()}</ThemedText>
                </View>
            </View>
        </View>
    );
}

export default function CreateCategoryModal() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const params = useLocalSearchParams<{
        categoryId?: string;
        name?: string;
        type?: string;
        color?: string;
        icon?: string;
    }>();

    const isEditMode = !!params.categoryId;
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: params.name ?? '',
            type: (params.type as 'expense' | 'income') ?? 'expense',
            color: params.color || '#4CAF50',
            icon: (params.icon as typeof ICONS[number]) || ICONS[0],
        },
    });

    const onSubmit = (data: CategoryFormValues) => {
        if (isEditMode) {
            updateMutation.mutate({ id: params.categoryId!, data }, {
                onSuccess: () => router.back(),
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: () => router.back(),
            });
        }
    };

    const selectedColor = watch('color');
    const selectedIcon = watch('icon');
    const selectedName = watch('name');
    const selectedType = watch('type');
    const actionBackground = isDark ? '#ffffff' : '#111111';
    const actionIcon = isDark ? '#111111' : '#ffffff';
    const headerTopPadding = Platform.OS === 'ios' ? 8 : insets.top;

    return (
        <ThemedView className="flex-1" style={{ paddingTop: headerTopPadding }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <View className="px-5 pt-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <View className="flex-row items-center">
                        <View className="w-[60px]">
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Close"
                                onPress={() => router.back()}
                                className="w-10 h-10 rounded-full items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                <IconSymbol name="xmark" size={18} color={isDark ? '#d4d4d8' : '#3f3f46'} />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-1 items-center">
                            <ThemedText className="text-[11px] tracking-[2px] text-zinc-500">CATEGORY</ThemedText>
                            <ThemedText type="subtitle">{isEditMode ? 'Edit Category' : 'New Category'}</ThemedText>
                        </View>

                        <View className="w-[60px] items-end">
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Create category"
                                onPress={handleSubmit(onSubmit)}
                                disabled={isPending}
                                className="w-10 h-10 rounded-full items-center justify-center"
                                style={{
                                    backgroundColor: isPending ? (isDark ? '#3f3f46' : '#d4d4d8') : actionBackground,
                                }}>
                                <IconSymbol
                                    name="checkmark"
                                    size={20}
                                    color={isPending ? (isDark ? '#a1a1aa' : '#71717a') : actionIcon}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="flex-1 px-5 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
                    <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 mb-3">
                        <View className="flex-row items-center">
                            <View
                                className="w-12 h-12 rounded-2xl items-center justify-center"
                                style={{ backgroundColor: selectedColor }}>
                                <IconSymbol name={selectedIcon as any} size={22} color="#ffffff" />
                            </View>
                            <View className="ml-3 flex-1">
                                <ThemedText type="defaultSemiBold" className="text-[17px]">
                                    {selectedName?.trim() ? selectedName.trim() : 'New Category'}
                                </ThemedText>
                                <ThemedText className="text-xs text-zinc-500 capitalize">{selectedType}</ThemedText>
                            </View>
                        </View>

                        <View className="mt-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-3">
                            <Controller
                                control={control}
                                name="name"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        placeholder="Category name"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        style={{ fontSize: 17, textAlignVertical: 'center', color: isDark ? '#f4f4f5' : '#18181b' }}
                                        placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                                        autoFocus
                                    />
                                )}
                            />
                        </View>
                        {errors.name ? <ThemedText className="text-red-500 text-sm mt-2 ml-1">{errors.name.message}</ThemedText> : null}
                    </View>

                    <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 mb-3">
                        <View className="flex-row items-center justify-between">
                            <ThemedText type="defaultSemiBold">Type</ThemedText>
                            <Controller
                                control={control}
                                name="type"
                                render={({ field: { onChange, value } }) => (
                                    <View className="flex-row items-center gap-2">
                                        {(['expense', 'income'] as const).map((typeValue) => {
                                            const selected = value === typeValue;
                                            return (
                                                <TouchableOpacity
                                                    key={typeValue}
                                                    onPress={() => onChange(typeValue)}
                                                    className="px-3 py-1 rounded-full border"
                                                    style={{
                                                        borderColor: selected ? (isDark ? '#f4f4f5' : '#111111') : isDark ? '#3f3f46' : '#d4d4d8',
                                                        backgroundColor: selected ? (isDark ? '#ffffff' : '#111111') : 'transparent',
                                                    }}>
                                                    <ThemedText
                                                        className="capitalize text-sm font-semibold"
                                                        style={{
                                                            color: selected ? (isDark ? '#111111' : '#ffffff') : isDark ? '#a1a1aa' : '#71717a',
                                                        }}>
                                                        {typeValue}
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            />
                        </View>
                    </View>

                    <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 mb-3">
                        <ThemedText type="defaultSemiBold" className="mb-3">
                            Color
                        </ThemedText>
                        <Controller
                            control={control}
                            name="color"
                            render={({ field: { onChange, value } }) => <HuePicker value={value} onChange={onChange} isDark={isDark} />}
                        />
                    </View>

                    <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4">
                        <ThemedText type="defaultSemiBold" className="mb-3">
                            Icon
                        </ThemedText>
                        <Controller
                            control={control}
                            name="icon"
                            render={({ field: { onChange, value } }) => (
                                <View className="flex-row flex-wrap justify-between gap-y-2">
                                    {ICONS.map((iconName) => {
                                        const selected = value === iconName;
                                        return (
                                            <TouchableOpacity
                                                key={iconName}
                                                onPress={() => onChange(iconName)}
                                                className="w-[18%] h-12 rounded-xl items-center justify-center border"
                                                style={{
                                                    borderColor: selected ? (isDark ? '#f4f4f5' : '#111111') : isDark ? '#27272a' : '#e5e7eb',
                                                    backgroundColor: selected ? (isDark ? '#ffffff' : '#111111') : isDark ? '#18181b' : '#fafafa',
                                                }}>
                                                <View className="w-6 h-6 items-center justify-center">
                                                    <IconSymbol
                                                        name={iconName as any}
                                                        size={20}
                                                        style={{ transform: [{ translateY: -0.5 }] }}
                                                        color={selected ? (isDark ? '#111111' : '#ffffff') : isDark ? '#a1a1aa' : '#9ca3af'}
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}
