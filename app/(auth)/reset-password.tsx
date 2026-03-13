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
                    <ThemedText className="text-gray-500 text-center">
                        This password reset link is missing or invalid.
                        Please request a new one.
                    </ThemedText>
                </View>
                <Link href="/(auth)/forgot-password" asChild>
                    <TouchableOpacity className="bg-black dark:bg-white p-4 rounded-xl items-center">
                        <Text className="text-white dark:text-black font-semibold text-lg">
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
                <ThemedText className="text-gray-500">
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
                                    backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                                    borderColor: errors.newPassword ? '#ef4444' : isDark ? '#374151' : '#e5e7eb',
                                    color: isDark ? '#ffffff' : '#000000',
                                }}
                                placeholder="At least 6 characters"
                                placeholderTextColor="#9CA3AF"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry
                            />
                        )}
                    />
                    {errors.newPassword && (
                        <Text className="text-red-500 text-sm mt-1">{errors.newPassword.message}</Text>
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
                                    backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                                    borderColor: errors.confirmPassword ? '#ef4444' : isDark ? '#374151' : '#e5e7eb',
                                    color: isDark ? '#ffffff' : '#000000',
                                }}
                                placeholder="Re-enter your password"
                                placeholderTextColor="#9CA3AF"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry
                            />
                        )}
                    />
                    {errors.confirmPassword && (
                        <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</Text>
                    )}
                </View>

                {/* Server error */}
                {isError && (
                    <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4">
                        <Text className="text-red-600 dark:text-red-400 text-sm text-center">
                            {(error as any)?.response?.data?.error?.message ??
                                'This link is invalid or has expired. Please request a new one.'}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    className="bg-black dark:bg-white p-4 rounded-xl items-center"
                    onPress={handleSubmit(onSubmit)}
                    disabled={isPending}
                >
                    {isPending ? (
                        <ActivityIndicator color={isDark ? '#111111' : '#ffffff'} />
                    ) : (
                        <Text className="text-white dark:text-black font-semibold text-lg">
                            Reset Password
                        </Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center mt-6">
                    <ThemedText className="text-gray-500">Need a new link? </ThemedText>
                    <Link href="/(auth)/forgot-password" asChild>
                        <TouchableOpacity>
                            <ThemedText type="defaultSemiBold" className="text-black dark:text-white">
                                Request Again
                            </ThemedText>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </ThemedView>
    );
}
