import React, { useState } from 'react';
import { useCloudSync } from '../contexts/CloudSyncContext';
import { useGoogleLogin } from '@react-oauth/google';
import './CloudSync.css';

interface CloudSyncProps {
  compact?: boolean;
}

const CloudSync: React.FC<CloudSyncProps> = ({ compact = false }) => {
  const { status, setTokenAndSignIn, signOut, syncToCloud, syncFromCloud } = useCloudSync();
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const success = await setTokenAndSignIn(tokenResponse.access_token);
      if (success) {
        setSyncMessage('Successfully signed in to Google Drive!');
        setTimeout(() => setSyncMessage(''), 3000);
      } else {
        setSyncMessage('Failed to sign in to Google Drive');
        setTimeout(() => setSyncMessage(''), 3000);
      }
    },
    onError: () => {
      setSyncMessage('Google login failed');
      setTimeout(() => setSyncMessage(''), 3000);
    },
    scope: 'https://www.googleapis.com/auth/drive.file',
  });

  const handleSignIn = () => {
    login();
  };

  const handleSignOut = async () => {
    await signOut();
    setSyncMessage('Signed out from Google Drive');
    setTimeout(() => setSyncMessage(''), 3000);
  };

  const handleSyncToCloud = async () => {
    const result = await syncToCloud();
    setSyncMessage(result.message);
    setTimeout(() => setSyncMessage(''), 3000);
  };

  const handleSyncFromCloud = async () => {
    const result = await syncFromCloud();
    setSyncMessage(result.message);
    setTimeout(() => setSyncMessage(''), 3000);
  };

  if (!status.isCloudEnabled) {
    return (
      <div className={`cloud-sync ${compact ? 'compact' : ''}`}>
        <div className="cloud-status offline">
          <span className="status-icon">☁️</span>
          <span className="status-text">Cloud sync unavailable</span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="cloud-sync compact">
        {!status.isSignedIn ? (
          <button onClick={handleSignIn} className="cloud-btn sign-in" title="Sign in to Google Drive">
            ☁️ Sign In
          </button>
        ) : (
          <div className="cloud-controls">
            <div className="status-indicator signed-in" title={`Signed in as ${status.userEmail}`}>
              <span className="status-icon">☁️</span>
              <span className="status-dot"></span>
            </div>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="cloud-btn details"
              title="Cloud sync options"
            >
              ⚙️
            </button>
            {showDetails && (
              <div className="cloud-dropdown">
                <div className="user-info">
                  <strong>{status.userEmail}</strong>
                  {status.lastSyncTime && (
                    <small>Last sync: {status.lastSyncTime.toLocaleString()}</small>
                  )}
                </div>
                <div className="sync-actions">
                  <button onClick={handleSyncToCloud} disabled={status.syncInProgress}>
                    {status.syncInProgress ? 'Syncing...' : 'Upload to Cloud'}
                  </button>
                  <button onClick={handleSyncFromCloud} disabled={status.syncInProgress}>
                    {status.syncInProgress ? 'Syncing...' : 'Download from Cloud'}
                  </button>
                  <button onClick={handleSignOut} className="sign-out">
                    Sign Out
                  </button>
                </div>
                {status.error && (
                  <div className="sync-error">
                    {status.error}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {syncMessage && (
          <div className="sync-message">
            {syncMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="cloud-sync full">
      <div className="cloud-sync-header">
        <h3>
          <span className="cloud-icon">☁️</span>
          Cloud Synchronization
        </h3>
        {status.isSignedIn && status.userEmail && (
          <div className="user-badge">
            <span className="user-email">{status.userEmail}</span>
            <span className="status-indicator online"></span>
          </div>
        )}
      </div>

      <div className="cloud-sync-content">
        {!status.isSignedIn ? (
          <div className="sign-in-section">
            <p>Sign in to Google Drive to sync your boards across devices</p>
            <button onClick={handleSignIn} className="cloud-btn primary">
              <span className="btn-icon">🔐</span>
              Sign in to Google Drive
            </button>
          </div>
        ) : (
          <div className="sync-section">
            <div className="sync-status">
              {status.lastSyncTime && (
                <p>Last synchronized: {status.lastSyncTime.toLocaleString()}</p>
              )}
              {status.syncInProgress && (
                <p className="sync-progress">Synchronization in progress...</p>
              )}
              {status.error && (
                <p className="sync-error">{status.error}</p>
              )}
            </div>

            <div className="sync-actions">
              <button 
                onClick={handleSyncToCloud} 
                disabled={status.syncInProgress}
                className="cloud-btn sync-up"
              >
                <span className="btn-icon">⬆️</span>
                {status.syncInProgress ? 'Uploading...' : 'Upload to Cloud'}
              </button>
              
              <button 
                onClick={handleSyncFromCloud} 
                disabled={status.syncInProgress}
                className="cloud-btn sync-down"
              >
                <span className="btn-icon">⬇️</span>
                {status.syncInProgress ? 'Downloading...' : 'Download from Cloud'}
              </button>
            </div>

            <div className="sign-out-section">
              <button onClick={handleSignOut} className="cloud-btn secondary">
                Sign Out
              </button>
            </div>
          </div>
        )}

        {syncMessage && (
          <div className="sync-message">
            {syncMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudSync;
