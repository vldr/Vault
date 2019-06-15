import React from 'react';
import ReactDOM from 'react-dom';

import { Topbar } from './components/topbar/Topbar';
import { List } from './components/list/List';
import { Upload } from './components/upload/Upload';
import ContextMenu from './components/contextmenu/ContextMenu';

export class App extends React.Component
{ 
    render()
    {
        return (
            <>
                <ContextMenu onRef={ref => (this.child = ref)} />
                <div className="content">
                    <Topbar />
                    <List />
                    <Upload />
                </div>
            </>
        );
    }
}

// Render our actual app...
ReactDOM.render(<App />, document.getElementById("root"));