import React, { useEffect, useState } from 'react';
import { socket } from '../socket';
import styles from './RoomPage.module.css';

const CARDS = [1, 2, 3, 5, 8, '?', '☕'];

export function RoomPage({ roomId, userName, role, onLeave }) {
    const [room, setRoom] = useState(null);
    const [myVote, setMyVote] = useState(null);

    useEffect(() => {
        socket.on('room_update', (updatedRoom) => {
            setRoom(updatedRoom);
            // Update my vote from server state if needed (e.g. after rejoin)
            const me = updatedRoom.users.find(u => u.name === userName); // Simple match by name for now
            if (me) {
                setMyVote(me.vote);
            }
        });

        // Emit join_room now that listener is ready
        socket.emit('join_room', { roomId, name: userName, role });

        return () => {
            socket.off('room_update');
        };
    }, [userName]);

    const handleDescriptionChange = (e) => {
        socket.emit('update_description', { roomId, description: e.target.value });
    };

    const handleVote = (card) => {
        if (role === 'observer') return;
        setMyVote(card);
        socket.emit('vote', { roomId, vote: card });
    };

    const handleReveal = () => {
        socket.emit('reveal_results', { roomId });
    };

    const handleReset = () => {
        socket.emit('reset_round', { roomId });
        setMyVote(null);
    };

    if (!room) return <div className={styles.loading}>Loading Room...</div>;

    const estimators = room.users.filter(u => u.role === 'estimator');
    const observers = room.users.filter(u => u.role === 'observer');

    // Calculate stats
    const votes = estimators.map(u => u.vote).filter(v => v !== null);
    const voteCounts = votes.reduce((acc, v) => {
        acc[v] = (acc[v] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.roomInfo}>
                    <h1>Room: {roomId}</h1>
                    <span className={styles.userBadge}>{userName} ({role})</span>
                </div>
                <button onClick={onLeave} className={styles.leaveButton}>Leave Room</button>
            </header>

            <main className={styles.main}>
                <div className={styles.centerStage}>
                    <div className={styles.descriptionBox}>
                        <label>Story / Task Description</label>
                        <textarea
                            value={room.description}
                            onChange={handleDescriptionChange}
                            placeholder="Enter task details here..."
                            rows={3}
                        />
                    </div>

                    <div className={styles.tableArea}>
                        {room.reveal ? (
                            <div className={styles.results}>
                                <h2>Results</h2>

                                <div className={styles.revealGrid}>
                                    {estimators.map((user) => (
                                        <div key={user.id} className={styles.revealCard}>
                                            <div className={styles.cardFace}>
                                                {user.vote || '-'}
                                            </div>
                                            <span className={styles.voterName}>{user.name}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.chart}>
                                    {Object.entries(voteCounts).map(([card, count]) => (
                                        <div key={card} className={styles.barGroup}>
                                            <div className={styles.bar} style={{ height: `${count * 20}px` }}></div>
                                            <span className={styles.barLabel}>{card} ({count})</span>
                                        </div>
                                    ))}
                                    {votes.length === 0 && <p>No votes cast.</p>}
                                </div>
                                <button onClick={handleReset} className={styles.actionButton}>New Round</button>
                            </div>
                        ) : (
                            <div className={styles.votingStatus}>
                                <h2>Voting in progress...</h2>
                                <button onClick={handleReveal} className={styles.actionButton}>Reveal Results</button>
                            </div>
                        )}
                    </div>

                    {role === 'estimator' && !room.reveal && (
                        <div className={styles.cardsContainer}>
                            {CARDS.map(card => (
                                <button
                                    key={card}
                                    className={`${styles.card} ${myVote === card ? styles.selected : ''}`}
                                    onClick={() => handleVote(card)}
                                >
                                    {card}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.userGroup}>
                        <h3>Estimators ({estimators.length})</h3>
                        <ul className={styles.userList}>
                            {estimators.map((user, idx) => (
                                <li key={idx} className={styles.userItem}>
                                    <span className={styles.userName}>{user.name}</span>
                                    <span className={styles.userStatus}>
                                        {room.reveal ? (
                                            <span className={styles.revealedVote}>{user.vote || '-'}</span>
                                        ) : (
                                            user.vote ? '✅' : '⏳'
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {observers.length > 0 && (
                        <div className={styles.userGroup}>
                            <h3>Observers ({observers.length})</h3>
                            <ul className={styles.userList}>
                                {observers.map((user, idx) => (
                                    <li key={idx} className={styles.userItem}>
                                        <span className={styles.userName}>{user.name}</span>
                                        <span className={styles.userStatus}>👀</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
}
