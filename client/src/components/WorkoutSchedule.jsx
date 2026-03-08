import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Plus, X, Calendar, ChevronRight, LogOut } from 'lucide-react';

const DEFAULT_SCHEDULE = {
    'Thứ 2': [
        { name: 'Bench Press', type: 'Compound' },
        { name: 'Close-Grip Lat Pulldown', type: 'Compound' },
        { name: 'Dumbbell Shoulder Press', type: 'Compound' },
        { name: 'Dumbbell Upright Row', type: 'Isolation' },
        { name: 'Triceps Pushdown', type: 'Isolation' },
    ],
    'Thứ 3': [
        { name: 'Squat', type: 'Compound' },
        { name: 'Dumbbell Romanian Deadlift', type: 'Compound' },
        { name: 'Dumbbell Split Squat', type: 'Compound' },
        { name: 'Leg Extension', type: 'Isolation' },
    ],
    'Thứ 4': [
        { name: 'Chest-Supported T-Bar Row', type: 'Compound' },
        { name: 'Lat Pulldown', type: 'Compound' },
        { name: 'Incline Dumbbell Bench Press', type: 'Compound' },
        { name: 'Chest-Supported Dumbbell Row', type: 'Compound' },
        { name: 'EZ-Bar Curl', type: 'Isolation' },
    ],
    'Thứ 5': [
        { name: 'Cardio', type: 'Compound' },
    ],
    'Thứ 6': [
        { name: 'Overhead Press', type: 'Compound' },
        { name: 'Dumbbell Bench Press', type: 'Compound' },
        { name: 'Close-Grip Underhand Lat Pulldown', type: 'Compound' },
        { name: 'Triceps Rope Pushdown', type: 'Isolation' },
        { name: 'Dumbbell Bicep Curl', type: 'Isolation' },
    ],
    'Thứ 7': [
        { name: 'Deadlift', type: 'Compound' },
        { name: 'Leg Press', type: 'Compound' },
        { name: 'Hip Thrust', type: 'Compound' },
        { name: 'Lying Leg Curl', type: 'Isolation' },
        { name: 'Calf Raise', type: 'Isolation' },
    ],
    'CN': [],
};

const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

const DAY_COLORS = {
    'Thứ 2': '#00f2fe',
    'Thứ 3': '#4facfe',
    'Thứ 4': '#00e676',
    'Thứ 5': '#ff9800',
    'Thứ 6': '#e040fb',
    'Thứ 7': '#ff4d4d',
    'CN': '#666',
};

const WorkoutSchedule = () => {
    const navigate = useNavigate();
    const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
    const [selectedDay, setSelectedDay] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addingToDay, setAddingToDay] = useState(null);
    const [newExercise, setNewExercise] = useState({ name: '', type: 'Compound' });

    // Load custom schedule from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('workoutSchedule');
        if (saved) {
            try {
                setSchedule(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading schedule');
            }
        }
    }, []);

    // Save schedule to localStorage whenever it changes
    const saveSchedule = (newSchedule) => {
        setSchedule(newSchedule);
        localStorage.setItem('workoutSchedule', JSON.stringify(newSchedule));
    };

    const startWorkout = (day) => {
        const exercises = schedule[day];
        if (exercises.length === 0) return;
        navigate('/workout', { state: { day, exercises } });
    };

    const openAddModal = (day) => {
        setAddingToDay(day);
        setNewExercise({ name: '', type: 'Compound' });
        setShowAddModal(true);
    };

    const addExercise = () => {
        if (!newExercise.name.trim()) return;
        const updated = { ...schedule };
        updated[addingToDay] = [...updated[addingToDay], { name: newExercise.name.trim(), type: newExercise.type }];
        saveSchedule(updated);
        setShowAddModal(false);
    };

    const removeExercise = (day, index) => {
        const updated = { ...schedule };
        updated[day] = updated[day].filter((_, i) => i !== index);
        saveSchedule(updated);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    };

    const today = new Date().getDay();
    const todayMap = { 1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7', 0: 'CN' };
    const todayLabel = todayMap[today];

    return (
        <div className="container">
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={28} /> Lịch Tập
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Chọn ngày để bắt đầu tập luyện</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                        📊 Dashboard
                    </button>
                    <button className="btn-danger" onClick={handleLogout} title="Đăng xuất">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Weekly Grid */}
            <div className="schedule-grid">
                {DAY_LABELS.map((day) => {
                    const exercises = schedule[day];
                    const isToday = day === todayLabel;
                    const isExpanded = selectedDay === day;
                    const color = DAY_COLORS[day];

                    return (
                        <div
                            key={day}
                            className={`day-card glass-card ${isToday ? 'today' : ''} ${isExpanded ? 'expanded' : ''}`}
                            style={{ borderLeftColor: color }}
                        >
                            <div
                                className="day-header"
                                onClick={() => setSelectedDay(isExpanded ? null : day)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span className="day-name" style={{ color }}>{day}</span>
                                    {isToday && <span className="today-badge">HÔM NAY</span>}
                                    <span className="exercise-count">{exercises.length} bài tập</span>
                                </div>
                                <ChevronRight
                                    size={20}
                                    style={{
                                        transition: 'transform 0.3s',
                                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                                        color: 'var(--text-secondary)'
                                    }}
                                />
                            </div>

                            {isExpanded && (
                                <div className="day-content">
                                    {exercises.length === 0 ? (
                                        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '10px 0' }}>
                                            {day === 'CN' ? '🛋️ Ngày nghỉ ngơi' : 'Chưa có bài tập'}
                                        </p>
                                    ) : (
                                        <div className="exercise-list">
                                            {exercises.map((ex, idx) => (
                                                <div key={idx} className="exercise-item">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <Dumbbell size={16} color={color} />
                                                        <span>{ex.name}</span>
                                                        <span className={`type-badge ${ex.type === 'Compound' ? 'compound' : 'isolation'}`}>
                                                            {ex.type}
                                                        </span>
                                                    </div>
                                                    <button
                                                        className="btn-icon"
                                                        onClick={(e) => { e.stopPropagation(); removeExercise(day, idx); }}
                                                        title="Xóa bài tập"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="day-actions">
                                        <button
                                            className="btn-add"
                                            onClick={(e) => { e.stopPropagation(); openAddModal(day); }}
                                        >
                                            <Plus size={16} /> Thêm bài tập
                                        </button>
                                        {exercises.length > 0 && (
                                            <button
                                                className="btn-primary btn-start"
                                                onClick={(e) => { e.stopPropagation(); startWorkout(day); }}
                                            >
                                                🏋️ Bắt đầu tập
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Exercise Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '20px', color: 'var(--accent-color)' }}>
                            Thêm bài tập - {addingToDay}
                        </h2>
                        <input
                            type="text"
                            placeholder="Tên bài tập (VD: Bench Press)"
                            value={newExercise.name}
                            onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                            autoFocus
                        />
                        <div className="type-selector">
                            <button
                                className={`type-option ${newExercise.type === 'Compound' ? 'active' : ''}`}
                                onClick={() => setNewExercise({ ...newExercise, type: 'Compound' })}
                            >
                                💪 Compound
                                <small>Bài tập đa khớp</small>
                            </button>
                            <button
                                className={`type-option ${newExercise.type === 'Isolation' ? 'active' : ''}`}
                                onClick={() => setNewExercise({ ...newExercise, type: 'Isolation' })}
                            >
                                🎯 Isolation
                                <small>Bài tập đơn khớp</small>
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button className="btn-primary" onClick={addExercise} style={{ flex: 1 }}>
                                Thêm
                            </button>
                            <button className="btn-secondary" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutSchedule;
