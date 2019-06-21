import React, { Suspense }  from 'react';
import ReactDOM from 'react-dom';
import ContextMenu from './components/contextmenu/ContextMenu';

const Topbar = React.lazy(() => import('./components/topbar/Topbar'));
const List = React.lazy(() => import('./components/list/List'));
const Upload = React.lazy(() => import('./components/upload/Upload'));
const Search = React.lazy(() => import('./components/search/Search'));
const Viewer = React.lazy(() => import('./components/viewer/Viewer'));

import styles from './App.css';

export class App extends React.Component
{
    openViewer(fileId) { this.viewer.onOpen(fileId); }

    openSearch() { this.search.open(); }
    updateSearch() { this.search.onSearch(); }
    closeSearch() { this.search.close(); }

    gotoFolder(folderId) { this.list.gotoFolder(folderId); }

    render()
    {
        const loader = (<div className={styles["intro-box"]}>
            <img src="images/ui/logo.svg" />
        </div>);

        return (
            <Suspense fallback={loader}>
                <ContextMenu />

                <div className={styles['content']}>
                    <Topbar openSearch={this.openSearch.bind(this)} />

                    <List ref={(ref) => { this.list = ref; }}
                        updateSearch={this.updateSearch.bind(this)}
                        closeSearch={this.closeSearch.bind(this)}
                        openViewer={this.openViewer.bind(this)}
                    />

                    <Upload />
                </div>

                <Search ref={(ref) => { this.search = ref; }} gotoFolder={this.gotoFolder.bind(this)} />
                <Viewer ref={(ref) => { this.viewer = ref; }} closeSearch={this.closeSearch.bind(this)} />
            </Suspense>
        );
    }
}

// Render our actual app...
ReactDOM.render(<App />, document.getElementById("app"));