import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SmartTimer from './SmartTimer';
import { Save, Plus, Trash2, TrendingUp } from 'lucide-react';

const ActiveWorkout = () => {
    const [workout, setWorkout] = useState({
        exercises: [],
        startTime: new Date(),
    });
    const [showTimer, setShowTimer] = useState(false);
    const [timerType, setTimerType] = useState('Compound');
    const [lastSessionData, setLastSessionData] = useState({});

    const addExercise = (name, type) => {
        const newEx = {
            exerciseId: Math.random().toString(36).substr(2, 9), // Mock ID for now
            name,
            type,
            sets: [{ setNumber: 1, weight: 0, reps: 0, rpe: 0, restTime: 0 }]
        };
        setWorkout({ ...workout, exercises: [...workout.exercises, newEx] });
    };

    const updateSet = (exIndex, setIndex, field, value) => {
        const updatedEx = [...workout.exercises];
        updatedEx[exIndex].sets[setIndex][field] = Number(value);
        setWorkout({ ...workout, exercises: updatedEx });
    };

    const completeSet = (exIndex, setIndex) => {
        setTimerType(workout.exercises[exIndex].type);
        setShowTimer(true);
        // Logic to auto-add next set
        if (setIndex === workout.exercises[exIndex].sets.length - 1) {
            const updatedEx = [...workout.exercises];
            const lastSet = updatedEx[exIndex].sets[setIndex];
            updatedEx[exIndex].sets.push({
                setNumber: setIndex + 2,
                weight: lastSet.weight,
                reps: lastSet.reps,
                rpe: 0,
                restTime: 0
            });
            setWorkout({ ...workout, exercises: updatedEx });
        }
    };

    const handleTimerFinish = (seconds) => {
        setShowTimer(false);
        // Save rest time to the most recent completed set (not implementation here for brevity, but logic is planned)
    };

    const saveWorkout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/workouts', {
                ...workout,
                endTime: new Date()
            }, { headers: { 'x-auth-token': token } });
            alert('Workout Saved!');
        } catch (err) {
            alert('Error saving workout');
        }
    };

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: 'var(--accent-color)' }}>Active Session</h1>
                <button className="btn-primary" onClick={saveWorkout}><Save size={18} /> Finish Workout</button>
            </header>

            {showTimer && <SmartTimer type={timerType} onFinish={handleTimerFinish} />}

            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => addExercise('Bench Press', 'Compound')} className="btn-primary" style={{ marginRight: '10px' }}>+ Compound</button>
                <button onClick={() => addExercise('Bicep Curls', 'Isolation')} className="btn-primary">+ Isolation</button>
            </div>

            {workout.exercises.map((ex, exIdx) => (
                <div key={exIdx} className="glass-card" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2>{ex.name} <small style={{ fontSize: '0.5em', color: 'var(--text-secondary)' }}>({ex.type})</small></h2>
                        <div style={{ color: 'var(--accent-secondary)', fontSize: '0.9rem' }}>
                            <TrendingUp size={14} /> Last Week: 80kg x 10
                        </div>
                    </div>

                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)' }}>
                                <th>SET</th>
                                <th>KG</th>
                                <th>REPS</th>
                                <th>RPE</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {ex.sets.map((set, setIdx) => (
                                <tr key={setIdx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '10px 0' }}>{set.setNumber}</td>
                                    <td><input type="number" style={{ width: '60px', marginBottom: 0 }} value={set.weight} onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)} /></td>
                                    <td><input type="number" style={{ width: '60px', marginBottom: 0 }} value={set.reps} onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)} /></td>
                                    <td><input type="number" style={{ width: '60px', marginBottom: 0 }} value={set.rpe} onChange={(e) => updateSet(exIdx, setIdx, 'rpe', e.target.value)} /></td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button onClick={() => completeSet(exIdx, setIdx)} style={{ background: 'var(--success)', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>✓ Done</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* 1RM Estimation Display */}
                    <div style={{ marginTop: '15px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Est. 1RM: {(ex.sets[0].weight * (1 + ex.sets[0].reps / 30)).toFixed(1)}kg (Epley)
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActiveWorkout;
