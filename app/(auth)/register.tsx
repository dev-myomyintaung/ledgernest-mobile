import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Stack, useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
    const router = useRouter();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (data: RegisterFormData) => {
        console.log('Register attempt:', data);
        // TODO: Implement actual registration logic
    };

    return (
        <ThemedView className="flex-1 justify-center px-6">
            <View className="mb-8">
                <ThemedText type="title" className="text-3xl font-bold mb-2">Create Account</ThemedText>
                <ThemedText className="text-gray-500">Sign up to start tracking your budget</ThemedText>
            </View>

            <View className="space-y-4">
                <View>
                    <ThemedText type="defaultSemiBold" className="mb-2">Email</ThemedText>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className={`w-full bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                    } text-black dark:text-white`}
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
                                className={`w-full bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                    } text-black dark:text-white`}
                                placeholder="Create a password"
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

                <View>
                    <ThemedText type="defaultSemiBold" className="mb-2">Confirm Password</ThemedText>
                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className={`w-full bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                    } text-black dark:text-white`}
                                placeholder="Confirm your password"
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

                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-xl items-center mt-4"
                    onPress={handleSubmit(onSubmit)}
                >
                    <Text className="text-white font-semibold text-lg">Sign Up</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-6">
                    <ThemedText className="text-gray-500">Already have an account? </ThemedText>
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity>
                            <ThemedText type="defaultSemiBold" className="text-blue-600">Log In</ThemedText>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </ThemedView>
    );
}
