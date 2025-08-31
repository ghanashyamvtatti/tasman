import React, { useState, useEffect } from 'react';
import { BoardInfo, getAllBoards, createNewBoard, deleteBoard, updateBoardTitle } from '../utils/storage';
import TasmanLogo from './TasmanLogo';
import CloudSync from './CloudSync';
import './BoardManager.css';

interface BoardManagerProps {
  onSelectBoard: (boardId: string) => void;
}

const BoardManager: React.FC<BoardManagerProps> = ({ onSelectBoard }) => {
  const [boards, setBoards] = useState<BoardInfo[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = () => {
    const allBoards = getAllBoards();
    setBoards(allBoards.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
  };

  const handleCreateBoard = () => {
    if (newBoardTitle.trim()) {
      createNewBoard(newBoardTitle.trim());
      setNewBoardTitle('');
      loadBoards();
    }
  };

  const handleDeleteBoard = (boardId: string, boardTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${boardTitle}"? This action cannot be undone.`)) {
      deleteBoard(boardId);
      loadBoards();
    }
  };

  const handleStartEdit = (boardId: string, currentTitle: string) => {
    setEditingBoardId(boardId);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = () => {
    if (editingBoardId && editTitle.trim()) {
      updateBoardTitle(editingBoardId, editTitle.trim());
      setEditingBoardId(null);
      setEditTitle('');
      loadBoards();
    }
  };

  const handleCancelEdit = () => {
    setEditingBoardId(null);
    setEditTitle('');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="board-manager">
      <div className="manager-header">
        <div className="header-content">
          <TasmanLogo size={64} />
          <div className="header-text">
            <h1>Tasman</h1>
            <p>Organize your projects with Kanban boards</p>
          </div>
        </div>
      </div>

      <div className="manager-content">
        <div className="create-board-section">
          <h2>Create New Board</h2>
          <div className="create-board-form">
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="Enter board name"
              className="board-name-input"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()}
              autoFocus
            />
            <button
              onClick={handleCreateBoard}
              className="create-board-btn"
              disabled={!newBoardTitle.trim()}
            >
              Create Board
            </button>
          </div>
        </div>

        <div className="cloud-sync-section">
          <CloudSync />
        </div>

        <div className="boards-section">
          <h2>Your Boards ({boards.length})</h2>
          {boards.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No boards yet. Create your first board to get started!</p>
            </div>
          ) : (
            <div className="boards-grid">
              {boards.map(board => (
                <div key={board.id} className="board-card">
                  <div className="board-card-header">
                    {editingBoardId === board.id ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="edit-input"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                          autoFocus
                        />
                        <div className="edit-actions">
                          <button onClick={handleSaveEdit} className="save-btn">Save</button>
                          <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="board-title">{board.title}</h3>
                        <div className="board-actions">
                          <button
                            onClick={() => handleStartEdit(board.id, board.title)}
                            className="edit-btn"
                            title="Edit board name"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteBoard(board.id, board.title)}
                            className="delete-btn"
                            title="Delete board"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {editingBoardId !== board.id && (
                    <>
                      <div className="board-meta">
                        <p className="board-date">
                          <span>Updated:</span> {formatDate(board.updatedAt)}
                        </p>
                        <p className="board-date">
                          <span>Created:</span> {formatDate(board.createdAt)}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => onSelectBoard(board.id)}
                        className="open-board-btn"
                      >
                        Open Board
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardManager;