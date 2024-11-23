import React from 'react';
import { Text } from 'react-native';
import { theme } from '../../utils';

const padTime2 = (str: string) => {
  return str.length < 2 ? `0${str}` : str;
};

const formatTime = (time = 0) => {
  time = Math.max(time, 0);

  const formattedHours = padTime2(Math.floor(time / 3600).toFixed(0));
  const formattedMinutes = padTime2((Math.floor(time / 60) % 60).toFixed(0));
  const formattedSeconds = padTime2(Math.floor(time % 60).toFixed(0));
  if (formattedHours === '00') {
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

export const ControlTimer: React.FC<{ time: number }> = ({ time }) => {
  return (
    <Text
      style={{
        color: theme.whiteA(),
        fontSize: 12,
      }}>
      {formatTime(time)}
    </Text>
  );
};
