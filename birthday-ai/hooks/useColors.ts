import Colors, { ThemeColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export function useColors(): ThemeColors {
  const scheme = useColorScheme() ?? 'light';
  return Colors[scheme];
}
