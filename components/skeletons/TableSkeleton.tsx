/**
 * TableSkeleton Component
 * Skeleton loader that mimics table structure
 * Used in listings and reports
 */

import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ============================================================================
// TYPES
// ============================================================================

interface TableSkeletonProps {
  /** Number of rows */
  rows?: number;
  /** Number of columns */
  columns?: number;
  /** Show table header */
  showHeader?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_VALUES = {
  ROWS: 5,
  COLUMNS: 4,
  SHOW_HEADER: true,
} as const;

const SKELETON_SIZES = {
  HEADER_CELL: 'h-4 w-24',
  BODY_CELL: 'h-4 w-full',
} as const;

const CLASSES = {
  CONTAINER: 'rounded-md border',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create array of specified length
 */
function createArray(length: number): number[] {
  return Array.from({ length }, (_, i) => i);
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Table header skeleton
 */
interface TableHeaderSkeletonProps {
  columns: number;
}

function TableHeaderSkeleton({ columns }: TableHeaderSkeletonProps) {
  const columnIndices = useMemo(() => createArray(columns), [columns]);

  return (
    <TableHeader>
      <TableRow>
        {columnIndices.map((i) => (
          <TableHead key={i}>
            <Skeleton className={SKELETON_SIZES.HEADER_CELL} />
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

/**
 * Table body skeleton
 */
interface TableBodySkeletonProps {
  rows: number;
  columns: number;
}

function TableBodySkeleton({ rows, columns }: TableBodySkeletonProps) {
  const rowIndices = useMemo(() => createArray(rows), [rows]);
  const columnIndices = useMemo(() => createArray(columns), [columns]);

  return (
    <TableBody>
      {rowIndices.map((rowIndex) => (
        <TableRow key={rowIndex}>
          {columnIndices.map((colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className={SKELETON_SIZES.BODY_CELL} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Skeleton loader that mimics table structure
 * Used in listings and reports
 */
export function TableSkeleton({
  rows = DEFAULT_VALUES.ROWS,
  columns = DEFAULT_VALUES.COLUMNS,
  showHeader = DEFAULT_VALUES.SHOW_HEADER,
}: TableSkeletonProps) {
  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={CLASSES.CONTAINER}>
      <Table>
        {showHeader && <TableHeaderSkeleton columns={columns} />}
        <TableBodySkeleton rows={rows} columns={columns} />
      </Table>
    </div>
  );
}
