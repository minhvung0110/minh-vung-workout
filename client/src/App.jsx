import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import ActiveWorkout from './components/ActiveWorkout';
import Dashboard from './components/Dashboard';
import WorkoutSchedule from './components/WorkoutSchedule';
import './index.css';

// Protected Route Component
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/auth" />;
};

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/schedule" element={
                        <PrivateRoute>
                            <WorkoutSchedule />
                        </PrivateRoute>
                    } />
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/workout" element={
                        <PrivateRoute>
                            <ActiveWorkout />
                        </PrivateRoute>
                    } />
                    <Route path="/" element={<Navigate to="/schedule" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
