import React from 'react';
import styles from '../../App.css';

export class Topbar extends React.Component
{
    render() {
        return (
            <div className={styles['topbar']}>
                <span className={styles['logo']}>
                    <img src="images/ui/logo.svg" />
                </span>

                <div className={styles['btnSettings']} />
                <div className={styles['btnLogout']} />
                <div className={styles['btnHelp']} />
                <div className={styles['btnSort']} />
                <div className={styles['btnUpload']}  />

                <div className={styles['topbar-hider']} />
            </div>
        );
    }
}