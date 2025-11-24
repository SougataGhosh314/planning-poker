import React, { useState } from 'react';
import { socket } from '../socket';
import styles from './LandingPage.module.css';

export function LandingPage({ onJoin }) {
    const [name, setName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [isCreating, setIsCreating] = useState(true);
    const [role, setRole] = useState('estimator'); // estimator or observer

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name) return alert('Please enter your name');
        if (!isCreating && !roomId) return alert('Please enter a Room ID');

        const finalRoomId = isCreating ? Math.random().toString(36).substring(2, 8).toUpperCase() : roomId;

        if (isCreating) {
            // Just switch view, RoomPage will handle the actual join
            onJoin(finalRoomId, name, role);
        } else {
            // Check if room exists before joining
            socket.emit('check_room', finalRoomId, (exists) => {
                if (exists) {
                    // Just switch view, RoomPage will handle the actual join
                    onJoin(finalRoomId, name, role);
                } else {
                    alert('Room not found! Please check the ID or create a new room.');
                }
            });
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Planning Poker</h1>
            <div className={styles.card}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${isCreating ? styles.active : ''}`}
                        onClick={() => setIsCreating(true)}
                    >
                        Create Room
                    </button>
                    <button
                        className={`${styles.tab} ${!isCreating ? styles.active : ''}`}
                        onClick={() => setIsCreating(false)}
                    >
                        Join Room
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            autoFocus
                        />
                    </div>

                    {!isCreating && (
                        <div className={styles.inputGroup}>
                            <label>Room ID</label>
                            <input
                                type="text"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                                placeholder="Enter Room ID"
                            />
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label>I am an</label>
                        <div className={styles.radioGroup}>
                            <label className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    checked={role === 'estimator'}
                                    onChange={() => setRole('estimator')}
                                />
                                Estimator
                            </label>
                            <label className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    checked={role === 'observer'}
                                    onChange={() => setRole('observer')}
                                />
                                Observer
                            </label>
                        </div>
                    </div>

                    <button type="submit" className={styles.submitButton}>
                        {isCreating ? 'Start Session' : 'Enter Room'}
                    </button>
                </form>
            </div>
        </div>
    );
}
