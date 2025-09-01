import React from 'react';
import TasmanLogo from './TasmanLogo';
import './PrivacyPolicy.css';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="privacy-policy">
      <div className="privacy-header">
        <div className="header-content">
          <TasmanLogo size={48} />
          <div className="header-text">
            <h1>Privacy Policy</h1>
            <p>Your privacy and data security matter to us</p>
          </div>
          <button className="back-button" onClick={onBack} title="Back to Boards">
            ← Back to Boards
          </button>
        </div>
      </div>

      <div className="privacy-content">
        <div className="policy-section">
          <div className="last-updated">
            <strong>Last Updated:</strong> January 1, 2025
          </div>

          <section className="policy-item">
            <h2>🔒 Data Collection and Storage</h2>
            <div className="policy-content">
              <h3>What We Store Locally</h3>
              <ul>
                <li><strong>Board Data:</strong> Your Kanban boards, columns, tasks, and subtasks are stored locally in your browser</li>
                <li><strong>User Preferences:</strong> Application settings and preferences</li>
                <li><strong>Session Data:</strong> Temporary data for the current session</li>
              </ul>

              <h3>Google Drive Integration</h3>
              <ul>
                <li><strong>Board Backup:</strong> When you enable cloud sync, your boards are encrypted and stored in your personal Google Drive</li>
                <li><strong>Authentication Tokens:</strong> Google OAuth tokens are stored securely to maintain your signed-in state</li>
                <li><strong>No Personal Data:</strong> We never access or store your personal Google account information beyond what's necessary for authentication</li>
              </ul>
            </div>
          </section>

          <section className="policy-item">
            <h2>🤝 Data Sharing and Collaboration</h2>
            <div className="policy-content">
              <h3>Board Sharing</h3>
              <ul>
                <li><strong>Email-Based Sharing:</strong> When you share a board, only the email addresses you specify gain access</li>
                <li><strong>Permission Control:</strong> You control who can view or edit your shared boards</li>
                <li><strong>Google Drive Permissions:</strong> Sharing utilizes Google Drive's native permission system</li>
              </ul>

              <h3>What We Don't Share</h3>
              <ul>
                <li>We never sell, rent, or share your personal data with third parties</li>
                <li>We don't analyze your board content for advertising purposes</li>
                <li>We don't share usage data with external analytics services</li>
              </ul>
            </div>
          </section>

          <section className="policy-item">
            <h2>🛡️ Security Measures</h2>
            <div className="policy-content">
              <h3>Data Protection</h3>
              <ul>
                <li><strong>Local Storage:</strong> Data is stored locally in your browser using secure browser APIs</li>
                <li><strong>Google Drive Encryption:</strong> All cloud data is encrypted in transit and at rest</li>
                <li><strong>OAuth 2.0:</strong> We use Google's secure OAuth 2.0 authentication system</li>
                <li><strong>No Server Storage:</strong> We don't store any of your data on our servers</li>
              </ul>

              <h3>Access Control</h3>
              <ul>
                <li>Only you have access to your local data</li>
                <li>Cloud data is only accessible through your Google account</li>
                <li>Shared boards use Google Drive's permission system</li>
              </ul>
            </div>
          </section>

          <section className="policy-item">
            <h2>🌐 Third-Party Services</h2>
            <div className="policy-content">
              <h3>Google Services</h3>
              <ul>
                <li><strong>Google Drive API:</strong> Used for cloud storage and synchronization</li>
                <li><strong>Google Identity Services:</strong> Used for secure authentication</li>
                <li><strong>Google's Privacy Policy:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a></li>
              </ul>

              <h3>No Other Third Parties</h3>
              <p>Tasman is designed to be privacy-focused and doesn't integrate with any other third-party services for data collection or analytics.</p>
            </div>
          </section>

          <section className="policy-item">
            <h2>📱 Cookies and Local Storage</h2>
            <div className="policy-content">
              <h3>What We Store in Your Browser</h3>
              <ul>
                <li><strong>Board Data:</strong> Your Kanban boards and tasks</li>
                <li><strong>Authentication State:</strong> Whether you're signed in to Google Drive</li>
                <li><strong>User Preferences:</strong> Your application settings and preferences</li>
              </ul>

              <h3>No Tracking Cookies</h3>
              <p>We don't use tracking cookies, analytics cookies, or any form of cross-site tracking.</p>
            </div>
          </section>

          <section className="policy-item">
            <h2>🗑️ Data Deletion and Control</h2>
            <div className="policy-content">
              <h3>Your Data Rights</h3>
              <ul>
                <li><strong>Delete Local Data:</strong> Clear your browser data to remove all local information</li>
                <li><strong>Delete Cloud Data:</strong> Remove files from your Google Drive or revoke access to the application</li>
                <li><strong>Stop Sharing:</strong> Remove sharing permissions from any boards you've shared</li>
                <li><strong>Sign Out:</strong> Revoke authentication tokens at any time</li>
              </ul>

              <h3>Data Retention</h3>
              <ul>
                <li>Local data persists until you clear your browser data</li>
                <li>Cloud data persists in your Google Drive until you delete it</li>
                <li>We don't retain any data on our servers</li>
              </ul>
            </div>
          </section>

          <section className="policy-item">
            <h2>👶 Children's Privacy</h2>
            <div className="policy-content">
              <p>Tasman is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us, and we will take steps to remove such information.</p>
            </div>
          </section>

          <section className="policy-item">
            <h2>🔄 Changes to This Policy</h2>
            <div className="policy-content">
              <p>We may update this Privacy Policy from time to time. We will notify users of any material changes by updating the "Last Updated" date at the top of this policy. Your continued use of Tasman after any changes indicates your acceptance of the updated policy.</p>
            </div>
          </section>

          <section className="policy-item">
            <h2>📞 Contact Information</h2>
            <div className="policy-content">
              <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
              <ul>
                <li><strong>GitHub Issues:</strong> <a href="https://github.com/yourusername/tasman/issues" target="_blank" rel="noopener noreferrer">Report privacy concerns</a></li>
                <li><strong>Email:</strong> privacy@tasman-app.com</li>
              </ul>
            </div>
          </section>

          <div className="policy-summary">
            <h2>📋 Summary</h2>
            <div className="summary-content">
              <p><strong>In simple terms:</strong></p>
              <ul>
                <li>🏠 Your data stays with you (local browser storage)</li>
                <li>☁️ Cloud features use your personal Google Drive</li>
                <li>🤝 You control who sees your shared boards</li>
                <li>🔒 We don't track you or sell your data</li>
                <li>🛡️ Everything is encrypted and secure</li>
                <li>🗑️ You can delete your data anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;