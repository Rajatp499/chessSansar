# ChessSansar

ChessSansar is a web-based chess application built with React and Vite. It allows users to play chess against a Bot, solve chess puzzles, and play online with other users. The project leverages various modern tools and libraries to provide a seamless and interactive chess experience.

## Features

- **Play against Bot**: Challenge the AI with adjustable difficulty levels powered by Stockfish
- **Chess Puzzles**: Improve your skills by solving puzzles from a curated collection
- **Online Multiplayer**: Play real-time chess matches with other users via WebSocket
- **User Authentication**: Secure account creation, login, and email activation
- **Game History**: Review and analyze your previous games ***(will be available soon...)***
- **Interactive Board**: Visual move validation, highlights, and suggestions ***(will be available soon...)***
- **Chess Clock**: Professional-style timers for timed matches ***(Not complete yet, will be available soon...)***
- **Responsive Design**: Optimized for desktop experience
- **Theme Customization**: Choose your preferred board and piece styles

## Tools and Libraries Used

### Core Technologies
- **React 18**: Frontend JavaScript library for building the user interface
- **Vite 6**: Next-generation build tool for fast development and optimized production builds
- **Redux Toolkit**: Modern state management solution for React applications
- **React Router v7**: Declarative routing for single-page applications

### Chess Functionality
- **Chess.js**: Chess move validation, generation, and piece position logic
- **React Chessboard**: Interactive chessboard component for React
- **Stockfish.js**: Open-source chess engine for AI analysis and opponent
- **React Timer Hook**: Timer management for chess clocks

### UI/UX
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Reactjs Popup**: Modal and popup components for game notifications
- **Custom Hooks**: Purpose-built hooks for chess game logic and WebSocket communication

## Project Structure

```
chessSansar/
├── public/
│   ├── assets/
│   │   └── logo.png
│   └── stockfish.js          # Chess engine for AI moves
├── src/
│   ├── assets/               # Static assets and images
│   ├── components/           # Reusable UI components
│   │   ├── common/           # Shared components (modals, loaders)
│   │   └── online/           # Online multiplayer specific components
│   ├── Engine/               # Chess engine integration
│   │   ├── bot.js            # Bot player implementation
│   │   ├── engine.js         # Chess engine interface
│   │   └── evaluation.jsx    # Position evaluation component
│   ├── hooks/                # Custom React hooks
│   │   ├── useChessGame.js   # Chess game logic hook
│   │   └── useWebSocket.js   # WebSocket communication hook
│   ├── Pages/                # Application pages/routes
│   │   ├── activate.jsx      # Account activation page
│   │   ├── create.jsx        # Create game page
│   │   ├── createorjoin.jsx  # Game creation/joining option page
│   │   ├── engine.jsx        # Play against engine page
│   │   ├── home.jsx          # Home/landing page
│   │   ├── join.jsx          # Join game page
│   │   ├── logIn.jsx         # User login page
│   │   ├── online.jsx        # Online multiplayer page
│   │   ├── puzzle.jsx        # Chess puzzles page
│   │   └── signUp.jsx        # User registration page
│   ├── Store/                # Redux store configuration
│   │   ├── Slices/           # Redux slices (theme, user)
│   │   └── store.js          # Main Redux store
│   ├── utils/                # Utility functions and data
│   │   ├── fen_puzzles.js    # Chess puzzle collection
│   │   └── websocketHandlers.js # WebSocket event handlers
│   ├── App.jsx               # Main application component
│   ├── Routes.jsx            # Application routing
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global CSS styles
├── index.html                # HTML entry point
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json              # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```sh
git clone https://github.com/yourusername/chessSansar.git
cd chessSansar
npm install
```

2. Create a `.env` file in the root directory and add:
```
VITE_BACKEND_CHESS_API=backend.http.url
VITE_BACKEND_CHESS_WS_API=backend.websocket.url
```

### Development

```sh
npm run dev
```
Access the application at `http://localhost:5173/`

### Production Build

```sh
npm run build
npm run preview
```

## Related Repositories

- [ChessSansar Backend](https://github.com/NishanBhattarai327/ChessSansar) - Backend server providing API and WebSocket functionality for the chess application


## Live Demo

Visit [ChessSansar](https://chess-sansar.vercel.app)

## Contributors

- [Nishan](https://github.com/nishan)
- [Rajat](https://github.com/Rajatp499)
- [Yamraj](https://github.com/yamrajkhadka)
- [Prasanga](https://github.com/prasanga73)

## Future Enhancements

- Mobile-responsive design
- Advanced analytics for game review
- Tournaments and rating system
- Opening explorer and move library
- Integration with popular chess platforms for puzzle imports

## Acknowledgements

- [Chess.js](https://github.com/jhlywa/chess.js) - Chess library
- [React Chessboard](https://github.com/Clariity/react-chessboard) - Chessboard component
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Stockfish](https://stockfishchess.org/) - Chess engine