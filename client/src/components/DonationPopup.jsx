import React from 'react';
import styles from './DonationPopup.module.css';
import qrCode from '../assets/UPI_QR.jpg';

export function DonationPopup({ onClose }) {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                <h2 className={styles.title}>Support the Developer</h2>
                <div className={styles.imageContainer}>
                    <img src={qrCode} alt="UPI QR Code" className={styles.qrImage} />
                </div>
                <p className={styles.text}>Scan to donate via UPI</p>
            </div>
        </div>
    );
}
