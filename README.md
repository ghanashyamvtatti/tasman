# Tasman 📋

A modern, feature-rich Kanban board application built with React and TypeScript. Organize your projects with intuitive drag-and-drop functionality, cloud synchronization, and real-time collaboration through board sharing.

![Tasman Logo](public/logo192.png)

## ✨ Features

### 🎯 **Core Kanban Functionality**
- **Drag & Drop Interface** - Intuitive task management with touch support for mobile devices
- **Multi-level Organization** - Boards → Columns → Tasks → Subtasks
- **Priority System** - High, Medium, Low priority levels with visual indicators
- **Real-time Updates** - Instant saving and synchronization

### ☁️ **Cloud Integration**
- **Google Drive Sync** - Automatic backup and synchronization across devices
- **Offline-First** - Works seamlessly without internet, syncs when reconnected
- **Cross-Device Access** - Access your boards from anywhere with Google account
- **Automatic Backup** - Never lose your work with continuous cloud storage

### 🤝 **Collaboration & Sharing**
- **Email-Based Sharing** - Share boards with anyone using their email address
- **Permission Control** - Granular access control (Can Edit / Can View)
- **Shared Board Discovery** - Automatically discover boards shared with you
- **Real-time Collaboration** - Multiple users can work on the same board
- **Access Management** - View and revoke sharing permissions

