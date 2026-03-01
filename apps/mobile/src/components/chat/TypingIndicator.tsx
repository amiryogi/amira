import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

interface TypingIndicatorProps {
  typingUsers: { userId: string; userName: string }[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (typingUsers.length === 0) return;

    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -4,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      );

    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);
    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [typingUsers.length, dot1, dot2, dot3]);

  if (typingUsers.length === 0) return null;

  const name = typingUsers[0].userName;

  return (
    <View className="flex-row items-center px-4 py-1.5">
      <View className="flex-row items-center gap-0.5 mr-2">
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={{ transform: [{ translateY: dot }] }}
            className="w-1.5 h-1.5 rounded-full bg-gray-400"
          />
        ))}
      </View>
      <Text className="text-xs text-gray-400">{name} is typing...</Text>
    </View>
  );
}
