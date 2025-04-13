import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants';

/**
 * 通用样式
 */
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 50,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxlarge,
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    height: 0,
  },
  scrollView: {
    flexGrow: 1,
  },
  detailContainer: {
    padding: SPACING.md,
  },
  movieImage: {
    width: '100%',
    height: 500,
    borderRadius: BORDER_RADIUS.large,
  },
  movieTitle: {
    fontSize: FONT_SIZES.xxxlarge,
    fontWeight: 'bold',
    marginVertical: SPACING.lg,
    textAlign: 'center',
    color: COLORS.text,
  },
  rating: {
    fontSize: FONT_SIZES.xlarge,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
  },
  detailList: {
    marginBottom: SPACING.lg,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.xs,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    color: COLORS.text,
  },
  playButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
  },
  playButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
  },
  bottomSheetContent: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.secondary,
  },
  bottomSheetBackground: {
    backgroundColor: COLORS.secondary,
  },
  bottomSheetIndicator: {
    backgroundColor: COLORS.textSecondary,
  },
  sheetHeader: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  playItem: {
    padding: SPACING.md,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.medium,
    marginVertical: SPACING.xs,
  },
  playText: {
    color: COLORS.text,
    textAlign: 'center',
    fontSize: FONT_SIZES.large,
  },
  context: {
    fontSize: FONT_SIZES.large,
    marginVertical: SPACING.lg,
    lineHeight: 24,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.large,
    color: COLORS.text,
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: 'transparent',
  },
  searchInput: {
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: SPACING.lg,
    height: 50,
    color: COLORS.text,
    fontSize: FONT_SIZES.large,
  },
  movieList: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  categoriesContainer: {
    paddingVertical: SPACING.md,
  },
  categoryGroup: {
    marginBottom: SPACING.lg,
  },
  categoryTitle: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
  },
  tabsScrollContainer: {
    paddingHorizontal: SPACING.sm,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: COLORS.border,
  },
  selectedTabItem: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    fontSize: FONT_SIZES.large,
    color: COLORS.text,
  },
  selectedTabText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  bottomSheetTitle: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: COLORS.border,
  },
  closeButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.medium,
  },
}); 