### 📱 **User Experience**
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Touch-Friendly** - Optimized for touch interactions with 250ms delay prevention
- **Modern UI** - Clean, professional interface with smooth animations
- **Keyboard Navigation** - Full keyboard accessibility support
- **Dark/Light Themes** - Automatic theme adaptation

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Project with Drive API enabled (for cloud features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tasman.git
   cd tasman
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Google Drive Integration** (Optional)
   
   Create a `.env.local` file in the root directory:
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   REACT_APP_GOOGLE_API_KEY=your_google_api_key
   ```

   To get these credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google Drive API
   - Create credentials (OAuth 2.0 Client ID and API Key)
   - Add your domain to authorized origins

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 📖 Usage Guide

### Creating Your First Board

1. **Launch the Application** - Open Tasman in your browser
2. **Create a Board** - Enter a name in "Create New Board" section
3. **Add Columns** - Click "+ Add Column" to create workflow stages (e.g., "To Do", "In Progress", "Done")
4. **Create Tasks** - Click "Add Task" in any column to create your first task
5. **Add Details** - Click on tasks to add descriptions, set priorities, and create subtasks

### Cloud Synchronization

1. **Sign In** - Click the cloud sync button and sign in with your Google account
2. **Automatic Sync** - All changes are automatically saved to Google Drive
3. **Cross-Device Access** - Your boards sync across all your devices
4. **Offline Mode** - Continue working offline; changes sync when reconnected

### Sharing Boards

1. **Share a Board** - Click the 👥 share button on any board
2. **Add Collaborators** - Enter email addresses of people you want to share with
3. **Set Permissions** - Choose "Can Edit" or "Can View" access levels
4. **Manage Access** - View current shares and remove access when needed
5. **Access Shared Boards** - Shared boards appear in "Shared With You" section

### Drag & Drop Operations

- **Move Tasks** - Drag tasks between columns or reorder within columns
- **Move Subtasks** - Drag subtasks between parent tasks
- **Touch Support** - Long press (250ms) to start dragging on mobile devices
- **Keyboard Navigation** - Use arrow keys and Enter to move items

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript
- **Drag & Drop**: @dnd-kit (modern, accessible DnD)
- **Cloud Storage**: Google Drive API v3
- **Authentication**: Google Identity Services (GIS)
- **State Management**: React Context + Hooks
- **Styling**: CSS Modules with modern CSS features
- **Build Tool**: Create React App with TypeScript

### Project Structure
```
tasman/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── BoardManager.tsx    # Main board list view
│   │   ├── KanbanBoard.tsx     # Individual board view
│   │   ├── ShareBoard.tsx      # Board sharing modal
│   │   ├── CloudSync.tsx       # Cloud sync controls
│   │   └── ...
│   ├── contexts/          # React Context providers
│   │   └── CloudSyncContext.tsx
│   ├── services/          # API and business logic
│   │   ├── googleDrive.ts      # Google Drive integration
│   │   └── cloudStorage.ts     # Cloud storage manager
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   │   └── storage.ts          # Local storage utilities
│   └── ...
├── .env.local             # Environment variables (create this)
├── LICENSE                # Apache 2.0 License
└── README.md             # This file
```

### Key Components

- **BoardManager** - Main dashboard for managing multiple boards
- **KanbanBoard** - Individual board view with columns and tasks
- **ShareBoard** - Modal for sharing boards via email
- **CloudSync** - Cloud synchronization status and controls
- **TaskCard** - Individual task component with drag handles
- **Column** - Board column containing tasks

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID | Optional* |
| `REACT_APP_GOOGLE_API_KEY` | Google API Key | Optional* |

*Required for cloud sync and sharing features

### Google Cloud Setup

1. **Create a Google Cloud Project**
2. **Enable APIs**:
   - Google Drive API
   - Google Identity Services
3. **Create Credentials**:
   - OAuth 2.0 Client ID (Web application)
   - API Key (restricted to Drive API)
4. **Configure OAuth Consent Screen**
5. **Add Authorized Domains** (for production)

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Analyze bundle size
npm run analyze
```

### Code Style
- **TypeScript** for type safety
- **ESLint + Prettier** for code formatting
- **Semantic commit messages**
- **Component-based architecture**
- **Custom CSS with CSS Modules**

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## 📦 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify
```bash
# Build the app
npm run build

# Deploy the build folder to Netlify
```

### Environment Variables for Production
Set the following environment variables in your hosting platform:
- `REACT_APP_GOOGLE_CLIENT_ID`
- `REACT_APP_GOOGLE_API_KEY`

## 🐛 Troubleshooting

### Common Issues

**Cloud sync not working**
- Verify Google API credentials are correct
- Check if Google Drive API is enabled
- Ensure domain is added to OAuth authorized origins

**Drag and drop not working on mobile**
- Ensure touch events are not being intercepted
- Check if the delay (250ms) is appropriate for your use case
- Verify `touchAction: 'none'` is applied to drag handles

**Performance issues**
- Use React DevTools to identify unnecessary re-renders
- Check if large datasets are causing issues
- Consider implementing virtualization for large boards

**Build failures**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all dependencies are compatible

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Add tests** for new functionality
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and patterns
- Write TypeScript with proper typing
- Add tests for new features
- Update documentation as needed
- Ensure accessibility compliance

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **@dnd-kit** - Modern drag and drop library
- **Google Drive API** - Cloud storage and synchronization
- **React Team** - Amazing framework and ecosystem
- **TypeScript Team** - Type safety and developer experience
- **Create React App** - Zero-configuration build setup

## 🔗 Links

- **Live Demo**: [https://tasman-demo.vercel.app](https://tasman-demo.vercel.app)
- **Documentation**: [https://github.com/yourusername/tasman/wiki](https://github.com/yourusername/tasman/wiki)
- **Issue Tracker**: [https://github.com/yourusername/tasman/issues](https://github.com/yourusername/tasman/issues)
- **Discussions**: [https://github.com/yourusername/tasman/discussions](https://github.com/yourusername/tasman/discussions)

## 📊 Roadmap

### Upcoming Features
- [ ] **Real-time Collaboration** - Live cursor tracking and concurrent editing
- [ ] **Advanced Filtering** - Filter tasks by priority, assignee, due date
- [ ] **Time Tracking** - Built-in time tracking for tasks
- [ ] **Custom Fields** - Add custom metadata to tasks
- [ ] **Automation Rules** - Automated task movements and notifications
- [ ] **Analytics Dashboard** - Project insights and productivity metrics
- [ ] **Mobile App** - Native iOS and Android applications
- [ ] **API Access** - REST API for integrations
- [ ] **Webhook Support** - Real-time notifications for external systems
- [ ] **Advanced Permissions** - Role-based access control

### Version History
- **v1.0.0** - Initial release with basic Kanban functionality
- **v1.1.0** - Added cloud synchronization with Google Drive
- **v1.2.0** - Implemented board sharing and collaboration features
- **v1.3.0** - Enhanced mobile support with touch drag & drop

---

**Made with ❤️ by the Tasman Team**

*Organize better. Collaborate smarter. Achieve more.*