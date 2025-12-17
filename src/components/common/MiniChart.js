import React from 'react';
import { View } from 'react-native';
import { colors } from '../../constants/theme';

export const MiniChart = ({ data, color, height = 40 }) => {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data.map(Math.abs), 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginTop: 8 }}>
      {data.slice(-12).map((v, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            backgroundColor: v >= 0 ? color : colors.accent,
            height: Math.max(2, ((v - min) / range) * height),
            borderRadius: 2,
          }}
        />
      ))}
    </View>
  );
};

export default MiniChart;
