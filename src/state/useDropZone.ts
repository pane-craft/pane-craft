import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  type DropZonePosition,
  type DropZoneDropPayload,
} from '../types/DropZone.type';
import { type PaneId } from '../types/Pane.type';
import {
  type DropZoneHandlers,
  type UseDropZoneState,
} from '../types/useDropZone.type';
import { DragStateManager } from './DragStateManager';

/**
 * Options accepted by {@link useDropZone}.
 */
export type UseDropZoneOptions = {
  /** Identifier of the pane this overlay belongs to. */
  paneId: PaneId;

  /**
   * Shared drag state manager.
   *
   * @remarks
   * Pass the same instance used by the source pane so the overlay can see the
   * in-flight drag. When omitted, an internal manager is created and the
   * overlay will never fire because no drag will originate inside it.
   */
  manager?: DragStateManager;

  /**
   * Called when a dragged tab is dropped on one of the hook's zones.
   */
  onDrop?: (data: DropZoneDropPayload) => void;
};

/**
 * Return shape of {@link useDropZone}.
 */
export type UseDropZoneReturn = {
  /** Derived drag state for rendering. */
  state: UseDropZoneState;
  /**
   * Builds the set of HTML5 drag event handlers for an individual zone.
   * Spread the returned object onto the zone element.
   */
  getDropZoneHandlers: (pos: DropZonePosition) => DropZoneHandlers;
  /** The underlying drag state manager. Exposed for advanced consumers. */
  manager: DragStateManager;
};

/**
 * Connects a {@link DragStateManager} to React, producing event handlers for
 * a pane's drop zone overlay.
 *
 * @remarks
 * The hook is sends DOM events into the manager and exposes drag state for
 * rendering, but it doesn't decide what a drop means. The consumer wires up
 * `onDrop` to perform the actual move-or-split logic.
 *
 * Lifecycle of a zone drag:
 *
 * 1. `onDragOver` (zone) — measures the current zone, calls `preventDefault()`
 *    so the element accepts a drop, and pushes the zone into the manager via
 *    {@link DragStateManager.setDropZoneHover}.
 * 2. `onDragLeave` (zone) — clears the manager's `dropZoneHover` *only if* the
 *    current hover is still this zone. This guards against the common case
 *    where `dragleave` fires on the old zone after `dragover` on the new zone
 *    has already overwritten the manager state.
 * 3. `onDrop` (zone) — fires `onDrop` with the dragged tab and the zone's
 *    position, then calls {@link DragStateManager.end}.
 *
 * Foreign drags (e.g. files dragged in from the OS) are ignored — the hook
 * only calls `preventDefault()` while one of its own drags is in flight, so
 * the browser handles unrelated drags through its default behaviour.
 *
 * @param options - See {@link UseDropZoneOptions}.
 *
 * @example
 * ```tsx
 * const { state, getDropZoneHandlers } = useDropZone({
 *   paneId: 0,
 *   manager: dragManager,
 *   onDrop: ({ tab, sourcePaneId, pos }) => {
 *     if (pos === 'center') moveTab(sourcePaneId, 0, tab);
 *     else splitPane(0, sourcePaneId, pos, tab);
 *   },
 * });
 *
 * return (
 *   <div>
 *     {state.draggedTab !== null && (
 *       <div {...getDropZoneHandlers('center')} />
 *     )}
 *   </div>
 * );
 * ```
 */
export const useDropZone = (options: UseDropZoneOptions): UseDropZoneReturn => {
  const { paneId, manager: externalManager, onDrop } = options;

  const internalManager = useMemo(
    () => externalManager ?? new DragStateManager(),
    [externalManager],
  );

  const [dragState, setDragState] = useState(() => internalManager.getState());

  const [lastManager, setLastManager] = useState(internalManager);
  if (lastManager !== internalManager) {
    setLastManager(internalManager);
    setDragState(internalManager.getState());
  }

  useEffect(
    () =>
      internalManager.subscribe(() => {
        setDragState(internalManager.getState());
      }),
    [internalManager],
  );

  const handleDropZoneDragOver = useCallback(
    (e: React.DragEvent, pos: DropZonePosition) => {
      if (internalManager.getState().draggedTab === null) return;

      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';

      const current = internalManager.getState().dropZoneHover;
      if (current?.paneId === paneId && current.pos === pos) return;

      internalManager.setDropZoneHover({ paneId, pos });
    },
    [internalManager, paneId],
  );

  const handleDropZoneDragLeave = useCallback(
    (_e: React.DragEvent, pos: DropZonePosition) => {
      const current = internalManager.getState().dropZoneHover;
      if (current?.paneId === paneId && current.pos === pos) {
        internalManager.setDropZoneHover(null);
      }
    },
    [internalManager, paneId],
  );

  const handleDropZoneDrop = useCallback(
    (e: React.DragEvent, pos: DropZonePosition) => {
      e.preventDefault();
      e.stopPropagation();

      const { draggedTab, sourcePaneId } = internalManager.getState();
      if (draggedTab === null || sourcePaneId === null) {
        internalManager.end();
        return;
      }

      onDrop?.({
        tab: draggedTab,
        sourcePaneId,
        targetPaneId: paneId,
        pos,
      });
      internalManager.end();
    },
    [internalManager, paneId, onDrop],
  );

  const getDropZoneHandlers = useCallback(
    (pos: DropZonePosition): DropZoneHandlers => ({
      onDragOver: (e) => {
        handleDropZoneDragOver(e, pos);
      },
      onDragLeave: (e) => {
        handleDropZoneDragLeave(e, pos);
      },
      onDrop: (e) => {
        handleDropZoneDrop(e, pos);
      },
    }),
    [handleDropZoneDragOver, handleDropZoneDragLeave, handleDropZoneDrop],
  );

  const state: UseDropZoneState = {
    draggedTab: dragState.draggedTab,
    sourcePaneId: dragState.sourcePaneId,
    isDraggingFromThisPane:
      dragState.draggedTab !== null && dragState.sourcePaneId === paneId,
    dropZoneHover: dragState.dropZoneHover,
  };

  return {
    state,
    getDropZoneHandlers,
    manager: internalManager,
  };
};
