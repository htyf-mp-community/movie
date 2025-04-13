import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 底部弹窗组件属性接口
 * @interface CustomBottomSheetProps
 */
interface CustomBottomSheetProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  snapPoints?: string[];
}

/**
 * 底部弹窗组件
 * 用于显示底部弹窗内容
 * @component CustomBottomSheet
 */
const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  title,
  children,
  onClose,
  snapPoints = ['50%', '75%'],
}) => {
  const { bottom } = useSafeAreaInsets();
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  /**
   * 渲染底部背景
   */
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        style={[props.style]}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  /**
   * 处理关闭
   */
  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
    onClose();
  }, [onClose]);

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.bottomSheetIndicator}
    >
      <View style={[styles.bottomSheetContent, { paddingBottom: bottom }]}>
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>{title}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Text style={styles.closeButtonText}>关闭</Text>
          </TouchableOpacity>
        </View>
        {children}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#1a1a1a',
  },
  bottomSheetIndicator: {
    backgroundColor: '#fff',
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 15,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default CustomBottomSheet; 