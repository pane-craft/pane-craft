import type React from 'react';
import { useEffect, useState } from 'react';

import { useDropZone } from '../../state/useDropZone';
import '../../styles/tokens-primitive.css';
import '../../styles/tokens-semantic.css';
import {
  DROP_ZONE_POSITIONS,
  type DropZonePosition,
  type DropZoneProps,
} from '../../types/DropZone.type';
import styles from './DropZone.module.css';

export type { DropZoneProps } from '../../types/DropZone.type';

const DROP_ZONE_CLASS: Record<DropZonePosition, string> = {
  center: styles.zoneCenter,
  top: styles.zoneTop,
  bottom: styles.zoneBottom,
  left: styles.zoneLeft,
  right: styles.zoneRight,
};

/**
 * An overlay that exposes {@link DropZonePosition} regions inside a pane as
 * tab drop targets.
 *
 * @remarks
 * `DropZone` sits absolutely-positioned inside a pane and renders one of each
 * of the {@link DropZonePosition} regions. The overlay stays invisible and
 * ignores pointer events while no drag is in progress, and it remains
 * invisible while a drag is in flight if the pointer is outside the overlay's
 * bounding box. The zones only fade in once the dragged item enters the
 * overlay, and they highlight whichever zone the pointer is over.
 *
 * The component is headless with respect to the consequences of a drop: it
 * fires `onDrop` with the dragged tab and the zone that received it, but
 * never mutates the tab collection or splits the pane itself. The consumer
 * is expected to interpret edge drops as splits and the center drop as a
 * cross-pane move.
 *
 * The host element must be `position: relative` (or otherwise a containing
 * block) so that the overlay's `inset: 0` fills the pane. The component is
 * designed for consumers to place a single `DropZone` as the last child of a
 * `StaticTabPane`'s content region.
 *
 * @example
 * Single-pane move-only overlay (no split support):
 * ```tsx
 * const dragManager = useMemo(() => new DragStateManager(), []);
 *
 * return (
 *   <div style={{ position: 'relative' }}>
 *     <StaticTabPane dragAndDropManager={dragManager} ... />
 *     <DropZone
 *       paneId={0}
 *       dragAndDropManager={dragManager}
 *       dropZonePosList={['center']}
 *       onDrop={({ tab, sourcePaneId }) => moveTab(sourcePaneId, 0, tab)}
 *     />
 *   </div>
 * );
 * ```
 *
 * @see {@link DropZoneProps} for full prop documentation.
 */
export const DropZone: React.FC<DropZoneProps> = ({
  paneId = 0,
  dragAndDropManager,
  onDrop,
  dropZonePosList = DROP_ZONE_POSITIONS,
  edgeSize,
  className = '',
  a11y = {},
}) => {
  const { state, getDropZoneHandlers, manager } = useDropZone({
    paneId,
    manager: dragAndDropManager,
    onDrop,
  });

  const isDragging = state.draggedTab !== null;

  // Visible only when the pointer is currently inside the overlay during a
  // drag. The drag manager only knows that a drag is in flight, not where the
  // cursor is, so `isPointerInside` tracks entry/exit on the root here and is
  // reset by subscribing to the manager's DRAG_ENDED event.
  const [isPointerInside, setIsPointerInside] = useState(false);

  useEffect(
    () =>
      manager.on('DRAG_ENDED', () => {
        setIsPointerInside(false);
      }),
    [manager],
  );

  const handleRootDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    if (!isDragging) {
      return;
    }

    // `dragenter` bubbles from descendants — `relatedTarget` is the element
    // the pointer is leaving. If it's inside this root, this is an internal
    // transition (zone-to-zone) and we're already marked inside.
    const prev = e.relatedTarget as Node | null;
    if (prev !== null && e.currentTarget.contains(prev)) {
      return;
    }

    setIsPointerInside(true);
  };

  const handleRootDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    if (!isDragging) {
      return;
    }

    // `dragleave` bubbles too. `relatedTarget` is the element being entered;
    // ignore the event if the pointer is still within the overlay tree.
    const next = e.relatedTarget as Node | null;
    if (next !== null && e.currentTarget.contains(next)) {
      return;
    }

    setIsPointerInside(false);
  };

  const rootClasses = [styles.dropZone, className].filter(Boolean).join(' ');

  const rootStyle: React.CSSProperties = {};
  if (edgeSize !== undefined) {
    (rootStyle as Record<string, string>)['--pc-dropzone-edge-size'] = edgeSize;
  }

  return (
    <div
      className={rootClasses}
      style={rootStyle}
      data-testid="drop-zone"
      data-pane-id={paneId}
      data-is-dragging={isDragging}
      data-is-pointer-inside={isPointerInside}
      onDragEnter={handleRootDragEnter}
      onDragLeave={handleRootDragLeave}
      {...a11y}
    >
      {dropZonePosList.map((pos) => {
        const isHovered =
          state.dropZoneHover?.paneId === paneId &&
          state.dropZoneHover.pos === pos;
        const handlers = getDropZoneHandlers(pos);
        return (
          <div
            key={pos}
            className={[styles.zone, DROP_ZONE_CLASS[pos]].join(' ')}
            data-testid={`drop-zone-${pos}`}
            data-position={pos}
            data-is-hovered={isHovered}
            onDragOver={handlers.onDragOver}
            onDragLeave={handlers.onDragLeave}
            onDrop={handlers.onDrop}
          />
        );
      })}
    </div>
  );
};
