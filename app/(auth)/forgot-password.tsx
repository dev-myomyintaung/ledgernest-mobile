import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

import { useForgotPassword } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, zinc, semantic } from '@/constants/theme';

const schema = z.object({
    email: z.string().email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { mutate: forgotPassword, isPending } = useForgotPassword();
    const [submitted, setSubmitted] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { email: '' },
    });

    const onSubmit = (data: FormData) => {
        forgotPassword(data, {
            onSuccess: () => setSubmitted(true),
        });
    };

    if (submitted) {
        return (
            <ThemedView className="flex-1 justify-center px-4">
                <View className="items-center mb-8">
                    <Text className="text-5xl mb-4">📬</Text>
                    <ThemedText type="title" className="text-2xl font-bold mb-3 text-center">
                        Check your email
                    </ThemedText>
                    <ThemedText className="text-zinc-500 text-center leading-6">
                        If that email is registered, we&apos;ve sent a password reset link.
                        Check your inbox and follow the link to reset your password.
                    </ThemedText>
                </View>

                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity style={{ backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary }} className="p-4 rounded-xl items-center">
                        <Text style={{ color: Colors[colorScheme ?? 'light'].primaryForeground }} className="font-semibold text-lg">
                            Back to Login
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
                    Forgot Password?
                </ThemedText>
                <ThemedText className="text-zinc-500 leading-6">
                    No worries. Enter your email address and we&apos;ll send you a link to reset your password.
                </ThemedText>
            </View>

            <View>
                <View className="mb-6">
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
                            Send Reset Link
                        </Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center mt-6">
                    <ThemedText className="text-zinc-500">Remember your password? </ThemedText>
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity>
                            <ThemedText type="defaultSemiBold" style={{ color: Colors[colorScheme ?? 'light'].primary }}>
                                Log In
                            </ThemedText>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </ThemedView>
    );
}
