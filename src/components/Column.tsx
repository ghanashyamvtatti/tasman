import React, { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column as ColumnType, Task, Priority } from '../types';
import TaskCard from './TaskCard';
import ColumnDropZone from './ColumnDropZone';
import './Column.css';

interface ColumnProps {
  column: ColumnType;
  onUpdateColumn: (columnId: string, newTitle: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddTask: (columnId: string, title: string, priority: Priority) => void;
  onUpdateTask: (columnId: string, taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (columnId: string, taskId: string) => void;
  onAddSubTask: (columnId: string, taskId: string, title: string, priority: Priority) => void;
}

const Column: React.FC<ColumnProps> = ({
  column,
  onUpdateColumn,
  onDeleteColumn,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddSubTask
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [showAddTask, setShowAddTask] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: `column-${column.id}`
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleTitleSubmit = () => {
    if (editTitle.trim() && editTitle.trim() !== column.title) {
      onUpdateColumn(column.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(column.id, newTaskTitle.trim(), newTaskPriority);
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      setShowAddTask(false);
    }
  };

  const handleDeleteColumn = () => {
    if (window.confirm(`Are you sure you want to delete "${column.title}" column?`)) {
      onDeleteColumn(column.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="column"
    >
      <div className="column-header">
        <div 
          className="column-title-section" 
          {...attributes} 
          {...listeners}
          style={{ touchAction: 'none' }}
          title="Drag to reorder columns"
        >
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyPress={(e) => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              className="column-title-input"
            />
          ) : (
            <h3
              className="column-title"
              onDoubleClick={() => setIsEditing(true)}
            >
              {column.title}
            </h3>
          )}
        </div>
        <div className="column-actions">
          <button
            className="edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            title="Edit column name"
          >
            ✏️
          </button>
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteColumn();
            }}
            title="Delete column"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="column-content">
        <SortableContext
          items={column.tasks.map(task => `task-${task.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="tasks">
            {column.tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                columnId={column.id}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onAddSubTask={onAddSubTask}
              />
            ))}
          </div>
        </SortableContext>
        
        <ColumnDropZone columnId={column.id} />

        {showAddTask ? (
          <div className="add-task-form">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              className="task-input"
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
              className="priority-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <div className="form-actions">
              <button onClick={handleAddTask} className="add-btn">Add</button>
              <button
                onClick={() => {
                  setShowAddTask(false);
                  setNewTaskTitle('');
                  setNewTaskPriority('medium');
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="add-task-btn"
            onClick={() => setShowAddTask(true)}
          >
            + Add Task
          </button>
        )}
      </div>
    </div>
  );
};

export default Column;