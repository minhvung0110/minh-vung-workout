import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { TrendingUp, AlertTriangle, ArrowLeft, Calendar } from 'lucide-react';

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
    const navigate = useNavigate();
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
        if (workouts.length < 2) return { text: "Bắt đầu tập luyện để xem phân tích!", type: 'info' };
        const last = workouts[0];
        const prev = workouts[1];

        if (last.totalVolume < prev.totalVolume) {
            return {
                text: "Volume giảm. Kiểm tra giấc ngủ/dinh dưỡng hoặc cân nhắc Deload.",
                type: 'warning'
            };
        } else {
            return {
                text: "Tiến bộ tốt! Cân nhắc tăng tạ 1.25-2.5kg buổi tới.",
                type: 'success'
            };
        }
    };

    const advice = getRecoveryAdvice();

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '40px' }}>Đang tải...</div>;

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ color: 'var(--accent-color)' }}>📊 Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Theo dõi tiến trình tập luyện</p>
                </div>
                <button className="btn-secondary" onClick={() => navigate('/schedule')}>
                    <Calendar size={16} /> Lịch tập
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-card">
                    <h3><TrendingUp size={20} color="var(--accent-color)" /> Volume Progress</h3>
                    <div style={{ marginTop: '20px' }}>
                        {workouts.length > 0 ? (
                            <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '30px 0' }}>Chưa có dữ liệu</p>
                        )}
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3>💡 Recovery Engine</h3>
                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        borderRadius: '8px',
                        background: advice.type === 'warning' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(0, 230, 118, 0.1)',
                        border: `1px solid ${advice.type === 'warning' ? 'var(--danger)' : 'var(--success)'}`
                    }}>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {advice.type === 'warning' ? <AlertTriangle color="var(--danger)" /> : <TrendingUp color="var(--success)" />}
                            {advice.text}
                        </p>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <h3>🕐 Các buổi tập gần đây</h3>
                <div style={{ marginTop: '15px' }}>
                    {workouts.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
                            Chưa có buổi tập nào. Hãy bắt đầu từ Lịch tập!
                        </p>
                    ) : (
                        workouts.slice(0, 10).map((w, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
                                <span>{w.dayOfWeek || ''} - {new Date(w.startTime).toLocaleDateString()}</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{(w.totalVolume || 0).toLocaleString()} kg</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{w.duration?.toFixed(0) || '0'} phút</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
