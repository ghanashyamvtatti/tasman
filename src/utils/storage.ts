import { Board } from '../types';

const STORAGE_KEY = 'kanban-board';
const BOARDS_LIST_KEY = 'kanban-boards-list';

export interface BoardInfo {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy functions for backward compatibility
export const saveBoard = (board: Board): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
    updateBoardInList(board);
  } catch (error) {
    console.error('Failed to save board to localStorage:', error);
  }
};

export const loadBoard = (): Board | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load board from localStorage:', error);
    return null;
  }
};

// New multi-board functions
export const saveBoardById = (boardId: string, board: Board): void => {
  try {
    const key = `kanban-board-${boardId}`;
    localStorage.setItem(key, JSON.stringify(board));
    updateBoardInList(board);
  } catch (error) {
    console.error('Failed to save board to localStorage:', error);
  }
};

export const loadBoardById = (boardId: string): Board | null => {
  try {
    const key = `kanban-board-${boardId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load board from localStorage:', error);
    return null;
  }
};

export const getAllBoards = (): BoardInfo[] => {
  try {
    const stored = localStorage.getItem(BOARDS_LIST_KEY);
    const boards = stored ? JSON.parse(stored) : [];
    return boards.map((board: any) => ({
      ...board,
      createdAt: new Date(board.createdAt),
      updatedAt: new Date(board.updatedAt)
    }));
  } catch (error) {
    console.error('Failed to load boards list:', error);
    return [];
  }
};

export const createNewBoard = (title: string): Board => {
  const boardId = `board-${Date.now()}`;
  const newBoard: Board = {
    id: boardId,
    title,
    columns: [
      {
        id: 'todo',
        title: 'To Do',
        tasks: []
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        tasks: []
      },
      {
        id: 'done',
        title: 'Done',
        tasks: []
      }
    ]
  };
  
  saveBoardById(boardId, newBoard);
  return newBoard;
};

export const deleteBoard = (boardId: string): void => {
  try {
    const key = `kanban-board-${boardId}`;
    localStorage.removeItem(key);
    
    const boards = getAllBoards().filter(board => board.id !== boardId);
    localStorage.setItem(BOARDS_LIST_KEY, JSON.stringify(boards));
  } catch (error) {
    console.error('Failed to delete board:', error);
  }
};

export const updateBoardTitle = (boardId: string, title: string): void => {
  try {
    const board = loadBoardById(boardId);
    if (board) {
      board.title = title;
      saveBoardById(boardId, board);
    }
  } catch (error) {
    console.error('Failed to update board title:', error);
  }
};

const updateBoardInList = (board: Board): void => {
  try {
    const boards = getAllBoards();
    const existingIndex = boards.findIndex(b => b.id === board.id);
    
    const boardInfo: BoardInfo = {
      id: board.id,
      title: board.title,
      createdAt: existingIndex >= 0 ? boards[existingIndex].createdAt : new Date(),
      updatedAt: new Date()
    };
    
    if (existingIndex >= 0) {
      boards[existingIndex] = boardInfo;
    } else {
      boards.push(boardInfo);
    }
    
    localStorage.setItem(BOARDS_LIST_KEY, JSON.stringify(boards));
  } catch (error) {
    console.error('Failed to update boards list:', error);
  }
};

export const getDefaultBoard = (): Board => ({
  id: 'default-board',
  title: 'Tasman Board',
  columns: [
    {
      id: 'todo',
      title: 'To Do',
      tasks: []
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: []
    },
    {
      id: 'done',
      title: 'Done',
      tasks: []
    }
  ]
});