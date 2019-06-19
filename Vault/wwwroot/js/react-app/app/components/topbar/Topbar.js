import React from 'react';
import styles from '../../App.css';

import { ActionAlert } from '../info/ActionAlert';
import { Settings } from '../action/Settings';
import { NewFolder } from '../action/NewFolder';

export class Topbar extends React.Component
{
    openSettings() { new ActionAlert(<Settings />); }
    openNewFolder() { new ActionAlert(<NewFolder />); }
    openSearch() { this.props.openSearch(); }

    render() {
        return (
            <div className={styles['topbar']}>
                <span className={styles['logo']}>
                    <img src="images/ui/logo.svg" />
                </span>

                <div className={styles['btnSettings']} onClick={this.openSettings.bind(this)} />
                <div className={styles['btnLogout']} />
                <div className={styles['btnHelp']} onClick={this.openSearch.bind(this)} />
                <div className={styles['btnSort']} onClick={this.openNewFolder.bind(this)} />
                <div className={styles['btnUpload']}  />

                <div className={styles['topbar-hider']} />
            </div>
        );
    }
}