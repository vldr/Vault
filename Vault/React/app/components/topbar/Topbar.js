import React from 'react';
import ContextMenu from '../contextmenu/ContextMenu';
import styles from '../../app/App.css';

import { Sortbar } from '../list/Sortbar';
import { ActionAlert } from '../info/ActionAlert';
import { Settings } from '../action/Settings';
import { NewFolder } from '../action/NewFolder';
import { NewFlashcardSet } from '../action/NewFlashcardSet';
import { Logout } from '../action/Logout';

class Topbar extends React.Component
{
    constructor(props) {
        super(props);

        this.state = {
            isSortOpen: false
        };
    }

    openSettings() {
        new ActionAlert(<Settings />);
    }

    openLogout() { new ActionAlert(<Logout />); }

    openSort()
    {
        // Set our state to make our sortbar visible...
        this.setState({ isSortOpen: true });

        // Set our visual sort upon opening...
        this.sortBar.setVisualSort(window.sort);
    }

    closeSort() { this.setState({ isSortOpen: false }); }

    openSearch() { this.props.openSearch(); }

    showContextMenu(event) {
        const options = (
            <>
                <li className={styles["menu-option"]} onClick={() => new ActionAlert(<NewFolder />)}>New Folder</li>
                <li className={styles["menu-option"]} onClick={() => new ActionAlert(<NewFlashcardSet />)}>New Flashcard Set</li>
            </>
        );

        this.contextMenu.toggleMenu(event, options);
    }

    render()
    {
        
        const sortStyle = this.state.isSortOpen ? styles['btnSortOpen'] : ``;

        const sortButtonStyle = this.state.isSortOpen ?
            {
                opacity: "0",
                margin: "0",
                width: "0",
            } : {};

        return (
            <div className={styles['topbar']}>
                <ContextMenu ref={(ref) => { this.contextMenu = ref; }} disabled />
                <span className={styles['logo']}>
                    <img src="images/ui/logo.svg" />
                </span>

                <div className={styles['btnSettings']} onClick={this.openSettings.bind(this)} />
                <div className={styles['btnLogout']} onClick={this.openLogout.bind(this)} />
                <div className={styles['btnHelp']} onClick={this.openSearch.bind(this)} />
                <div className={styles['btnNewFolder']} onClick={this.showContextMenu.bind(this)} />

                <div className={`${styles['btnSort']} ${sortStyle}`}
                    onTouchStart={this.openSort.bind(this)}
                    onMouseEnter={this.openSort.bind(this)}
                    onMouseLeave={this.closeSort.bind(this)}>
                    <img className={styles['sorting-arrow']} style={sortButtonStyle} src="images/ui/sort.svg" />
                    <Sortbar ref={(ref) => this.sortBar = ref} />
                </div>

                <div className={styles['btnUpload']}  />
                <div className={styles['topbar-hider']} />
            </div>
        );
    }
}

export default Topbar;