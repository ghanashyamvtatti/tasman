import React, { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task, Priority, SubTask } from '../types';
import SubTaskItem from './SubTaskItem';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  columnId: string;
  onUpdateTask: (columnId: string, taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (columnId: string, taskId: string) => void;
  onAddSubTask: (columnId: string, taskId: string, title: string, priority: Priority) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  columnId,
  onUpdateTask,
  onDeleteTask,
  onAddSubTask
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState(task.priority);
  const [showSubTasks, setShowSubTasks] = useState(task.subTasks.length > 0);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [newSubTaskPriority, setNewSubTaskPriority] = useState<Priority>('medium');
  const [showAddSubTask, setShowAddSubTask] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: `task-${task.id}`
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `task-${task.id}`
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
      onUpdateTask(columnId, task.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      onDeleteTask(columnId, task.id);
    }
  };

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim()) {
      onAddSubTask(columnId, task.id, newSubTaskTitle.trim(), newSubTaskPriority);
      setNewSubTaskTitle('');
      setNewSubTaskPriority('medium');
      setShowAddSubTask(false);
      setShowSubTasks(true); // Show subtasks when a new one is added
    }
  };

  const handleSubTaskUpdate = (subTaskId: string, updates: Partial<SubTask>) => {
    const updatedSubTasks = task.subTasks.map(st =>
      st.id === subTaskId ? { ...st, ...updates } : st
    );
    onUpdateTask(columnId, task.id, { subTasks: updatedSubTasks });
  };

  const handleSubTaskDelete = (subTaskId: string) => {
    const updatedSubTasks = task.subTasks.filter(st => st.id !== subTaskId);
    onUpdateTask(columnId, task.id, { subTasks: updatedSubTasks });
  };

  const completedSubTasks = task.subTasks.filter(st => st.completed).length;
  const totalSubTasks = task.subTasks.length;

  return (
    <div
      ref={(node) => {
        setSortableRef(node);
        setDroppableRef(node);
      }}
      style={style}
      className={`task-card priority-${task.priority}`}
    >
      {isEditing ? (
        <div className="task-edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="task-title-input"
            placeholder="Task title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="task-description-input"
            placeholder="Task description (optional)"
            rows={3}
          />
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value as Priority)}
            className="priority-select"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <div className="edit-actions">
            <button onClick={handleSave} className="save-btn">Save</button>
            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="task-header">
            <div className="task-left">
              <div 
                className="drag-handle" 
                {...attributes} 
                {...listeners}
                style={{ touchAction: 'none' }}
                title="Drag to move task"
              >
                ⋮⋮
              </div>
              <div className="task-priority">
                <span 
                  className="priority-indicator"
                  style={{ color: getPriorityColor(task.priority) }}
                >
                  {getPriorityEmoji(task.priority)}
                </span>
                <span className="priority-text">{task.priority}</span>
              </div>
            </div>
            <div className="task-actions">
              <button
                className="edit-task-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                title="Edit task"
              >
                ✏️
              </button>
              <button
                className="delete-task-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                title="Delete task"
              >
                🗑️
              </button>
            </div>
          </div>

          <h4 className="task-title">{task.title}</h4>
          
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          {totalSubTasks > 0 && (
            <div className="subtask-summary">
              <button
                className="subtask-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSubTasks(!showSubTasks);
                }}
              >
                {showSubTasks ? '▼' : '▶'} {completedSubTasks}/{totalSubTasks} subtasks
              </button>
            </div>
          )}

          {showSubTasks && (
            <SortableContext
              items={task.subTasks.map(subTask => `subtask-${subTask.id}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="subtasks">
                {task.subTasks.map(subTask => (
                  <SubTaskItem
                    key={subTask.id}
                    subTask={subTask}
                    onUpdate={handleSubTaskUpdate}
                    onDelete={handleSubTaskDelete}
                  />
                ))}
              </div>
            </SortableContext>
          )}

          <div className="task-footer">
            {showAddSubTask ? (
              <div className="add-subtask-form">
                <input
                  type="text"
                  value={newSubTaskTitle}
                  onChange={(e) => setNewSubTaskTitle(e.target.value)}
                  placeholder="Subtask title"
                  className="subtask-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubTask()}
                  autoFocus
                />
                <select
                  value={newSubTaskPriority}
                  onChange={(e) => setNewSubTaskPriority(e.target.value as Priority)}
                  className="priority-select small"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <div className="subtask-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddSubTask();
                    }} 
                    className="add-btn small"
                  >
                    Add
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddSubTask(false);
                      setNewSubTaskTitle('');
                      setNewSubTaskPriority('medium');
                    }}
                    className="cancel-btn small"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="add-subtask-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddSubTask(true);
                }}
              >
                + Add Subtask
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TaskCard;