# ChessSansar

ChessSansar is a web-based chess application built with React and Vite. It allows users to play chess against a  Bot, solve chess puzzles, and play online with other users. The project leverages various modern tools and libraries to provide a seamless and interactive chess experience.

## Features

- Play against Bot with adjustable difficulty levels
- Solve chess puzzles from a curated collection
- Real-time online multiplayer chess
- User authentication
- Responsive design for desktop
- Interactive move validation and highlights
- Game history

## Tools and Libraries Used

- **React** - Frontend JavaScript library
- **Vite** - Next-generation build tool
- **Redux Toolkit** - State management solution
- **React Router** - Declarative routing
- **Chess.js** - Chess move validation and logic
- **React Chessboard** - Interactive chessboard component
- **Tailwind CSS** - Utility-first styling framework
- **Stockfish** - Open-source chess engine
- **React Timer Hook** - Timer management
- **React Redux** - Redux bindings for React
- **Reactjs Popup** - Modal and popup components

## Project Structure

```
chessSansar/
├── public
│   └── stockfish.js
├── README.md
└──src
    ├── components/
    ├── Engine/
    ├── Pages/
    │   ├── engine.jsx
    │   ├── home.jsx
    │   ├── logIn.jsx
    │   ├── online.jsx
    │   ├── puzzle.jsx
    │   └── signUp.jsx
    ├── Routes.jsx
    ├── Store/
    └── utils/
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

### Development

```sh
npm run dev
```
Access the application at `http://localhost:3000`

### Production Build

```sh
npm run build
npm run preview
```

## Live Demo

Visit [ChessSansar Production](https://chesssansar.com)

## Contributors

- [Nishan](https://github.com/nishan)
- [Rajat](https://github.com/Rajatp499)
- [Yamraj](https://github.com/yamrajkhadka)
- [Prasanga](https://github.com/prasanga73)


## Acknowledgements

- [Chess.js](https://github.com/jhlywa/chess.js) - Chess library
- [React Chessboard](https://github.com/Clariity/react-chessboard) - Chessboard component
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
