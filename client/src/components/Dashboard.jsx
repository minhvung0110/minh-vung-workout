import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
import { Activity, Thermometer, TrendingUp, AlertTriangle } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/workouts', {
                    headers: { 'x-auth-token': token }
                });
                setWorkouts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkouts();
    }, []);

    const chartData = {
        labels: workouts.map(w => new Date(w.startTime).toLocaleDateString()).reverse(),
        datasets: [
            {
                label: 'Total Volume (kg)',
                data: workouts.map(w => w.totalVolume).reverse(),
                borderColor: '#00f2fe',
                backgroundColor: 'rgba(0, 242, 254, 0.2)',
                tension: 0.4,
            },
        ],
    };

    const getRecoveryAdvice = () => {
        if (workouts.length < 2) return "Start training to see recovery insights!";
        const last = workouts[0];
        const prev = workouts[1];

        if (last.totalVolume < prev.totalVolume) {
            return {
                text: "Volume decreased. Check sleep/nutrition or consider a Deload week.",
                type: 'warning'
            };
        } else {
            return {
                text: "Great progress! Consider increasing weight by 1.25-2.5kg next session.",
                type: 'success'
            };
        }
    };

    const advice = getRecoveryAdvice();

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <header style={{ marginBottom: '30px' }}>
                <h1 style={{ color: 'var(--accent-color)' }}>Gym Lab Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track your progressive overload</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-card">
                    <h3><TrendingUp size={20} color="var(--accent-color)" /> Volume Progress</h3>
                    <div style={{ marginTop: '20px' }}>
                        <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3><Activity size={20} color="var(--accent-color)" /> Recovery Engine</h3>
                    <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', background: advice.type === 'warning' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(0, 230, 118, 0.1)', border: `1px solid ${advice.type === 'warning' ? 'var(--danger)' : 'var(--success)'}` }}>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {advice.type === 'warning' ? <AlertTriangle color="var(--danger)" /> : <TrendingUp color="var(--success)" />}
                            {typeof advice === 'string' ? advice : advice.text}
                        </p>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <h3>Recent Sessions</h3>
                <div style={{ marginTop: '15px' }}>
                    {workouts.map((w, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
                            <span>{new Date(w.startTime).toLocaleDateString()}</span>
                            <span style={{ fontWeight: 'bold' }}>{w.totalVolume.toLocaleString()} kg</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{w.duration?.toFixed(0)} mins</span>
                        </div>
                    ))}
                </div>
            </div>

            <button
                className="btn-primary"
                style={{ position: 'fixed', bottom: '30px', right: '30px', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}
                onClick={() => window.location.href = '/workout'}
            >
                + Start Workout
            </button>
        </div>
    );
};

export default Dashboard;
