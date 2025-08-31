import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { SubTask, Priority } from '../types';
import './SubTaskItem.css';

interface SubTaskItemProps {
  subTask: SubTask;
  onUpdate: (subTaskId: string, updates: Partial<SubTask>) => void;
  onDelete: (subTaskId: string) => void;
}

const SubTaskItem: React.FC<SubTaskItemProps> = ({
  subTask,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subTask.title);
  const [editPriority, setEditPriority] = useState(subTask.priority);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: `subtask-${subTask.id}`
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `subtask-${subTask.id}`
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const getPriorityEmoji = (priority: Priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(subTask.id, {
        title: editTitle.trim(),
        priority: editPriority
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(subTask.title);
    setEditPriority(subTask.priority);
    setIsEditing(false);
  };

  const handleToggleComplete = () => {
    onUpdate(subTask.id, { completed: !subTask.completed });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${subTask.title}"?`)) {
      onDelete(subTask.id);
    }
  };

  return (
    <div
      ref={(node) => {
        setSortableRef(node);
        setDroppableRef(node);
      }}
      style={style}
      className={`subtask-item ${subTask.completed ? 'completed' : ''} priority-${subTask.priority}`}
    >
      {isEditing ? (
        <div className="subtask-edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="subtask-title-input"
            placeholder="Subtask title"
          />
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value as Priority)}
            className="priority-select small"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="edit-actions">
            <button onClick={handleSave} className="save-btn small">Save</button>
            <button onClick={handleCancel} className="cancel-btn small">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="subtask-content">
          <div className="subtask-left">
            <div className="subtask-drag-handle" {...attributes} {...listeners}>
              ⋮
            </div>
            <input
              type="checkbox"
              checked={subTask.completed}
              onChange={handleToggleComplete}
              className="subtask-checkbox"
            />
            <span 
              className="priority-indicator small"
              style={{ color: getPriorityColor(subTask.priority) }}
            >
              {getPriorityEmoji(subTask.priority)}
            </span>
            <span className={`subtask-title ${subTask.completed ? 'completed' : ''}`}>
              {subTask.title}
            </span>
          </div>
          
          <div className="subtask-actions">
            <button
              className="edit-subtask-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              title="Edit subtask"
            >
              ✏️
            </button>
            <button
              className="delete-subtask-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              title="Delete subtask"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubTaskItem;