import React from 'react';
import styles from '../../App.css';

import { ActionAlert } from '../info/ActionAlert';
import { Settings } from '../action/Settings';

export class Topbar extends React.Component
{
    openSettings() { new ActionAlert(<Settings />) }

    render() {
        return (
            <div className={styles['topbar']}>
                <span className={styles['logo']}>
                    <img src="images/ui/logo.svg" />
                </span>

                <div className={styles['btnSettings']} onClick={this.openSettings.bind(this)} />
                <div className={styles['btnLogout']} />
                <div className={styles['btnHelp']} />
                <div className={styles['btnSort']} />
                <div className={styles['btnUpload']}  />

                <div className={styles['topbar-hider']} />
            </div>
        );
    }
}