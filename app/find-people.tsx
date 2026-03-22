import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ui/themed-view";
import { ThemedText } from "@/components/ui/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors, zinc, brand, semantic } from "@/constants/theme";
import { hexToRgba } from "@/utils/format";
import { useUserSearch, useFollow, useUnfollow } from "@/hooks/useUsers";
import { PublicUser } from "@/api/endpoints/users";

function userDisplayName(user: PublicUser) {
  return (
    user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    "Unknown"
  );
}

function InitialsAvatar({ user, isDark }: { user: PublicUser; isDark: boolean }) {
  const name = userDisplayName(user);
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <View
      style={{
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: isDark ? brand[800] : brand[100],
        alignItems: "center", justifyContent: "center",
      }}
    >
      <ThemedText style={{ fontSize: 16, fontWeight: "700", color: isDark ? brand[200] : brand[700] }}>
        {initials}
      </ThemedText>
    </View>
  );
}

export default function FindPeopleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const cs = colorScheme ?? "light";

  const [query, setQuery] = useState("");
  const { data: results = [], isFetching } = useUserSearch(query);
  const follow   = useFollow();
  const unfollow = useUnfollow();

  const handleFollow = async (user: PublicUser) => {
    try {
      if (user.isFollowing) {
        await unfollow.mutateAsync(user.id);
      } else {
        await follow.mutateAsync(user.id);
      }
    } catch {
      Alert.alert("Error", "Could not update follow status. Try again.");
    }
  };

  const card = {
    backgroundColor: isDark ? zinc[800] : zinc[100],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? zinc[700] : zinc[200],
  } as const;

  return (
    <ThemedView className="flex-1" style={{ paddingTop: Platform.OS === "ios" ? 8 : insets.top }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <View
        className="px-4 py-3 flex-row items-center justify-between"
        style={{ borderBottomWidth: 1, borderBottomColor: isDark ? zinc[800] : zinc[200] }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={{
            width: 38, height: 38, borderRadius: 19,
            alignItems: "center", justifyContent: "center",
            backgroundColor: isDark ? zinc[800] : zinc[100],
            borderWidth: 1, borderColor: isDark ? zinc[700] : zinc[200],
          }}
        >
          <IconSymbol name="xmark" size={15} color={Colors[cs].icon} />
        </TouchableOpacity>

        <View className="items-center">
          <ThemedText className="text-[10px] tracking-widest text-zinc-400 font-semibold">SOCIAL</ThemedText>
          <ThemedText className="text-base font-bold">Find People</ThemedText>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 32,
          gap: 12,
        }}
      >

        {/* ── Search bar ─────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row", alignItems: "center", gap: 10,
            backgroundColor: isDark ? zinc[800] : zinc[100],
            borderRadius: 16, borderWidth: 1,
            borderColor: isDark ? zinc[700] : zinc[200],
            paddingHorizontal: 14, paddingVertical: 10,
          }}
        >
          <IconSymbol name="magnifyingglass" size={16} color={isDark ? zinc[500] : zinc[400]} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or email…"
            placeholderTextColor={isDark ? zinc[600] : zinc[400]}
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              flex: 1, fontSize: 15,
              color: isDark ? zinc[50] : zinc[900],
            }}
          />
          {isFetching && <ActivityIndicator size="small" />}
          {query.length > 0 && !isFetching && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <IconSymbol name="xmark.circle.fill" size={18} color={isDark ? zinc[600] : zinc[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Results ─────────────────────────────────────────────── */}
        {query.length > 0 && results.length === 0 && !isFetching && (
          <View className="items-center py-12">
            <IconSymbol name="person.slash" size={36} color={isDark ? zinc[600] : zinc[400]} />
            <ThemedText className="text-zinc-500 mt-3 text-sm">No users found</ThemedText>
          </View>
        )}

        {query.length === 0 && (
          <View className="items-center py-12">
            <IconSymbol name="person.2.fill" size={36} color={isDark ? zinc[700] : zinc[300]} />
            <ThemedText className="text-zinc-400 mt-3 text-sm text-center">
              Search for people to follow.{"\n"}They'll appear in your receipt item picker.
            </ThemedText>
          </View>
        )}

        {results.length > 0 && (
          <View style={{ ...card, overflow: "hidden" }}>
            {results.map((user, idx) => {
              const name = userDisplayName(user);
              const isPending = follow.isPending || unfollow.isPending;
              return (
                <View
                  key={user.id}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 12,
                    paddingHorizontal: 16, paddingVertical: 14,
                    borderBottomWidth: idx < results.length - 1 ? 1 : 0,
                    borderBottomColor: isDark ? zinc[700] : zinc[200],
                  }}
                >
                  <InitialsAvatar user={user} isDark={isDark} />

                  <View className="flex-1">
                    <ThemedText className="text-sm font-semibold">{name}</ThemedText>
                    {user.email && (
                      <ThemedText className="text-xs text-zinc-400">{user.email}</ThemedText>
                    )}
                    <ThemedText className="text-xs text-zinc-500 mt-0.5">
                      {user.followerCount} follower{user.followerCount !== 1 ? "s" : ""}
                    </ThemedText>
                  </View>

                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    {user.isMutual && (
                      <View
                        style={{
                          paddingHorizontal: 8, paddingVertical: 2,
                          borderRadius: 8,
                          backgroundColor: isDark ? hexToRgba(brand[400], 0.2) : hexToRgba(brand[500], 0.1),
                        }}
                      >
                        <ThemedText
                          className="text-[10px] font-bold tracking-wide"
                          style={{ color: isDark ? brand[300] : brand[600] }}
                        >
                          MUTUAL
                        </ThemedText>
                      </View>
                    )}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      disabled={isPending}
                      onPress={() => handleFollow(user)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 7,
                        borderRadius: 12, borderWidth: 1,
                        backgroundColor: user.isFollowing
                          ? "transparent"
                          : isDark ? brand[400] : brand[500],
                        borderColor: user.isFollowing
                          ? isDark ? zinc[600] : zinc[300]
                          : isDark ? brand[400] : brand[500],
                      }}
                    >
                      <ThemedText
                        className="text-xs font-semibold"
                        style={{
                          color: user.isFollowing
                            ? isDark ? zinc[400] : zinc[500]
                            : Colors[cs].primaryForeground,
                        }}
                      >
                        {user.isFollowing ? "Following" : "Follow"}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}
