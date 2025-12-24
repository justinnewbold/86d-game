// ============================================
// COMMON COMPONENTS BARREL EXPORT
// ============================================

export { ErrorBoundary } from './ErrorBoundary';
export { MiniChart } from './MiniChart';
export { ConfirmDialog } from './ConfirmDialog';
export { AccessibleButton } from './AccessibleButton';
export { StatCard } from './StatCard';
export { NotificationToast } from './NotificationToast';
export { ProgressBar } from './ProgressBar';
export { ModalWrapper } from './ModalWrapper';

// New components
export { ScreenErrorBoundary } from './ScreenErrorBoundary';
export {
  Skeleton,
  SkeletonCard,
  SkeletonStatRow,
  SkeletonList,
  LoadingSpinner,
  FullScreenLoading,
  SkeletonDashboard,
  AIResponseLoading,
} from './LoadingStates';
export { AchievementNotification, AchievementToast } from './AchievementNotification';

// Accessibility components
export * from './A11yWrapper';
