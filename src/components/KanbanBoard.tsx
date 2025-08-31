import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Board, Column as ColumnType, Task } from '../types';
import { saveBoardById, loadBoardById, getAllBoards, updateBoardTitle } from '../utils/storage';
import Column from './Column';
import TasmanLogo from './TasmanLogo';
import CloudSync from './CloudSync';
import './KanbanBoard.css';

interface KanbanBoardProps {
  boardId: string;
  onBackToManager: () => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ boardId, onBackToManager }) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isEditingBoardTitle, setIsEditingBoardTitle] = useState(false);
  const [editBoardTitle, setEditBoardTitle] = useState('');
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    // Load the specific board when boardId changes
    const loadedBoard = loadBoardById(boardId);
    if (loadedBoard) {
      setBoard(loadedBoard);
    } else {
      // If board doesn't exist, go back to manager
      console.log('Board not found:', boardId);
      onBackToManager();
    }
  }, [boardId, onBackToManager]);

  useEffect(() => {
    // Save board whenever it changes
    if (board) {
      saveBoardById(boardId, board);
    }
  }, [board, boardId]);

  // Helper function to find task location
  const findTaskLocation = (taskId: string, isSubTask: boolean) => {
    if (!board) return null;
    
    for (const column of board.columns) {
      if (isSubTask) {
        // Look for subtask
        for (const task of column.tasks) {
          const subTaskIndex = task.subTasks.findIndex(st => st.id === taskId);
          if (subTaskIndex !== -1) {
            return {
              columnId: column.id,
              parentTaskId: task.id,
              taskIndex: -1,
              subTaskIndex,
              item: task.subTasks[subTaskIndex]
            };
          }
        }
      } else {
        // Look for regular task
        const taskIndex = column.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          return {
            columnId: column.id,
            parentTaskId: null,
            taskIndex,
            subTaskIndex: -1,
            item: column.tasks[taskIndex]
          };
        }
      }
    }
    return null;
  };

  // Move regular task to another column (tasks can only move between columns)
  const moveTaskToColumn = (taskId: string, sourceInfo: any, targetColumnId: string) => {
    if (!board) return;
    
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      
      const newColumns = [...prevBoard.columns];
      const sourceColumnIndex = newColumns.findIndex(col => col.id === sourceInfo.columnId);
      const targetColumnIndex = newColumns.findIndex(col => col.id === targetColumnId);
      
      // Remove task from source column
      const taskToMove = newColumns[sourceColumnIndex].tasks[sourceInfo.taskIndex];
      newColumns[sourceColumnIndex].tasks.splice(sourceInfo.taskIndex, 1);
      
      // Add task to target column
      newColumns[targetColumnIndex].tasks.push(taskToMove);
      
      return { ...prevBoard, columns: newColumns };
    });
  };

  // Move subtask to be under another task (subtasks can only move between parent tasks)
  const moveSubTaskToTask = (taskId: string, sourceInfo: any, targetTaskId: string, targetColumnId: string) => {
    if (!board) return;
    
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      
      const newColumns = [...prevBoard.columns];
      const sourceColumnIndex = newColumns.findIndex(col => col.id === sourceInfo.columnId);
      const targetColumnIndex = newColumns.findIndex(col => col.id === targetColumnId);
      
      // Remove subtask from source parent
      const sourceParentTask = newColumns[sourceColumnIndex].tasks.find(t => t.id === sourceInfo.parentTaskId);
      if (!sourceParentTask) return prevBoard;
      
      const subTaskToMove = sourceParentTask.subTasks[sourceInfo.subTaskIndex];
      sourceParentTask.subTasks.splice(sourceInfo.subTaskIndex, 1);
      
      // Add subtask to target parent
      const targetParentTask = newColumns[targetColumnIndex].tasks.find(t => t.id === targetTaskId);
      if (targetParentTask) {
        targetParentTask.subTasks.push(subTaskToMove);
      }
      
      return { ...prevBoard, columns: newColumns };
    });
  };

  // Reorder tasks within the same column
  const reorderTasks = (sourceInfo: any, targetInfo: any) => {
    if (!board) return;
    
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      
      const newColumns = [...prevBoard.columns];
      const columnIndex = newColumns.findIndex(col => col.id === sourceInfo.columnId);
      
      const tasks = [...newColumns[columnIndex].tasks];
      const [movedTask] = tasks.splice(sourceInfo.taskIndex, 1);
      tasks.splice(targetInfo.taskIndex, 0, movedTask);
      
      newColumns[columnIndex] = { ...newColumns[columnIndex], tasks };
      
      return { ...prevBoard, columns: newColumns };
    });
  };

  // Reorder subtasks within the same parent task
  const reorderSubTasks = (sourceInfo: any, targetInfo: any) => {
    if (!board) return;
    
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      
      const newColumns = [...prevBoard.columns];
      const columnIndex = newColumns.findIndex(col => col.id === sourceInfo.columnId);
      const taskIndex = newColumns[columnIndex].tasks.findIndex(task => task.id === sourceInfo.parentTaskId);
      
      const subTasks = [...newColumns[columnIndex].tasks[taskIndex].subTasks];
      const [movedSubTask] = subTasks.splice(sourceInfo.subTaskIndex, 1);
      subTasks.splice(targetInfo.subTaskIndex, 0, movedSubTask);
      
      newColumns[columnIndex].tasks[taskIndex] = {
        ...newColumns[columnIndex].tasks[taskIndex],
        subTasks
      };
      
      return { ...prevBoard, columns: newColumns };
    });
  };

  // Reorder columns
  const reorderColumns = (activeId: string, overId: string) => {
    if (!board) return;
    
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      
      const newColumns = [...prevBoard.columns];
      const activeIndex = newColumns.findIndex(col => col.id === activeId);
      const overIndex = newColumns.findIndex(col => col.id === overId);
      
      const [movedColumn] = newColumns.splice(activeIndex, 1);
      newColumns.splice(overIndex, 0, movedColumn);
      
      return { ...prevBoard, columns: newColumns };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId.startsWith('task-') || activeId.startsWith('subtask-')) {
      const taskId = activeId.startsWith('task-') ? activeId.replace('task-', '') : activeId.replace('subtask-', '');
      const isSubTask = activeId.startsWith('subtask-');
      
      // Find source location
      const sourceInfo = findTaskLocation(taskId, isSubTask);
      if (!sourceInfo) return;
      
      if (isSubTask) {
        // SUBTASKS: Can only be moved under other tasks, not to columns
        if (overId.startsWith('task-')) {
          // Moving subtask to another task
          const targetTaskId = overId.replace('task-', '');
          const targetInfo = findTaskLocation(targetTaskId, false);
          if (targetInfo && (sourceInfo.columnId !== targetInfo.columnId || sourceInfo.parentTaskId !== targetTaskId)) {
            moveSubTaskToTask(taskId, sourceInfo, targetTaskId, targetInfo.columnId);
          }
        } else if (overId.startsWith('subtask-')) {
          // Moving subtask to be under the parent of another subtask OR reordering within same parent
          const targetSubTaskId = overId.replace('subtask-', '');
          const targetInfo = findTaskLocation(targetSubTaskId, true);
          if (targetInfo && targetInfo.parentTaskId) {
            if (sourceInfo.parentTaskId === targetInfo.parentTaskId) {
              // Reordering subtasks within the same parent task
              reorderSubTasks(sourceInfo, targetInfo);
            } else {
              // Moving subtask to a different parent task
              moveSubTaskToTask(taskId, sourceInfo, targetInfo.parentTaskId, targetInfo.columnId);
            }
          }
        }
        // Note: Subtasks dropped on columns are ignored (no conversion allowed)
      } else {
        // REGULAR TASKS: Can be reordered within columns or moved between columns
        if (overId.startsWith('column-dropzone-')) {
          // Moving task to another column
          const targetColumnId = overId.replace('column-dropzone-', '');
          if (sourceInfo.columnId !== targetColumnId) {
            moveTaskToColumn(taskId, sourceInfo, targetColumnId);
          }
        } else if (overId.startsWith('column-')) {
          // Moving task to another column (fallback for column header drops)
          const targetColumnId = overId.replace('column-', '');
          if (sourceInfo.columnId !== targetColumnId) {
            moveTaskToColumn(taskId, sourceInfo, targetColumnId);
          }
        } else if (overId.startsWith('task-')) {
          // Reordering tasks within the same column
          const targetTaskId = overId.replace('task-', '');
          const targetInfo = findTaskLocation(targetTaskId, false);
          if (targetInfo && sourceInfo.columnId === targetInfo.columnId) {
            reorderTasks(sourceInfo, targetInfo);
          }
        }
        // Note: Tasks dropped on other tasks/subtasks from different columns are ignored (no conversion allowed)
      }
    } else if (activeId.startsWith('column-')) {
      const activeColumnId = activeId.replace('column-', '');
      const overColumnId = overId.replace('column-', '');
      
      if (activeColumnId !== overColumnId) {
        reorderColumns(activeColumnId, overColumnId);
      }
    }
  };

  const addColumn = () => {
    if (!board || !newColumnTitle.trim()) return;
    
    const newColumn: ColumnType = {
      id: `column-${Date.now()}`,
      title: newColumnTitle.trim(),
      tasks: []
    };
    
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      return {
        ...prevBoard,
        columns: [...prevBoard.columns, newColumn]
      };
    });
    
    setNewColumnTitle('');
    setShowAddColumnModal(false);
  };

  const handleBoardTitleEdit = () => {
    if (!board) return;
    setEditBoardTitle(board.title);
    setIsEditingBoardTitle(true);
  };

  const handleBoardTitleSubmit = () => {
    if (!board || !editBoardTitle.trim()) return;
    
    updateBoardTitle(boardId, editBoardTitle.trim());
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      return {
        ...prevBoard,
        title: editBoardTitle.trim()
      };
    });
    setIsEditingBoardTitle(false);
  };

  const handleBoardTitleCancel = () => {
    setIsEditingBoardTitle(false);
    setEditBoardTitle('');
  };

  const updateColumn = (columnId: string, newTitle: string) => {
    if (!board) return;
    
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      return {
        ...prevBoard,
        columns: prevBoard.columns.map(col =>
          col.id === columnId ? { ...col, title: newTitle } : col
        )
      };
    });
  };

  const deleteColumn = (columnId: string) => {
    if (!board) return;
    
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      return {
        ...prevBoard,
        columns: prevBoard.columns.filter(col => col.id !== columnId)
      };
    });
  };

  const addTask = (columnId: string, title: string, priority: 'low' | 'medium' | 'high') => {
    if (!board) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      priority,
      subTasks: []
    };
    
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      return {
        ...prevBoard,
        columns: prevBoard.columns.map(col =>
          col.id === columnId
            ? { ...col, tasks: [...col.tasks, newTask] }
            : col
        )
      };
    });
  };

  const updateTask = (columnId: string, taskId: string, updates: Partial<Task>) => {
    if (!board) return;
    
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      return {
        ...prevBoard,
        columns: prevBoard.columns.map(col =>
          col.id === columnId
            ? {
                ...col,
                tasks: col.tasks.map(task =>
                  task.id === taskId ? { ...task, ...updates } : task
                )
              }
            : col
        )
      };
    });
  };

  const deleteTask = (columnId: string, taskId: string) => {
    if (!board) return;
    
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      return {
        ...prevBoard,
        columns: prevBoard.columns.map(col =>
          col.id === columnId
            ? { ...col, tasks: col.tasks.filter(task => task.id !== taskId) }
            : col
        )
      };
    });
  };

  const addSubTask = (columnId: string, taskId: string, title: string, priority: 'low' | 'medium' | 'high') => {
    if (!board) return;
    const newSubTask = {
      id: `subtask-${Date.now()}`,
      title,
      priority,
      completed: false
    };
    
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      return {
        ...prevBoard,
        columns: prevBoard.columns.map(col =>
          col.id === columnId
            ? {
                ...col,
                tasks: col.tasks.map(task =>
                  task.id === taskId
                    ? { ...task, subTasks: [...task.subTasks, newSubTask] }
                    : task
                )
              }
            : col
        )
      };
    });
  };

  if (!board) {
    return (
      <div className="kanban-board">
        <div className="board-header">
          <div className="board-title-section">
            <TasmanLogo size={48} />
            <h1>Loading...</h1>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="kanban-board">
      <div className="board-header">
        <div className="board-title-section">
          <TasmanLogo size={48} />
          {isEditingBoardTitle ? (
            <div className="board-title-edit">
              <input
                type="text"
                value={editBoardTitle}
                onChange={(e) => setEditBoardTitle(e.target.value)}
                onBlur={handleBoardTitleSubmit}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleBoardTitleSubmit();
                  if (e.key === 'Escape') handleBoardTitleCancel();
                }}
                className="board-title-input"
                autoFocus
              />
            </div>
          ) : (
            <h1 
              className="board-title-clickable"
              onDoubleClick={handleBoardTitleEdit}
              title="Double-click to edit"
            >
              {board.title}
            </h1>
          )}
          <div className="header-controls">
            <CloudSync compact />
            <button 
              className="back-to-manager-btn"
              onClick={onBackToManager}
              title="Board Manager"
            >
              {getAllBoards().length > 1 ? '📋 All Boards' : '📋 Board Manager'}
            </button>
          </div>
        </div>
      </div>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="board-columns">
          <SortableContext
            items={board.columns.map(col => `column-${col.id}`)}
            strategy={horizontalListSortingStrategy}
          >
            {board.columns.map(column => (
              <Column
                key={column.id}
                column={column}
                onUpdateColumn={updateColumn}
                onDeleteColumn={deleteColumn}
                onAddTask={addTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onAddSubTask={addSubTask}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {/* Floating Add Column Button */}
      <button
        className="floating-add-button"
        onClick={() => setShowAddColumnModal(true)}
        title="Add Column"
      >
        +
      </button>

      {/* Add Column Modal */}
      {showAddColumnModal && (
        <div className="modal-overlay" onClick={() => setShowAddColumnModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Column</h3>
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="Enter column name"
              className="modal-input"
              onKeyPress={(e) => e.key === 'Enter' && addColumn()}
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={addColumn} disabled={!newColumnTitle.trim()}>
                Add Column
              </button>
              <button onClick={() => {
                setShowAddColumnModal(false);
                setNewColumnTitle('');
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;