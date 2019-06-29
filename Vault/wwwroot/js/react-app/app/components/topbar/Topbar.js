import React from 'react';
import styles from '../../app/App.css';

import { ActionAlert } from '../info/ActionAlert';
import { Settings } from '../action/Settings';
import { NewFolder } from '../action/NewFolder';
import { Logout } from '../action/Logout';

class Topbar extends React.Component
{
    openSettings() { new ActionAlert(<Settings />); }
    openNewFolder() { new ActionAlert(<NewFolder />); }
    openLogout() { new ActionAlert(<Logout />); }
    openSearch() { this.props.openSearch(); }

    render() {
        return (
            <div className={styles['topbar']}>
                <span className={styles['logo']}>
                    <img src="images/ui/logo.svg" />
                </span>

                <div className={styles['btnSettings']} onClick={this.openSettings.bind(this)} />
                <div className={styles['btnLogout']} onClick={this.openLogout.bind(this)} />
                <div className={styles['btnHelp']} onClick={this.openSearch.bind(this)} />
                <div className={styles['btnSort']} onClick={this.openNewFolder.bind(this)} />
                <div className={styles['btnUpload']}  />

                <div className={styles['topbar-hider']} />
            </div>
        );
    }
}

export default Topbar;