import { Save, Plus, Trash2, TrendingUp, ArrowLeft, X, Edit2, Check, Activity, TrendingDown } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ActiveWorkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { day, exercises: presetExercises } = location.state || {};

    const [workout, setWorkout] = useState({
        exercises: [],
        dayOfWeek: day || '',
        startTime: new Date(),
    });
    const [showTimer, setShowTimer] = useState(false);
    const [timerType, setTimerType] = useState('Compound');
    const [currentTimerSetInfo, setCurrentTimerSetInfo] = useState(null);
    const [showAddExercise, setShowAddExercise] = useState(false);
    const [newExName, setNewExName] = useState('');
    const [newExType, setNewExType] = useState('Compound');
    const [lastSessionData, setLastSessionData] = useState({});
    const [allWorkouts, setAllWorkouts] = useState([]);
    const [editingExIdx, setEditingExIdx] = useState(null);
    const [tempExName, setTempExName] = useState('');
    const [showAnalytics, setShowAnalytics] = useState(null); // stores { name, data }

    // Initialize exercises from schedule
    useEffect(() => {
        if (presetExercises && presetExercises.length > 0) {
            const initialized = presetExercises.map((ex, idx) => ({
                exerciseId: `ex_${idx}_${Date.now()}`,
                name: ex.name,
                type: ex.type,
                restTime: ex.restTime || (ex.type === 'Compound' ? 180 : 90),
                sets: [{ setNumber: 1, weight: 0, reps: 0, rpe: 0, restTime: 0 }]
            }));
            setWorkout(prev => ({ ...prev, exercises: initialized }));
        }
    }, []);

    // Fetch last session data
    useEffect(() => {
        const fetchLastData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/workouts', {
                    headers: { 'x-auth-token': token }
                });
                if (res.data && res.data.length > 0) {
                    const lastDataMap = {};
                    res.data.forEach(w => {
                        w.exercises.forEach(ex => {
                            const normalizedName = ex.name.trim();
                            if (!lastDataMap[normalizedName]) {
                                lastDataMap[normalizedName] = ex;
                            }
                        });
                    });
                    setLastSessionData(lastDataMap);
                    setAllWorkouts(res.data);
                }
            } catch (err) {
                console.error('Error fetching last data:', err);
            }
        };
        fetchLastData();
    }, []);

    const addExercise = () => {
        if (!newExName.trim()) return;
        const newEx = {
            exerciseId: `ex_${Date.now()}`,
            name: newExName.trim(),
            type: newExType,
            restTime: newExType === 'Compound' ? 180 : 90,
            sets: [{ setNumber: 1, weight: 0, reps: 0, rpe: 0, restTime: 0 }]
        };
        setWorkout({ ...workout, exercises: [...workout.exercises, newEx] });
        setNewExName('');
        setShowAddExercise(false);
    };

    const removeExercise = (exIndex) => {
        const updatedEx = workout.exercises.filter((_, i) => i !== exIndex);
        setWorkout({ ...workout, exercises: updatedEx });
    };

    const updateSet = (exIndex, setIndex, field, value) => {
        const updatedEx = [...workout.exercises];
        updatedEx[exIndex].sets[setIndex][field] = Number(value);
        setWorkout({ ...workout, exercises: updatedEx });
    };

    const completeSet = (exIndex, setIndex) => {
        setTimerType(workout.exercises[exIndex].type);
        setCurrentTimerSetInfo({
            exIndex,
            setIndex,
            customRest: workout.exercises[exIndex].restTime
        });
        setShowTimer(true);

        // Auto-add next set
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

    const removeSet = (exIndex, setIndex) => {
        const updatedEx = [...workout.exercises];
        if (updatedEx[exIndex].sets.length <= 1) return;
        updatedEx[exIndex].sets = updatedEx[exIndex].sets.filter((_, i) => i !== setIndex);
        updatedEx[exIndex].sets.forEach((s, i) => s.setNumber = i + 1);
        setWorkout({ ...workout, exercises: updatedEx });
    };

    const handleTimerFinish = (seconds) => {
        setShowTimer(false);
        if (currentTimerSetInfo) {
            const { exIndex, setIndex } = currentTimerSetInfo;
            const updatedEx = [...workout.exercises];
            updatedEx[exIndex].sets[setIndex].restTime = seconds;
            setWorkout({ ...workout, exercises: updatedEx });
        }
        setCurrentTimerSetInfo(null);
    };

    const saveWorkout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/workouts', {
                ...workout,
                endTime: new Date()
            }, { headers: { 'x-auth-token': token } });
            alert('💪 Workout đã được lưu!');
            navigate('/schedule');
        } catch (err) {
            console.error('Save error:', err);
            alert('Lỗi khi lưu: ' + (err.response?.data?.msg || err.message));
        }
    };

    const getLastData = (exerciseName) => {
        if (!exerciseName) return null;
        return lastSessionData[exerciseName.trim()];
    };

    const startEditingName = (idx, name) => {
        setEditingExIdx(idx);
        setTempExName(name);
    };

    const saveExerciseName = (idx) => {
        const updatedEx = [...workout.exercises];
        updatedEx[idx].name = tempExName.trim();
        setWorkout({ ...workout, exercises: updatedEx });
        setEditingExIdx(null);
    };

    const openAnalytics = (exName) => {
        const history = allWorkouts
            .map(w => {
                const ex = w.exercises.find(e => e.name.toLowerCase().trim() === exName.toLowerCase().trim());
                if (!ex) return null;
                // Get best 1RM from this session
                const best1RM = Math.max(...ex.sets.map(s => s.weight * (1 + s.reps / 30) || 0));
                return {
                    date: new Date(w.startTime).toLocaleDateString(),
                    volume: ex.sets.reduce((sum, s) => sum + (s.weight * s.reps || 0), 0),
                    oneRepMax: best1RM
                };
            })
            .filter(Boolean)
            .reverse();

        setShowAnalytics({ name: exName, data: history });
    };

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button className="btn-icon" onClick={() => navigate('/schedule')} title="Quay lại">
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 style={{ color: 'var(--accent-color)' }}>
                            {day ? `${day}` : 'Workout'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {workout.exercises.length} bài tập
                        </p>
                    </div>
                </div>
                <button className="btn-primary" onClick={saveWorkout}>
                    <Save size={18} /> Lưu & Kết thúc
                </button>
            </header>

            {/* {showTimer && <SmartTimer type={timerType} onFinish={handleTimerFinish} />} */}

            {/* Exercise List */}
            {workout.exercises.map((ex, exIdx) => {
                const lastData = getLastData(ex.name);
                return (
                    <div key={exIdx} className="glass-card exercise-card" style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                {editingExIdx === exIdx ? (
                                    <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                                        <input
                                            type="text"
                                            value={tempExName}
                                            onChange={(e) => setTempExName(e.target.value)}
                                            style={{ margin: 0, padding: '5px 10px', fontSize: '1rem' }}
                                            autoFocus
                                        />
                                        <button className="btn-icon" onClick={() => saveExerciseName(exIdx)} style={{ color: 'var(--success)' }}>
                                            <Check size={18} />
                                        </button>
                                        <button className="btn-icon" onClick={() => setEditingExIdx(null)}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>
                                            {ex.name}
                                            <span className={`type-badge ${ex.type === 'Compound' ? 'compound' : 'isolation'}`} style={{ marginLeft: '10px' }}>
                                                {ex.type}
                                            </span>
                                        </h2>
                                        <button className="btn-icon-sm" onClick={() => startEditingName(exIdx, ex.name)} title="Sửa tên">
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="btn-icon-sm" onClick={() => openAnalytics(ex.name)} title="Lịch sử bài tập" style={{ color: 'var(--accent-color)' }}>
                                            <Activity size={14} />
                                        </button>
                                    </>
                                )}
                            </div>
                            <button className="btn-icon btn-icon-danger" onClick={() => removeExercise(exIdx)} title="Xóa bài tập">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Last Session Reference */}
                        {lastData && (
                            <div className="last-session-box">
                                <TrendingUp size={14} />
                                <span>Lần trước: </span>
                                {lastData.sets && lastData.sets.map((s, i) => (
                                    <span key={i} className="last-set-chip">
                                        S{s.setNumber}: {s.weight}kg × {s.reps} {s.restTime > 0 && <small style={{ opacity: 0.7 }}>({s.restTime}s)</small>}
                                    </span>
                                ))}
                            </div>
                        )}

                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                    <th style={{ padding: '8px 0' }}>SET</th>
                                    <th>KG</th>
                                    <th>REPS</th>
                                    <th>RPE</th>
                                    <th>REST</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {ex.sets.map((set, setIdx) => (
                                    <tr key={setIdx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '10px 0', fontWeight: 'bold', color: 'var(--accent-color)' }}>{set.setNumber}</td>
                                        <td><input type="number" className="set-input" value={set.weight || ''} placeholder="0" onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)} /></td>
                                        <td><input type="number" className="set-input" value={set.reps || ''} placeholder="0" onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)} /></td>
                                        <td><input type="number" className="set-input" value={set.rpe || ''} placeholder="0" onChange={(e) => updateSet(exIdx, setIdx, 'rpe', e.target.value)} /></td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{set.restTime ? `${set.restTime}s` : '-'}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => completeSet(exIdx, setIdx)} className="btn-done">✓</button>
                                                {ex.sets.length > 1 && (
                                                    <button onClick={() => removeSet(exIdx, setIdx)} className="btn-icon-sm">
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {showTimer && currentTimerSetInfo?.exIndex === exIdx && (
                            <div style={{ marginTop: '20px' }}>
                                <SmartTimer
                                    type={timerType}
                                    onFinish={handleTimerFinish}
                                    targetSeconds={currentTimerSetInfo.customRest}
                                />
                            </div>
                        )}

                        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Est. 1RM: <strong>{ex.sets[0].weight > 0 && ex.sets[0].reps > 0 ? (ex.sets[0].weight * (1 + ex.sets[0].reps / 30)).toFixed(1) : '0.0'}kg</strong>
                            {' | '}
                            Volume: <strong>{ex.sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0).toLocaleString()}kg</strong>
                        </div>
                    </div>
                );
            })}

            {/* Add Exercise Button */}
            {!showAddExercise ? (
                <button className="btn-add-exercise" onClick={() => setShowAddExercise(true)}>
                    <Plus size={20} /> Thêm bài tập
                </button>
            ) : (
                <div className="glass-card" style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '15px', color: 'var(--accent-color)' }}>Thêm bài tập mới</h3>
                    <input
                        type="text"
                        placeholder="Tên bài tập"
                        value={newExName}
                        onChange={(e) => setNewExName(e.target.value)}
                        autoFocus
                    />
                    <div className="type-selector" style={{ marginBottom: '15px' }}>
                        <button
                            className={`type-option ${newExType === 'Compound' ? 'active' : ''}`}
                            onClick={() => setNewExType('Compound')}
                        >
                            💪 Compound
                        </button>
                        <button
                            className={`type-option ${newExType === 'Isolation' ? 'active' : ''}`}
                            onClick={() => setNewExType('Isolation')}
                        >
                            🎯 Isolation
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-primary" onClick={addExercise}>Thêm</button>
                        <button className="btn-secondary" onClick={() => setShowAddExercise(false)}>Hủy</button>
                    </div>
                </div>
            )}

            {/* Analytics Modal */}
            {showAnalytics && (
                <div className="modal-overlay" onClick={() => setShowAnalytics(null)}>
                    <div className="modal glass-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ color: 'var(--accent-color)' }}>📈 {showAnalytics.name}</h2>
                            <button className="btn-icon" onClick={() => setShowAnalytics(null)}><X size={20} /></button>
                        </div>

                        {showAnalytics.data.length > 0 ? (
                            <div style={{ padding: '10px' }}>
                                <Line
                                    data={{
                                        labels: showAnalytics.data.map(d => d.date),
                                        datasets: [
                                            {
                                                label: 'Estimated 1RM (kg)',
                                                data: showAnalytics.data.map(d => d.oneRepMax.toFixed(1)),
                                                borderColor: '#00f2fe',
                                                backgroundColor: 'rgba(0, 242, 254, 0.2)',
                                                tension: 0.3,
                                            },
                                            {
                                                label: 'Volume (kg)',
                                                data: showAnalytics.data.map(d => d.volume),
                                                borderColor: '#4facfe',
                                                backgroundColor: 'rgba(79, 172, 254, 0.1)',
                                                borderDash: [5, 5],
                                                tension: 0.3,
                                            }
                                        ]
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'top', labels: { color: '#ccc' } }
                                        },
                                        scales: {
                                            x: { ticks: { color: '#888' } },
                                            y: { ticks: { color: '#888' } }
                                        }
                                    }}
                                />
                                <div style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    Tiến độ tốt nhất (1RM): <strong>{Math.max(...showAnalytics.data.map(d => d.oneRepMax)).toFixed(1)}kg</strong>
                                </div>
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>Chưa có đủ dữ liệu lịch sử để hiển thị biểu đồ.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveWorkout;
