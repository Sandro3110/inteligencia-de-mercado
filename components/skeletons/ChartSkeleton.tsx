/**
 * ChartSkeleton Component
 * Skeleton loader that mimics chart structure
 * Used in dashboards and analytics
 */

import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// ============================================================================
// TYPES
// ============================================================================

type ChartType = 'bar' | 'line' | 'pie' | 'area';

interface ChartSkeletonProps {
  /** Chart type */
  type?: ChartType;
  /** Show header */
  showHeader?: boolean;
  /** Chart height */
  height?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_VALUES = {
  TYPE: 'bar' as ChartType,
  SHOW_HEADER: true,
  HEIGHT: 'h-80',
} as const;

const SKELETON_SIZES = {
  HEADER_TITLE: 'h-5 w-40',
  HEADER_SUBTITLE: 'h-3 w-64 mt-2',
  BAR_FULL: 'w-full h-full',
  BAR_3_4: 'w-full h-3/4',
  BAR_5_6: 'w-full h-5/6',
  BAR_4_5: 'w-full h-4/5',
  BAR_2_3: 'w-full h-2/3',
  BAR_1_2: 'w-full h-1/2',
  LINE_STROKE: 'w-full h-1',
  LINE_SEGMENT_1: 'w-1/2 h-1',
  LINE_SEGMENT_2: 'w-1/3 h-1',
  PIE: 'w-48 h-48 rounded-full',
  AREA_FILL: 'w-full h-2/3 opacity-30',
  AREA_LINE: 'w-full h-1',
} as const;

const CLASSES = {
  CARD: 'animate-pulse',
  CONTENT_WITH_HEADER: '',
  CONTENT_NO_HEADER: 'pt-6',
  CHART_CONTAINER: 'w-full flex items-end justify-around gap-2 px-4 pb-4',
  LINE_CONTAINER: 'w-full h-full relative',
  PIE_CONTAINER: 'w-full h-full flex items-center justify-center',
  AREA_CONTAINER: 'w-full h-full relative',
  POSITION_ABSOLUTE: 'absolute',
  POSITION_BOTTOM_0: 'bottom-0 left-0',
  POSITION_BOTTOM_1_4: 'bottom-1/4 left-1/4',
  POSITION_BOTTOM_1_2: 'bottom-1/2 left-1/2',
  POSITION_BOTTOM_2_3: 'bottom-2/3 left-0',
} as const;

const BAR_HEIGHTS = [
  SKELETON_SIZES.BAR_3_4,
  SKELETON_SIZES.BAR_FULL,
  SKELETON_SIZES.BAR_2_3,
  SKELETON_SIZES.BAR_4_5,
  SKELETON_SIZES.BAR_1_2,
  SKELETON_SIZES.BAR_5_6,
] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get content padding class based on header visibility
 */
function getContentClass(showHeader: boolean): string {
  return showHeader ? CLASSES.CONTENT_WITH_HEADER : CLASSES.CONTENT_NO_HEADER;
}

/**
 * Get chart container class with height
 */
function getChartContainerClass(height: string): string {
  return `${CLASSES.CHART_CONTAINER} ${height}`;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Chart header skeleton
 */
function ChartHeader() {
  return (
    <CardHeader>
      <Skeleton className={SKELETON_SIZES.HEADER_TITLE} />
      <Skeleton className={SKELETON_SIZES.HEADER_SUBTITLE} />
    </CardHeader>
  );
}

/**
 * Bar chart skeleton
 */
function BarChartSkeleton() {
  return (
    <>
      {BAR_HEIGHTS.map((height, index) => (
        <Skeleton key={index} className={height} />
      ))}
    </>
  );
}

/**
 * Line chart skeleton
 */
function LineChartSkeleton() {
  return (
    <div className={CLASSES.LINE_CONTAINER}>
      <Skeleton
        className={`${CLASSES.POSITION_ABSOLUTE} ${CLASSES.POSITION_BOTTOM_0} ${SKELETON_SIZES.LINE_STROKE}`}
      />
      <Skeleton
        className={`${CLASSES.POSITION_ABSOLUTE} ${CLASSES.POSITION_BOTTOM_1_4} ${SKELETON_SIZES.LINE_SEGMENT_1}`}
      />
      <Skeleton
        className={`${CLASSES.POSITION_ABSOLUTE} ${CLASSES.POSITION_BOTTOM_1_2} ${SKELETON_SIZES.LINE_SEGMENT_2}`}
      />
    </div>
  );
}

/**
 * Pie chart skeleton
 */
function PieChartSkeleton() {
  return (
    <div className={CLASSES.PIE_CONTAINER}>
      <Skeleton className={SKELETON_SIZES.PIE} />
    </div>
  );
}

/**
 * Area chart skeleton
 */
function AreaChartSkeleton() {
  return (
    <div className={CLASSES.AREA_CONTAINER}>
      <Skeleton
        className={`${CLASSES.POSITION_ABSOLUTE} ${CLASSES.POSITION_BOTTOM_0} ${SKELETON_SIZES.AREA_FILL}`}
      />
      <Skeleton
        className={`${CLASSES.POSITION_ABSOLUTE} ${CLASSES.POSITION_BOTTOM_2_3} ${SKELETON_SIZES.AREA_LINE}`}
      />
    </div>
  );
}

/**
 * Chart content based on type
 */
interface ChartContentProps {
  type: ChartType;
}

function ChartContent({ type }: ChartContentProps) {
  switch (type) {
    case 'bar':
      return <BarChartSkeleton />;
    case 'line':
      return <LineChartSkeleton />;
    case 'pie':
      return <PieChartSkeleton />;
    case 'area':
      return <AreaChartSkeleton />;
    default:
      return <BarChartSkeleton />;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Skeleton loader that mimics chart structure
 * Used in dashboards and analytics
 */
export function ChartSkeleton({
  type = DEFAULT_VALUES.TYPE,
  showHeader = DEFAULT_VALUES.SHOW_HEADER,
  height = DEFAULT_VALUES.HEIGHT,
}: ChartSkeletonProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const contentClass = useMemo(() => getContentClass(showHeader), [showHeader]);

  const chartContainerClass = useMemo(() => getChartContainerClass(height), [height]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card className={CLASSES.CARD}>
      {showHeader && <ChartHeader />}
      <CardContent className={contentClass}>
        <div className={chartContainerClass}>
          <ChartContent type={type} />
        </div>
      </CardContent>
    </Card>
  );
}
