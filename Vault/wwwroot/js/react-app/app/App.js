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
    render()
    {
        return (
            <>
                <ContextMenu onRef={ref => (this.child = ref)} />

                <div className={styles['content']}>
                    <Topbar />
                    <List />
                    <Upload />
                </div>

                <Search />
            </>
        );
    }
}

// Render our actual app...
ReactDOM.render(<App />, document.getElementById("app"));