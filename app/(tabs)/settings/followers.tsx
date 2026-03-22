import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ui/themed-view";
import { ThemedText } from "@/components/ui/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors, zinc, brand } from "@/constants/theme";
import { useFollowers, useFollowing, useFollow, useUnfollow } from "@/hooks/useUsers";
import { PublicUser } from "@/api/endpoints/users";

type Tab = "followers" | "following";

function userDisplayName(user: PublicUser) {
  return (
    user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    "Unknown"
  );
}

function InitialsAvatar({ user, isDark }: { user: PublicUser; isDark: boolean }) {
  const initials = userDisplayName(user).slice(0, 2).toUpperCase();
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

export default function FollowersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const cs = colorScheme ?? "light";

  const [activeTab, setActiveTab] = useState<Tab>("followers");

  const { data: followers = [], isLoading: followersLoading } = useFollowers();
  const { data: following = [], isLoading: followingLoading } = useFollowing();
  const follow = useFollow();
  const unfollow = useUnfollow();

  const followingIds = new Set(following.map((u) => u.id));

  const handleAction = async (user: PublicUser) => {
    const isFollowingUser = activeTab === "following" || followingIds.has(user.id);
    try {
      if (isFollowingUser) {
        await unfollow.mutateAsync(user.id);
      } else {
        await follow.mutateAsync(user.id);
      }
    } catch {
      Alert.alert("Error", "Could not update follow status. Try again.");
    }
  };

  const isLoading = activeTab === "followers" ? followersLoading : followingLoading;
  const users = activeTab === "followers" ? followers : following;

  const card = {
    backgroundColor: isDark ? zinc[800] : zinc[100],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? zinc[700] : zinc[200],
  } as const;

  return (
    <ThemedView className="flex-1" style={{ paddingTop: insets.top }}>

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
          <IconSymbol name="arrow.left" size={15} color={Colors[cs].icon} />
        </TouchableOpacity>

        <View className="items-center">
          <ThemedText className="text-[10px] tracking-widest text-zinc-400 font-semibold">SOCIAL</ThemedText>
          <ThemedText className="text-base font-bold">Connections</ThemedText>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/find-people")}
          style={{
            width: 38, height: 38, borderRadius: 19,
            alignItems: "center", justifyContent: "center",
            backgroundColor: isDark ? zinc[800] : zinc[100],
            borderWidth: 1, borderColor: isDark ? zinc[700] : zinc[200],
          }}
        >
          <IconSymbol name="person.badge.plus" size={17} color={Colors[cs].icon} />
        </TouchableOpacity>
      </View>

      {/* ── Tab switcher ──────────────────────────────────────── */}
      <View
        className="flex-row mx-4 mt-3 rounded-2xl p-1"
        style={{ backgroundColor: isDark ? zinc[800] : zinc[100], borderWidth: 1, borderColor: isDark ? zinc[700] : zinc[200] }}
      >
        {(["followers", "following"] as Tab[]).map((tab) => {
          const count = tab === "followers" ? followers.length : following.length;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.7}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1, paddingVertical: 8, borderRadius: 14, alignItems: "center",
                backgroundColor: activeTab === tab
                  ? isDark ? brand[400] : brand[500]
                  : "transparent",
              }}
            >
              <ThemedText
                className="text-sm font-semibold capitalize"
                style={{
                  color: activeTab === tab
                    ? Colors[cs].primaryForeground
                    : isDark ? zinc[400] : zinc[500],
                }}
              >
                {tab === "followers" ? "Followers" : "Following"}
                {count > 0 ? ` (${count})` : ""}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── List ──────────────────────────────────────────────── */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 32,
            gap: 8,
          }}
        >
          {users.length === 0 && (
            <View className="items-center py-16">
              <IconSymbol name="person.2.fill" size={36} color={isDark ? zinc[700] : zinc[300]} />
              <ThemedText className="text-zinc-400 mt-3 text-sm text-center">
                {activeTab === "followers"
                  ? "Nobody follows you yet."
                  : "You're not following anyone yet."}
              </ThemedText>
              {activeTab === "following" && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/find-people")}
                  style={{
                    marginTop: 16, paddingHorizontal: 20, paddingVertical: 10,
                    borderRadius: 14, borderWidth: 1,
                    backgroundColor: isDark ? brand[400] : brand[500],
                    borderColor: isDark ? brand[400] : brand[500],
                  }}
                >
                  <ThemedText className="text-sm font-semibold" style={{ color: Colors[cs].primaryForeground }}>
                    Find People
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}

          {users.length > 0 && (
            <View style={{ ...card, overflow: "hidden" }}>
              {users.map((user, idx) => {
                const name = userDisplayName(user);
                const isPending = follow.isPending || unfollow.isPending;
                // For followers tab: isFollowing tells if we follow them back (also track local optimistic state)
                // For following tab: we're always following them
                const isFollowingUser = activeTab === "following" || followingIds.has(user.id);


                return (
                  <View
                    key={user.id}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 12,
                      paddingHorizontal: 16, paddingVertical: 14,
                      borderBottomWidth: idx < users.length - 1 ? 1 : 0,
                      borderBottomColor: isDark ? zinc[700] : zinc[200],
                    }}
                  >
                    <InitialsAvatar user={user} isDark={isDark} />

                    <View className="flex-1">
                      <ThemedText className="text-sm font-semibold">{name}</ThemedText>
                      {user.displayName && user.email && (
                        <ThemedText className="text-xs text-zinc-400">{user.email}</ThemedText>
                      )}
                      <ThemedText className="text-xs text-zinc-500 mt-0.5">
                        {user.followerCount} follower{user.followerCount !== 1 ? "s" : ""}
                      </ThemedText>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      disabled={isPending}
                      onPress={() => handleAction(user)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 7,
                        borderRadius: 12, borderWidth: 1,
                        backgroundColor: activeTab === "following"
                          ? "transparent"
                          : isDark ? brand[400] : brand[500],
                        borderColor: isDark ? brand[400] : brand[500],
                      }}
                    >
                      <ThemedText
                        className="text-xs font-semibold"
                        style={{
                          color: activeTab === "following"
                            ? isDark ? brand[400] : brand[500]
                            : Colors[cs].primaryForeground,
                        }}
                      >
                        {activeTab === "following"
                          ? "Following"
                          : isFollowingUser
                          ? "Unfollow"
                          : "Follow Back"}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </ThemedView>
  );
}
