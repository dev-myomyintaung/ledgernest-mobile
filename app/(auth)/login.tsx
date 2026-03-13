import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

import { useLogin } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { mutate: login, isPending } = useLogin();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: LoginFormData) => {
        console.log('Login attempt:', data);
        login(data);
    };

    return (
        <ThemedView className="flex-1 justify-center px-4">
            <View className="mb-8">
                <ThemedText type="title" className="text-3xl font-bold mb-2">Welcome Back</ThemedText>
                <ThemedText className="text-gray-500">Sign in to continue to your budget</ThemedText>
            </View>

            <View>
                <View className='mb-4'>
                    <ThemedText type="defaultSemiBold" className="mb-2">Email</ThemedText>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={{
                                    height: 52, borderRadius: 12, paddingHorizontal: 16,
                                    borderWidth: 1, fontSize: 16, textAlignVertical: 'center',
                                    backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                                    borderColor: errors.email ? '#ef4444' : isDark ? '#374151' : '#e5e7eb',
                                    color: isDark ? '#ffffff' : '#000000',
                                }}
                                placeholder="Enter your email"
                                placeholderTextColor="#9CA3AF"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        )}
                    />
                    {errors.email && (
                        <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>
                    )}
                </View>

                <View>
                    <ThemedText type="defaultSemiBold" className="mb-2">Password</ThemedText>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={{
                                    height: 52, borderRadius: 12, paddingHorizontal: 16,
                                    borderWidth: 1, fontSize: 16, textAlignVertical: 'center',
                                    backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                                    borderColor: errors.password ? '#ef4444' : isDark ? '#374151' : '#e5e7eb',
                                    color: isDark ? '#ffffff' : '#000000',
                                }}
                                placeholder="Enter your password"
                                placeholderTextColor="#9CA3AF"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry
                            />
                        )}
                    />
                    {errors.password && (
                        <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>
                    )}
                </View>

                <View className="flex-row justify-end mt-2 mb-1">
                    <Link href="/(auth)/forgot-password" asChild>
                        <TouchableOpacity>
                            <ThemedText className="text-gray-500 text-sm">Forgot password?</ThemedText>
                        </TouchableOpacity>
                    </Link>
                </View>

                <TouchableOpacity
                    className="bg-black dark:bg-white p-4 rounded-xl items-center mt-4"
                    onPress={handleSubmit(onSubmit)}
                    disabled={isPending}
                >
                    {isPending ? (
                        <ActivityIndicator color={isDark ? '#111111' : '#ffffff'} />
                    ) : (
                        <Text className="text-white dark:text-black font-semibold text-lg">Log In</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center mt-6">
                    <ThemedText className="text-gray-500">Don&apos;t have an account? </ThemedText>
                    <Link href="/(auth)/register" asChild>
                        <TouchableOpacity>
                            <ThemedText type="defaultSemiBold" className="text-black dark:text-white">Sign Up</ThemedText>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </ThemedView>
    );
}
