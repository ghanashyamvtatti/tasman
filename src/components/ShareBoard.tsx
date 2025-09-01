import React, { useState, useEffect } from 'react';
import { googleDriveManager, BoardPermission } from '../services/googleDrive';
import './ShareBoard.css';

interface ShareBoardProps {
  boardId: string;
  boardTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const ShareBoard: React.FC<ShareBoardProps> = ({ boardId, boardTitle, isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'reader' | 'writer'>('writer');
  const [permissions, setPermissions] = useState<BoardPermission[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, boardId]);

  const loadPermissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const boardPermissions = await googleDriveManager.getBoardPermissions(boardId);
      setPermissions(boardPermissions);
    } catch (error) {
      setError('Failed to load sharing permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSharing(true);
    setError(null);
    
    try {
      const success = await googleDriveManager.shareBoardWithEmail(boardId, email.trim(), permission);
      if (success) {
        setEmail('');
        await loadPermissions();
      } else {
        setError('Failed to share board. Please check the email address and try again.');
      }
    } catch (error) {
      setError('Failed to share board. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleRemovePermission = async (permissionId: string) => {
    try {
      const success = await googleDriveManager.removeSharePermission(boardId, permissionId);
      if (success) {
        await loadPermissions();
      } else {
        setError('Failed to remove sharing permission');
      }
    } catch (error) {
      setError('Failed to remove sharing permission');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>Share "{boardTitle}"</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="share-modal-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleShare} className="share-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="email-input"
                disabled={isSharing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="permission">Permission</label>
              <select
                id="permission"
                value={permission}
                onChange={(e) => setPermission(e.target.value as 'reader' | 'writer')}
                className="permission-select"
                disabled={isSharing}
              >
                <option value="writer">Can edit</option>
                <option value="reader">Can view</option>
              </select>
            </div>

            <button
              type="submit"
              className="share-button"
              disabled={!email.trim() || isSharing}
            >
              {isSharing ? 'Sharing...' : 'Share'}
            </button>
          </form>

          <div className="current-shares">
            <h4>Who has access</h4>
            {isLoading ? (
              <div className="loading">Loading permissions...</div>
            ) : permissions.length === 0 ? (
              <div className="no-shares">Only you have access to this board</div>
            ) : (
              <div className="permissions-list">
                {permissions.map((perm) => (
                  <div key={perm.id} className="permission-item">
                    <div className="permission-info">
                      <div className="permission-email">{perm.emailAddress}</div>
                      <div className="permission-role">
                        {perm.role === 'writer' ? 'Can edit' : 'Can view'}
                      </div>
                    </div>
                    <button
                      className="remove-permission"
                      onClick={() => handleRemovePermission(perm.id)}
                      title="Remove access"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareBoard;