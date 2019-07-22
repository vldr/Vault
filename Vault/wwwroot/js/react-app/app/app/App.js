import React, { Suspense }  from 'react';
import ReactDOM from 'react-dom';

const ContextMenu = React.lazy(() => import('../components/contextmenu/ContextMenu'));
const Topbar = React.lazy(() => import('../components/topbar/Topbar'));
const List = React.lazy(() => import('../components/list/List'));
const Upload = React.lazy(() => import('../components/upload/Upload'));
const Search = React.lazy(() => import('../components/search/Search'));
const Viewer = React.lazy(() => import('../components/viewer/Viewer'));

import { ErrorBoundary } from '../components/info/ErrorBoundary';

import styles from './App.css';

export class App extends React.Component
{
    /**
     * Starts up our upload component only if the topbar and upload
     * references are present... (needed so dropzone has a clickable attribute)
     */
    update()
    {
        // Check if topbar and upload are set...
        if (this.topbar && this.upload) this.upload.start();
    }

    openViewer(fileId) { this.viewer.onOpen(fileId); }

    openSearch() { this.search.open(); }
    updateSearch(object, type) { this.search.updateSearch(object, type); }
    closeSearch() { this.search.close(); }

    setPassword(password) { return this.upload.setPassword(password); } 

    gotoFolder(folderId) { this.list.gotoFolder(folderId); }
    openFileLocation(fileId) { this.list.openFileLocation(fileId); }

    render()
    {
        const loader = (<div className={styles["intro-box"]}>
            <img src="images/ui/logo.svg" />
        </div>);

        return (
            <ErrorBoundary>
                <Suspense fallback={loader}>
                    <ContextMenu />

                    <div className={styles['content']}>
                        <Topbar ref={(ref) => { this.topbar = ref; this.update(); }}
                            openSearch={this.openSearch.bind(this)}
                            setPassword={this.setPassword.bind(this)}/>

                        <List ref={(ref) => { this.list = ref; }}
                            updateSearch={this.updateSearch.bind(this)}
                            closeSearch={this.closeSearch.bind(this)}
                            openViewer={this.openViewer.bind(this)}
                        /> 

                        <Upload ref={(ref) => { this.upload = ref; this.update(); }} />
                    </div>

                    <Search ref={(ref) => { this.search = ref; }}
                        gotoFolder={this.gotoFolder.bind(this)}
                        openFileLocation={this.openFileLocation.bind(this)}
                        openViewer={this.openViewer.bind(this)}
                    />

                    <Viewer ref={(ref) => { this.viewer = ref; }} closeSearch={this.closeSearch.bind(this)} />
                </Suspense>
            </ErrorBoundary>
        );
    }
}

// Render our actual app...
ReactDOM.render(<App />, document.getElementById("app"));