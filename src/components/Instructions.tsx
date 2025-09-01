import React, { useState } from 'react';
import TasmanLogo from './TasmanLogo';
import './Instructions.css';

interface InstructionsProps {
  onBack: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: '🚀 Getting Started',
      icon: '🚀'
    },
    {
      id: 'creating-boards',
      title: '📋 Creating Boards',
      icon: '📋'
    },
    {
      id: 'managing-tasks',
      title: '✅ Managing Tasks',
      icon: '✅'
    },
    {
      id: 'drag-drop',
      title: '🖱️ Drag & Drop',
      icon: '🖱️'
    },
    {
      id: 'cloud-sync',
      title: '☁️ Cloud Sync',
      icon: '☁️'
    },
    {
      id: 'sharing',
      title: '🤝 Sharing Boards',
      icon: '🤝'
    },
    {
      id: 'tips',
      title: '💡 Tips & Tricks',
      icon: '💡'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="instruction-content">
            <h2>🚀 Getting Started with Tasman</h2>
            <p>Welcome to Tasman! Let's get you up and running in just a few minutes.</p>
            
            <div className="step-card">
              <h3>Step 1: Create Your First Board</h3>
              <p>Start by creating a new board for your project. Give it a descriptive name like "Website Redesign" or "Marketing Campaign".</p>
              <div className="tip">
                <strong>💡 Tip:</strong> You can create multiple boards for different projects or areas of your work.
              </div>
            </div>

            <div className="step-card">
              <h3>Step 2: Set Up Your Workflow</h3>
              <p>Add columns that represent your workflow stages. Common examples include:</p>
              <ul>
                <li><strong>To Do</strong> - Tasks waiting to be started</li>
                <li><strong>In Progress</strong> - Currently active tasks</li>
                <li><strong>Review</strong> - Tasks awaiting feedback</li>
                <li><strong>Done</strong> - Completed tasks</li>
              </ul>
            </div>

            <div className="step-card">
              <h3>Step 3: Add Your First Task</h3>
              <p>Click "Add Task" in any column to create your first task. Add a clear title and description to keep track of what needs to be done.</p>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-grid">
                <div className="action-item">
                  <span className="action-key">Click</span>
                  <span className="action-desc">Edit task details</span>
                </div>
                <div className="action-item">
                  <span className="action-key">Drag</span>
                  <span className="action-desc">Move tasks between columns</span>
                </div>
                <div className="action-item">
                  <span className="action-key">Double-click</span>
                  <span className="action-desc">Edit board title</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'creating-boards':
        return (
          <div className="instruction-content">
            <h2>📋 Creating and Managing Boards</h2>
            
            <div className="step-card">
              <h3>Creating a New Board</h3>
              <ol>
                <li>On the main dashboard, find the "Create New Board" section</li>
                <li>Enter a descriptive name for your board</li>
                <li>Click "Create Board" or press Enter</li>
                <li>Your new board will appear in the boards list</li>
              </ol>
            </div>

            <div className="step-card">
              <h3>Board Management</h3>
              <ul>
                <li><strong>Edit Name:</strong> Click the ✏️ button next to any board title</li>
                <li><strong>Delete Board:</strong> Click the 🗑️ button (this cannot be undone!)</li>
                <li><strong>Open Board:</strong> Click "Open Board" to start working</li>
              </ul>
            </div>

            <div className="step-card">
              <h3>Adding Columns</h3>
              <p>Inside any board:</p>
              <ol>
                <li>Click the "Add Column" button</li>
                <li>Enter a name for your column (e.g., "To Do", "In Progress")</li>
                <li>Press Enter or click outside to save</li>
              </ol>
            </div>

            <div className="best-practice">
              <h3>✨ Best Practices</h3>
              <ul>
                <li>Use clear, descriptive board names</li>
                <li>Create separate boards for different projects</li>
                <li>Keep column names short and action-oriented</li>
                <li>Limit columns to 3-7 for optimal workflow</li>
              </ul>
            </div>
          </div>
        );

      case 'managing-tasks':
        return (
          <div className="instruction-content">
            <h2>✅ Managing Tasks and Subtasks</h2>
            
            <div className="step-card">
              <h3>Creating Tasks</h3>
              <ol>
                <li>Click "Add Task" in any column</li>
                <li>Enter a task title</li>
                <li>Click on the task to add more details</li>
                <li>Set priority levels: High (🔴), Medium (🟡), Low (🟢)</li>
              </ol>
            </div>

            <div className="step-card">
              <h3>Working with Subtasks</h3>
              <p>Break down complex tasks into smaller, manageable pieces:</p>
              <ul>
                <li>Open any task by clicking on it</li>
                <li>Click "Add Subtask" to create subtasks</li>
                <li>Check off completed subtasks</li>
                <li>Drag subtasks between parent tasks</li>
              </ul>
            </div>

            <div className="step-card">
              <h3>Task Properties</h3>
              <div className="property-grid">
                <div className="property-item">
                  <strong>Title:</strong> Brief description of the task
                </div>
                <div className="property-item">
                  <strong>Description:</strong> Detailed information and notes
                </div>
                <div className="property-item">
                  <strong>Priority:</strong> High, Medium, or Low importance
                </div>
                <div className="property-item">
                  <strong>Subtasks:</strong> Smaller components of the main task
                </div>
              </div>
            </div>

            <div className="tip">
              <strong>💡 Pro Tip:</strong> Use subtasks to track progress on larger items. A task with 3/5 subtasks completed gives you a clear progress indicator!
            </div>
          </div>
        );

      case 'drag-drop':
        return (
          <div className="instruction-content">
            <h2>🖱️ Drag & Drop Operations</h2>
            
            <div className="step-card">
              <h3>Moving Tasks Between Columns</h3>
              <ol>
                <li>Click and hold on any task</li>
                <li>Drag it to the desired column</li>
                <li>Release to drop it in the new location</li>
              </ol>
            </div>

            <div className="step-card">
              <h3>Reordering Tasks</h3>
              <p>Change the order of tasks within the same column:</p>
              <ul>
                <li>Drag a task up or down within its column</li>
                <li>Drop it in the desired position</li>
                <li>Other tasks will automatically adjust</li>
              </ul>
            </div>

            <div className="step-card">
              <h3>Moving Subtasks</h3>
              <p>Subtasks can be moved between parent tasks:</p>
              <ul>
                <li>Drag a subtask to another task</li>
                <li>It will become a subtask of the target task</li>
                <li>Reorder subtasks within the same parent</li>
              </ul>
            </div>

            <div className="mobile-section">
              <h3>📱 Mobile & Touch Support</h3>
              <p>On mobile devices and tablets:</p>
              <ul>
                <li><strong>Long press</strong> (250ms) to start dragging</li>
                <li>Move your finger to drag the item</li>
                <li>Release to drop in the new location</li>
              </ul>
            </div>

            <div className="keyboard-section">
              <h3>⌨️ Keyboard Navigation</h3>
              <p>Use keyboard shortcuts for accessibility:</p>
              <div className="shortcut-grid">
                <div className="shortcut-item">
                  <kbd>Tab</kbd> Navigate between items
                </div>
                <div className="shortcut-item">
                  <kbd>Space</kbd> Select/activate drag mode
                </div>
                <div className="shortcut-item">
                  <kbd>Arrow Keys</kbd> Move selected items
                </div>
                <div className="shortcut-item">
                  <kbd>Escape</kbd> Cancel drag operation
                </div>
              </div>
            </div>
          </div>
        );

      case 'cloud-sync':
        return (
          <div className="instruction-content">
            <h2>☁️ Cloud Sync with Google Drive</h2>
            
            <div className="step-card">
              <h3>Setting Up Cloud Sync</h3>
              <ol>
                <li>Click the cloud sync button (☁️) in the top navigation</li>
                <li>Click "Sign In with Google"</li>
                <li>Authorize Tasman to access your Google Drive</li>
                <li>Your boards will automatically sync to the cloud</li>
              </ol>
            </div>

            <div className="step-card">
              <h3>How Cloud Sync Works</h3>
              <ul>
                <li><strong>Automatic Backup:</strong> Every change is saved to your Google Drive</li>
                <li><strong>Cross-Device Access:</strong> Access your boards from any device</li>
                <li><strong>Offline Mode:</strong> Continue working offline; changes sync when reconnected</li>
                <li><strong>Private Storage:</strong> Data is stored in your personal Google Drive</li>
              </ul>
            </div>

            <div className="step-card">
              <h3>Sync Status Indicators</h3>
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-icon">✅</span> Synced - All changes saved
                </div>
                <div className="status-item">
                  <span className="status-icon">🔄</span> Syncing - Upload in progress
                </div>
                <div className="status-item">
                  <span className="status-icon">⚠️</span> Error - Sync failed
                </div>
                <div className="status-item">
                  <span className="status-icon">📱</span> Offline - Working locally
                </div>
              </div>
            </div>

            <div className="warning">
              <strong>🔒 Privacy Note:</strong> Your data is stored in your personal Google Drive and never shared with us or third parties.
            </div>
          </div>
        );

      case 'sharing':
        return (
          <div className="instruction-content">
            <h2>🤝 Sharing Boards with Others</h2>
            
            <div className="step-card">
              <h3>How to Share a Board</h3>
              <ol>
                <li>Make sure you're signed in to Google Drive</li>
                <li>Click the 👥 share button on any board</li>
                <li>Enter the email address of the person you want to share with</li>
                <li>Choose permission level: "Can Edit" or "Can View"</li>
                <li>Click "Share" to send the invitation</li>
              </ol>
            </div>

            <div className="step-card">
              <h3>Permission Levels</h3>
              <div className="permission-grid">
                <div className="permission-item">
                  <strong>Can Edit</strong>
                  <p>Full access to modify tasks, add columns, and make changes</p>
                </div>
                <div className="permission-item">
                  <strong>Can View</strong>
                  <p>Read-only access to see the board but cannot make changes</p>
                </div>
              </div>
            </div>

            <div className="step-card">
              <h3>Managing Shared Boards</h3>
              <ul>
                <li><strong>View Current Shares:</strong> The share modal shows who has access</li>
                <li><strong>Remove Access:</strong> Click the × next to any user to revoke access</li>
                <li><strong>Change Permissions:</strong> Remove and re-add with new permission level</li>
              </ul>
            </div>

            <div className="step-card">
              <h3>Accessing Shared Boards</h3>
              <p>When someone shares a board with you:</p>
              <ul>
                <li>Boards shared with you appear in "Shared With You" section</li>
                <li>Click "Open Shared Board" to access them</li>
                <li>Changes you make sync in real-time with other collaborators</li>
              </ul>
            </div>

            <div className="tip">
              <strong>💡 Collaboration Tip:</strong> Use "Can View" for stakeholders who need visibility and "Can Edit" for team members actively working on the project.
            </div>
          </div>
        );

      case 'tips':
        return (
          <div className="instruction-content">
            <h2>💡 Tips & Tricks</h2>
            
            <div className="step-card">
              <h3>🚀 Productivity Tips</h3>
              <ul>
                <li><strong>Use Priority Levels:</strong> Set task priorities to focus on what matters most</li>
                <li><strong>Break Down Large Tasks:</strong> Use subtasks for complex work items</li>
                <li><strong>Limit Work in Progress:</strong> Don't overload your "In Progress" column</li>
                <li><strong>Regular Reviews:</strong> Check your boards daily to stay on track</li>
              </ul>
            </div>

            <div className="step-card">
              <h3>🎨 Organization Tips</h3>
              <ul>
                <li><strong>Color Code with Priority:</strong> Use High (🔴), Medium (🟡), Low (🟢) consistently</li>
                <li><strong>Keep Titles Short:</strong> Use task descriptions for detailed information</li>
                <li><strong>Archive Completed Work:</strong> Move old tasks to a "Done" or "Archive" column</li>
                <li><strong>Use Consistent Naming:</strong> Establish patterns for task and board names</li>
              </ul>
            </div>

            <div className="step-card">
              <h3>⚡ Efficiency Shortcuts</h3>
              <div className="shortcut-grid">
                <div className="shortcut-item">
                  <strong>Double-click board title</strong> to edit board name
                </div>
                <div className="shortcut-item">
                  <strong>Press Enter</strong> when creating tasks to add another quickly
                </div>
                <div className="shortcut-item">
                  <strong>Use the back button</strong> to return to board manager
                </div>
                <div className="shortcut-item">
                  <strong>Enable cloud sync</strong> for automatic backups
                </div>
              </div>
            </div>

            <div className="step-card">
              <h3>🔧 Troubleshooting</h3>
              <ul>
                <li><strong>Sync Issues:</strong> Check your internet connection and try refreshing</li>
                <li><strong>Mobile Drag Issues:</strong> Make sure to long press before dragging</li>
                <li><strong>Missing Boards:</strong> Sign in to Google Drive to access cloud boards</li>
                <li><strong>Performance:</strong> Consider archiving old completed tasks</li>
              </ul>
            </div>

            <div className="best-practice">
              <h3>✨ Best Practices for Teams</h3>
              <ul>
                <li><strong>Establish Workflow:</strong> Agree on column meanings and task flow</li>
                <li><strong>Regular Stand-ups:</strong> Review boards together in team meetings</li>
                <li><strong>Clear Ownership:</strong> Assign tasks to specific team members</li>
                <li><strong>Status Updates:</strong> Use task descriptions for progress notes</li>
              </ul>
            </div>
          </div>
        );

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className="instructions">
      <div className="instructions-header">
        <div className="header-content">
          <TasmanLogo size={48} />
          <div className="header-text">
            <h1>❓ How to Use Tasman</h1>
            <p>Complete guide to mastering your Kanban workflow</p>
          </div>
          <button className="back-button" onClick={onBack} title="Back to Boards">
            ← Back to Boards
          </button>
        </div>
      </div>

      <div className="instructions-content">
        <div className="instructions-layout">
          <nav className="instructions-sidebar">
            <h3>📚 Quick Navigation</h3>
            <ul className="section-nav">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <span className="nav-icon">{section.icon}</span>
                    <span className="nav-text">{section.title.replace(/^[^\s]+\s/, '')}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <main className="instructions-main">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Instructions;