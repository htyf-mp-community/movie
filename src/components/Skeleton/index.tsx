import React from 'react';
import { View, StyleSheet } from 'react-native';
import tw from 'twrnc';
import { ActivityIndicator, Text } from 'react-native-paper';

interface SkeletonProps {
  loading?: boolean;
  children?: React.ReactNode;
}

const Skeleton: React.FC<SkeletonProps> = ({ loading = true, children }) => {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.skeletonItem}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonContent}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonInfo} />
        </View>
      </View>
      <View style={styles.skeletonItem}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonContent}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonInfo} />
        </View>
      </View>
      <View style={styles.skeletonItem}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonContent}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonInfo} />
        </View>
      </View>
      <View style={styles.skeletonItem}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonContent}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonInfo} />
        </View>
      </View>
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={tw`text-white mt-4`}>资源加载中，请耐心等待...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  skeletonItem: {
    width: '50%',
    padding: 5,
  },
  skeletonImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonContent: {
    padding: 5,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonInfo: {
    height: 12,
    backgroundColor: '#333',
    borderRadius: 4,
    width: '70%',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Skeleton; 