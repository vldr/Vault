import React from 'react';
import ReactDOM from 'react-dom';


import { Topbar } from './components/topbar/Topbar';
import { List } from './components/list/List';
import { Upload } from './components/upload/Upload';

const LoadingContext = React.createContext('light');

export class App extends React.Component
{ 
    render()
    {
        return (
            
            <div className="content">
                <Topbar />
                <List />
                <Upload />
            </div>
        );
    }
}

// Render our actual app...
ReactDOM.render(<App />, document.getElementById("root"));