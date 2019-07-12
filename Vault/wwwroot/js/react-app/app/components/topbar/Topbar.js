﻿import React from 'react';
import styles from '../../app/App.css';

import { Sortbar } from '../list/Sortbar';
import { ActionAlert } from '../info/ActionAlert';
import { Settings } from '../action/Settings';
import { NewFolder } from '../action/NewFolder';
import { Logout } from '../action/Logout';

class Topbar extends React.Component
{
    constructor(props) {
        super(props);

        this.state = {
            isSortOpen: false
        };
    }

    openSettings() { new ActionAlert(<Settings />); }
    openNewFolder() { new ActionAlert(<NewFolder />); }
    openLogout() { new ActionAlert(<Logout />); }

    openSort() { this.setState({ isSortOpen: true }); }
    closeSort() { this.setState({ isSortOpen: false }); }

    openSearch() { this.props.openSearch(); }

    render()
    {
        
        const sortStyle = this.state.isSortOpen ?
            {
                paddingLeft: "11px",
                display: "inline-flex",
                width: "165px",
                background: "#f5f5f5"
            } : {};

        const sortButtonStyle = this.state.isSortOpen ?
            {
                opacity: "0",
                margin: "0",
                width: "0",
            } : {};

        return (
            <div className={styles['topbar']}>
                <span className={styles['logo']}>
                    <img src="images/ui/logo.svg" />
                </span>

                <div className={styles['btnSettings']} onClick={this.openSettings.bind(this)} />
                <div className={styles['btnLogout']} onClick={this.openLogout.bind(this)} />
                <div className={styles['btnHelp']} onClick={this.openSearch.bind(this)} />
                <div className={styles['btnNewFolder']} onClick={this.openNewFolder.bind(this)} />

                <div className={styles['btnSort']} style={sortStyle}
                    onTouchStart={this.openSort.bind(this)}
                    onMouseEnter={this.openSort.bind(this)}
                    onMouseLeave={this.closeSort.bind(this)}>
                    <img className={styles['sorting-arrow']} style={sortButtonStyle} src="../../../images/ui/sort.svg" />
                    <Sortbar ref={(ref) => this.sortBar = ref} />
                </div>

                <div className={styles['btnUpload']}  />
                <div className={styles['topbar-hider']} />
            </div>
        );
    }
}

export default Topbar;