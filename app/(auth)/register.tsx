import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, zinc, semantic } from '@/constants/theme';

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
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
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
        <ThemedView className="flex-1 justify-center px-4">
            <View className="mb-8">
                <ThemedText type="title" className="text-3xl font-bold mb-2">Create Account</ThemedText>
                <ThemedText className="text-zinc-500">Sign up to start tracking your budget</ThemedText>
            </View>

            <View className="space-y-4">
                <View>
                    <ThemedText type="defaultSemiBold" className="mb-2">Email</ThemedText>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={{
                                    height: 52, borderRadius: 12, paddingHorizontal: 16,
                                    borderWidth: 1, fontSize: 16, textAlignVertical: 'center',
                                    backgroundColor: isDark ? zinc[800] : zinc[100],
                                    borderColor: errors.email ? semantic.danger.light : isDark ? zinc[700] : zinc[200],
                                    color: isDark ? zinc[50] : zinc[900],
                                }}
                                placeholder="Enter your email"
                                placeholderTextColor={zinc[400]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        )}
                    />
                    {errors.email && (
                        <Text style={{ color: semantic.danger.light }} className="text-sm mt-1">{errors.email.message}</Text>
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
                                    backgroundColor: isDark ? zinc[800] : zinc[100],
                                    borderColor: errors.password ? semantic.danger.light : isDark ? zinc[700] : zinc[200],
                                    color: isDark ? zinc[50] : zinc[900],
                                }}
                                placeholder="Create a password"
                                placeholderTextColor={zinc[400]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry
                            />
                        )}
                    />
                    {errors.password && (
                        <Text style={{ color: semantic.danger.light }} className="text-sm mt-1">{errors.password.message}</Text>
                    )}
                </View>

                <View>
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
                                placeholder="Confirm your password"
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

                <TouchableOpacity
                    style={{ backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary }}
                    className="p-4 rounded-xl items-center mt-4"
                    onPress={handleSubmit(onSubmit)}
                >
                    <Text style={{ color: Colors[colorScheme ?? 'light'].primaryForeground }} className="font-semibold text-lg">Sign Up</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-6">
                    <ThemedText className="text-zinc-500">Already have an account? </ThemedText>
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity>
                            <ThemedText type="defaultSemiBold" style={{ color: Colors[colorScheme ?? 'light'].primary }}>Log In</ThemedText>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </ThemedView>
    );
}
