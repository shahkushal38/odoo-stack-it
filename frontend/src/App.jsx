import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import AskQuestion from './pages/AskQuestion'
import QuestionDetail from './pages/QuestionDetail'
import Notifications from './pages/Notifications'

function App() {
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationCount = 3 // Dummy count

  return (
    <Router>
      <Navbar
        onNotificationsClick={() => setShowNotifications(!showNotifications)}
        notificationCount={notificationCount}
      />
      {showNotifications && <Notifications />}
      <div className="app__container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ask" element={<AskQuestion />} />
        </Routes>
        <Link to="/ask" className="app__ask-btn">
          Ask Question
        </Link>
      </div>
    </Router>
  )
}

export default App
