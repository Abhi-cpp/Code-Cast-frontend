import './App.css';
import Login from './Components/Login';
import DataContextProvider from './Components/DataContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Room from './Room/Room';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    document.querySelector("#change-theme").addEventListener('click', () => {
      document.querySelector("#root").classList.toggle("dark");
    });
  })
  return (
    <DataContextProvider>
      <div className="App">
        <div id="change-theme">
          <button id="change-theme-button">
            <i class="fas fa-moon"></i>
            <i class="fas fa-sun"></i>
          </button>
        </div>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/room" element={<Room />} />
          </Routes>
        </Router>
      </div>
    </DataContextProvider >
  );
}

export default App;
