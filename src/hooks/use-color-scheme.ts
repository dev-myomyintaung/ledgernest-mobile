import { useColorScheme as useNWColorScheme } from 'nativewind';

export function useColorScheme() {
    return useNWColorScheme().colorScheme;
}
