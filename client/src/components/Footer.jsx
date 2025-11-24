import React from 'react';
import styles from './Footer.module.css';

export function Footer({ onDonate }) {
    return (
        <footer className={styles.footer}>
            <p>
                Built with ❤️. No data is persisted on the server.
            </p>
            <button className={styles.donateLink} onClick={onDonate}>
                Help me grow? Donate via UPI
            </button>
        </footer>
    );
}
