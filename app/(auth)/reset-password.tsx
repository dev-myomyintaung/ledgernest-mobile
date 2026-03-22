import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

import { useResetPassword } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, zinc, semantic } from '@/constants/theme';

const schema = z
    .object({
        newPassword: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(6, 'Please confirm your password'),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match',
    });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { token } = useLocalSearchParams<{ token: string }>();
    const { mutate: resetPassword, isPending, isError, error } = useResetPassword();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { newPassword: '', confirmPassword: '' },
    });

    const onSubmit = (data: FormData) => {
        if (!token) return;
        resetPassword({ token, newPassword: data.newPassword });
    };

    if (!token) {
        return (
            <ThemedView className="flex-1 justify-center px-4">
                <View className="items-center mb-8">
                    <Text className="text-5xl mb-4">⚠️</Text>
                    <ThemedText type="title" className="text-2xl font-bold mb-3 text-center">
                        Invalid Link
                    </ThemedText>
                    <ThemedText className="text-zinc-500 text-center">
                        This password reset link is missing or invalid.
                        Please request a new one.
                    </ThemedText>
                </View>
                <Link href="/(auth)/forgot-password" asChild>
                    <TouchableOpacity style={{ backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary }} className="p-4 rounded-xl items-center">
                        <Text style={{ color: Colors[colorScheme ?? 'light'].primaryForeground }} className="font-semibold text-lg">
                            Request New Link
                        </Text>
                    </TouchableOpacity>
                </Link>
            </ThemedView>
        );
    }

    return (
        <ThemedView className="flex-1 justify-center px-4">
            <View className="mb-8">
                <ThemedText type="title" className="text-3xl font-bold mb-2">
                    Set New Password
                </ThemedText>
                <ThemedText className="text-zinc-500">
                    Choose a new password for your account.
                </ThemedText>
            </View>

            <View>
                {/* New Password */}
                <View className="mb-4">
                    <ThemedText type="defaultSemiBold" className="mb-2">New Password</ThemedText>
                    <Controller
                        control={control}
                        name="newPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={{
                                    height: 52, borderRadius: 12, paddingHorizontal: 16,
                                    borderWidth: 1, fontSize: 16, textAlignVertical: 'center',
                                    backgroundColor: isDark ? zinc[800] : zinc[100],
                                    borderColor: errors.newPassword ? semantic.danger.light : isDark ? zinc[700] : zinc[200],
                                    color: isDark ? zinc[50] : zinc[900],
                                }}
                                placeholder="At least 6 characters"
                                placeholderTextColor={zinc[400]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry
                            />
                        )}
                    />
                    {errors.newPassword && (
                        <Text style={{ color: semantic.danger.light }} className="text-sm mt-1">{errors.newPassword.message}</Text>
                    )}
                </View>

                {/* Confirm Password */}
                <View className="mb-6">
                    <ThemedText type="defaultSemiBold" className="mb-2">Confirm Password</ThemedText>
                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={{
                                    height: 52, borderRadius: 12, paddingHorizontal: 16,
                                    borderWidth: 1, fontSize: 16, textAlignVertical: 'center',
                                    backgroundColor: isDark ? zinc[800] : zinc[100],
                                    borderColor: errors.confirmPassword ? semantic.danger.light : isDark ? zinc[700] : zinc[200],
                                    color: isDark ? zinc[50] : zinc[900],
                                }}
                                placeholder="Re-enter your password"
                                placeholderTextColor={zinc[400]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry
                            />
                        )}
                    />
                    {errors.confirmPassword && (
                        <Text style={{ color: semantic.danger.light }} className="text-sm mt-1">{errors.confirmPassword.message}</Text>
                    )}
                </View>

                {/* Server error */}
                {isError && (
                    <View className="bg-danger-light dark:bg-danger rounded-xl p-3 mb-4" style={{ borderWidth: 1, borderColor: semantic.danger.light }}>
                        <Text style={{ color: semantic.danger.light }} className="text-sm text-center">
                            {(error as any)?.response?.data?.error?.message ??
                                'This link is invalid or has expired. Please request a new one.'}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    style={{ backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary }}
                    className="p-4 rounded-xl items-center"
                    onPress={handleSubmit(onSubmit)}
                    disabled={isPending}
                >
                    {isPending ? (
                        <ActivityIndicator color={Colors[colorScheme ?? 'light'].primaryForeground} />
                    ) : (
                        <Text style={{ color: Colors[colorScheme ?? 'light'].primaryForeground }} className="font-semibold text-lg">
                            Reset Password
                        </Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center mt-6">
                    <ThemedText className="text-zinc-500">Need a new link? </ThemedText>
                    <Link href="/(auth)/forgot-password" asChild>
                        <TouchableOpacity>
                            <ThemedText type="defaultSemiBold" style={{ color: Colors[colorScheme ?? 'light'].primary }}>
                                Request Again
                            </ThemedText>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </ThemedView>
    );
}
