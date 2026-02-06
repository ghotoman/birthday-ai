import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { useColors } from '@/hooks';
import { palette } from '@/constants/Colors';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

const SIZES: Record<AvatarSize, number> = {
  sm: 36,
  md: 48,
  lg: 64,
  xl: 80,
};

const FONT_SIZES: Record<AvatarSize, number> = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
};

const AVATAR_COLORS = [
  palette.primary400,
  palette.secondary400,
  palette.accent400,
  '#34D399',
  '#60A5FA',
  '#F472B6',
  '#A78BFA',
  '#FB923C',
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({ name, imageUrl, size = 'md', style }: AvatarProps) {
  const dim = SIZES[size];
  const fontSize = FONT_SIZES[size];

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
          } as ImageStyle,
          style as ImageStyle,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: getColorForName(name),
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text style={{ color: '#FFF', fontSize, fontWeight: '600' }}>
        {getInitials(name)}
      </Text>
    </View>
  );
}
