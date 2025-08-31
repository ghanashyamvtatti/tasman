import React, { useState, useEffect } from 'react';
import KanbanBoard from './components/KanbanBoard';
import BoardManager from './components/BoardManager';
import { getAllBoards, loadBoard, getDefaultBoard, saveBoardById } from './utils/storage';
import { CloudSyncProvider } from './contexts/CloudSyncContext';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'manager' | 'board'>('manager');
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing boards and handle migration/auto-open logic
    const boards = getAllBoards();
    const legacyBoard = loadBoard();

    if (boards.length === 0 && legacyBoard) {
      // Migrate legacy single board to new multi-board system
      saveBoardById(legacyBoard.id, legacyBoard);
      setCurrentBoardId(legacyBoard.id);
      setCurrentView('board');
    } else if (boards.length === 1) {
      // If there's only one board, open it directly
      setCurrentBoardId(boards[0].id);
      setCurrentView('board');
    } else if (boards.length === 0) {
      // No boards exist, create a default one
      const defaultBoard = getDefaultBoard();
      saveBoardById(defaultBoard.id, defaultBoard);
      setCurrentBoardId(defaultBoard.id);
      setCurrentView('board');
    }
    // If there are multiple boards, stay on manager view
  }, []);

  const handleSelectBoard = (boardId: string) => {
    setCurrentBoardId(boardId);
    setCurrentView('board');
  };

  const handleBackToManager = () => {
    setCurrentView('manager');
    setCurrentBoardId(null);
  };

  return (
    <CloudSyncProvider>
      <div className="App">
        {currentView === 'manager' ? (
          <BoardManager onSelectBoard={handleSelectBoard} />
        ) : (
          <KanbanBoard 
            boardId={currentBoardId!} 
            onBackToManager={handleBackToManager}
          />
        )}
      </div>
    </CloudSyncProvider>
  );
}

export default App;