import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, BookOpen, LogOut } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    };

    return (
        <div className="container home-container">
            <header className="home-header">
                <div>
                    <h1 className="hero-title">Chào mừng, <span className="accent-text">Minh Vững</span></h1>
                    <p className="hero-subtitle">Hôm nay bạn muốn làm gì?</p>
                </div>
                <button className="btn-icon logout-btn" onClick={handleLogout} title="Đăng xuất">
                    <LogOut size={24} />
                </button>
            </header>

            <div className="home-grid">
                <div className="selection-card glass-card workout-card" onClick={() => navigate('/schedule')}>
                    <div className="card-icon-wrapper">
                        <Dumbbell size={48} className="card-icon" />
                    </div>
                    <div className="card-content">
                        <h2>Tập Luyện</h2>
                        <p>Theo dõi lịch tập, khối lượng và tiến trình phát triển cơ bắp của bạn.</p>
                        <span className="btn-primary start-btn">Bắt đầu ngay</span>
                    </div>
                </div>

                <div className="selection-card glass-card book-card" onClick={() => navigate('/library')}>
                    <div className="card-icon-wrapper">
                        <BookOpen size={48} className="card-icon" />
                    </div>
                    <div className="card-content">
                        <h2>Sách PDF</h2>
                        <p>Thư viện kiến thức, kỹ thuật tập luyện và dinh dưỡng cá nhân.</p>
                        <span className="btn-secondary start-btn">Mở thư viện</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
