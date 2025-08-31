import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface ColumnDropZoneProps {
  columnId: string;
}

const ColumnDropZone: React.FC<ColumnDropZoneProps> = ({ columnId }) => {
  const { setNodeRef, isOver, active } = useDroppable({
    id: `column-dropzone-${columnId}`
  });

  const isDragging = active !== null;
  const shouldShowDropIndicator = isOver && isDragging;

  return (
    <div
      ref={setNodeRef}
      className={`column-drop-zone ${isOver ? 'drag-over' : ''} ${isDragging ? 'drag-active' : ''}`}
    >
      {shouldShowDropIndicator ? (
        <div className="drop-indicator">Drop task here</div>
      ) : isDragging ? (
        <div className="drop-placeholder active">Drop area</div>
      ) : (
        <div className="drop-placeholder">Drop area</div>
      )}
    </div>
  );
};

export default ColumnDropZone;