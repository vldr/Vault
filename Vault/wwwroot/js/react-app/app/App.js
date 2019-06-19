import React from 'react';
import ReactDOM from 'react-dom';
import ContextMenu from './components/contextmenu/ContextMenu';

import { Topbar } from './components/topbar/Topbar';
import { List } from './components/list/List';
import { Upload } from './components/upload/Upload';
import { Search } from './components/search/Search';

import styles from './App.css';

export class App extends React.Component
{
    openSearch() { this.search.open(); }

    render()
    {
        return (
            <>
                <ContextMenu />

                <div className={styles['content']}>
                    <Topbar openSearch={this.openSearch.bind(this)} />
                    <List />
                    <Upload />
                </div>

                <Search ref={(ref) => { this.search = ref; }} />
            </>
        );
    }
}

// Render our actual app...
ReactDOM.render(<App />, document.getElementById("app"));