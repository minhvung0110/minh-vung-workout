import React, { useState, useEffect, useRef } from 'react';

const SmartTimer = ({ type, onFinish }) => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const timerRef = useRef(null);

    // Default targets based on exercise type
    const target = type === 'Compound' ? 180 : 90; // 3 mins vs 1.5 mins

    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive]);

    const handleStop = () => {
        setIsActive(false);
        onFinish(seconds);
    };

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = Math.min((seconds / target) * 100, 100);

    return (
        <div className="glass-card" style={{ textAlign: 'center', marginBottom: '20px', border: isActive ? `1px solid var(--accent-color)` : '' }}>
            <h3 style={{ color: 'var(--accent-color)' }}>Rest Timer ({type})</h3>
            <div style={{ fontSize: '3rem', margin: '10px 0', fontWeight: 'bold' }}>
                {formatTime(seconds)}
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 1s linear' }}></div>
            </div>
            <button className="btn-primary" onClick={handleStop}>Finish Rest & Next Set</button>
            {seconds >= target && <div style={{ color: 'var(--danger)', marginTop: '10px', animation: 'pulse 1s infinite' }}>Time to get back!</div>}
        </div>
    );
};

export default SmartTimer;
