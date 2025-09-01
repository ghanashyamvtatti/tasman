import React, { useState, useEffect, useCallback } from 'react';
import { BoardInfo, getAllBoards } from '../utils/storage';
import { cloudStorageManager } from '../services/cloudStorage';
import { googleDriveManager } from '../services/googleDrive';
import { useCloudSync } from '../contexts/CloudSyncContext';
import TasmanLogo from './TasmanLogo';
import CloudSync from './CloudSync';
import ShareBoard from './ShareBoard';
import Instructions from './Instructions';
import PrivacyPolicy from './PrivacyPolicy';
import './BoardManager.css';

interface BoardManagerProps {
  onSelectBoard: (boardId: string) => void;
}

const BoardManager: React.FC<BoardManagerProps> = ({ onSelectBoard }) => {
  const [boards, setBoards] = useState<BoardInfo[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedBoardForShare, setSelectedBoardForShare] = useState<{ id: string; title: string } | null>(null);
  const [sharedBoards, setSharedBoards] = useState<Array<{id: string; name: string; owner: string; modifiedTime: string}>>([]);
  const [currentView, setCurrentView] = useState<'boards' | 'instructions' | 'privacy'>('boards');
  const { status } = useCloudSync();

  const loadBoards = () => {
    const allBoards = getAllBoards();
    setBoards(allBoards.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
  };

  const loadSharedBoards = useCallback(async () => {
    try {
      const shared = await googleDriveManager.listSharedBoards();
      setSharedBoards(shared);
    } catch (error) {
      setSharedBoards([]);
    }
  }, []);

  useEffect(() => {
    loadBoards();
    if (status.isSignedIn) {
      loadSharedBoards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status.isSignedIn) {
      loadSharedBoards();
    } else {
      setSharedBoards([]);
    }
  }, [status.isSignedIn, loadSharedBoards]);

  const handleCreateBoard = async () => {
    if (newBoardTitle.trim()) {
      await cloudStorageManager.createBoard(newBoardTitle.trim());
      setNewBoardTitle('');
      loadBoards();
    }
  };

  const handleDeleteBoard = async (boardId: string, boardTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${boardTitle}"? This action cannot be undone.`)) {
      await cloudStorageManager.deleteBoard(boardId);
      loadBoards();
    }
  };

  const handleStartEdit = (boardId: string, currentTitle: string) => {
    setEditingBoardId(boardId);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = async () => {
    if (editingBoardId && editTitle.trim()) {
      await cloudStorageManager.updateBoardTitle(editingBoardId, editTitle.trim());
      setEditingBoardId(null);
      setEditTitle('');
      loadBoards();
    }
  };

  const handleCancelEdit = () => {
    setEditingBoardId(null);
    setEditTitle('');
  };

  const handleShareBoard = (boardId: string, boardTitle: string) => {
    setSelectedBoardForShare({ id: boardId, title: boardTitle });
    setShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
    setSelectedBoardForShare(null);
  };

  const handleOpenSharedBoard = async (sharedBoardId: string) => {
    try {
      // Download the shared board and save it locally
      const sharedBoard = await googleDriveManager.downloadSharedBoard(sharedBoardId);
      if (sharedBoard) {
        onSelectBoard(sharedBoard.id);
      } else {
      }
    } catch (error) {
    }
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

  // Handle navigation between views
  if (currentView === 'instructions') {
    return <Instructions onBack={() => setCurrentView('boards')} />;
  }

  if (currentView === 'privacy') {
    return <PrivacyPolicy onBack={() => setCurrentView('boards')} />;
  }

  return (
    <div className="board-manager">
      <div className="manager-header">
        <div className="header-content">
          <TasmanLogo size={64} />
          <div className="header-text">
            <h1>Tasman</h1>
            <p>Organize your projects with Kanban boards</p>
          </div>
          <div className="header-nav">
            <button
              className="nav-button help-button"
              onClick={() => setCurrentView('instructions')}
              title="How to use Tasman"
            >
              <span className="nav-icon">❓</span>
              <span className="nav-text">Help</span>
            </button>
            <button
              className="nav-button privacy-button"
              onClick={() => setCurrentView('privacy')}
              title="Privacy Policy"
            >
              <span className="nav-icon">🔒</span>
              <span className="nav-text">Privacy</span>
            </button>
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
                          {status.isSignedIn && (
                            <button
                              onClick={() => handleShareBoard(board.id, board.title)}
                              className="share-btn"
                              title="Share board"
                            >
                              👥
                            </button>
                          )}
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

        {status.isSignedIn && sharedBoards.length > 0 && (
          <div className="shared-boards-section">
            <h2>Shared With You ({sharedBoards.length})</h2>
            <div className="boards-grid">
              {sharedBoards.map(sharedBoard => (
                <div key={`shared-${sharedBoard.id}`} className="board-card shared-board-card">
                  <div className="board-card-header">
                    <h3 className="board-title">{sharedBoard.name}</h3>
                    <div className="shared-badge">👥 Shared</div>
                  </div>
                  
                  <div className="board-meta">
                    <p className="board-date">
                      <span>Owner:</span> {sharedBoard.owner}
                    </p>
                    <p className="board-date">
                      <span>Modified:</span> {new Date(sharedBoard.modifiedTime).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleOpenSharedBoard(sharedBoard.id)}
                    className="open-board-btn"
                  >
                    Open Shared Board
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedBoardForShare && (
        <ShareBoard
          boardId={selectedBoardForShare.id}
          boardTitle={selectedBoardForShare.title}
          isOpen={shareModalOpen}
          onClose={handleCloseShareModal}
        />
      )}
    </div>
  );
};

export default BoardManager;