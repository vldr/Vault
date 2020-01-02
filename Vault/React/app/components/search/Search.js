import React from 'react';
import styles from '../../app/App.css';

import { ActionAlert } from '../info/ActionAlert';
import { File } from '../list/File';
import { Folder } from '../list/Folder';

class Search extends React.Component
{
    constructor(props)
    {
        super(props);

        // Setup our states...
        this.state =
        {
            isSearching: false,
            isLoading: false,
            response: null
        };
    }

    /**
     * Override the onkeyup event globally.
     */
    componentDidMount()
    {
        // Hook our onkeypress event...
        document.documentElement.onkeypress = (event) =>
        {
            // Check if a modal or a overlay is open...
            if (document.querySelector(".swal-overlay--show-modal")
                || document.querySelector(`.${styles['overlay']}`))
                return;

            // Check if SPACE or ENTER was pressed...
            if (event.keyCode === 32 || event.keyCode === 13) return;

            // Check if ESCAPE was pressed and we're currently searching...
            if (event.keyCode === 27 && this.state.isSearching)
            {
                // Set our state to display if we're searching...
                this.setState({ isSearching: false });

                // Return here...
                return;
            }

            // Set our state to display if we're searching...
            this.setState({ isSearching: true });
        };
    }

    onClose(event)
    {
        // Make sure the target was the overlay...
        if (event.target.className !== styles['overlay']) return;

        // Close our overlay...
        this.close();
    }

    onSearch()
    {
        // Don't perform search if the box is empty...
        if (!this.state.isSearching || !this.searchBox.value) return;

        // Set our state to be started...
        this.setState({
            isLoading: true
        });

        // Fetch our delete file request...
        fetch("process/search",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `term=${encodeURIComponent(this.searchBox.value)}`
            })
            .then(res => res.json())
            .then(
                (result) => {
                    // Check if we're not logged in or something...
                    if (!result.success) {
                        // Stop our loading state...
                        this.setState({ isLoading: false });

                        // Render a action alert...
                        new ActionAlert(<p>{result.reason}</p>);
                    }
                    // Set our response and turn off isLoading...
                    else 
                        this.setState({ response: result, isLoading: false });
                },
                (error) => {
                    // Stop our loading state...
                    this.setState({ isLoading: false });

                    // Render a action alert...
                    new ActionAlert(<p>{error.message}</p>);
                }
            );
    }

    updateSearch(object, type)
    {
        // Setup our response...
        const { response } = this.state;

        // Check if our response exists...
        if (!response) return;

        // Setup our response objects depending whether file or folder...
        const responseObjects = type === 'FILE' ? response.files : response.folders;

        // Attempt to find our file or folder...
        const index = responseObjects.findIndex((x) => x.id === object.id);

        // Check if index exists...
        if (index !== -1)
        {
            // Check if object was deleted entirely...
            if (object.folder === -1)
                responseObjects.splice(index, 1);
            // Otherwise, update it...
            else
                // Copy the new object to our folders list...
                responseObjects[index] = object;

            // Update our state...
            this.setState({ response: response });
        }
    }

    close() {
        // Set our state to hide our search overlay...
        this.setState({ isSearching: false, response: null });
    }

    open() {
        // Set our state to display our search overlay...
        this.setState({ isSearching: true });
    }

    submit(event)
    {
        // Check if we're pressing the enter key...
        if (event.key !== 'Enter') return;
        
        // Check if our folders aren't empty, then go ahead and goto to the folder...
        if (this.state.response.folders.length) this.props.gotoFolder(this.state.response.folders[0].id);
        // Check if instead our files aren't empty, then go ahead and open the viewer...
        else if (this.state.response.files.length) this.props.openViewer(this.state.response.files[0].id);
    }

    render()
    {
        // Don't display anything if we're not searching anything...
        if (!this.state.isSearching) return null;

        // Setup our loader bar...
        const loaderBar = this.state.isLoading ? (<div className={styles['loader-bar']} />) : null;

        // Setup our files found...
        const filesFound = this.state.response ?
            this.state.response.files.map((file) => {
                return (<File file={file} key={file.id}
                    listView
                    openViewer={this.props.openViewer}
                    openFileLocation={this.props.openFileLocation}
                    searchCallback={this.close.bind(this)}
                />);
            }) : null;

        // Setup our folders found...
        const foldersFound = this.state.response ?
            this.state.response.folders.map((folder) =>
            {
                return (<Folder folder={folder} key={folder.id} gotoFolder={this.props.gotoFolder} listView />);
            }) : null;

        // Render our entire search system...
        return (
            <div className={styles['overlay']} style={{display: "unset"}} onClick={this.onClose.bind(this)}>
                {loaderBar}

                <input type="text"
                    className={styles['search-box']}
                    ref={(input) => { this.searchBox = input; }}
                    onChange={this.onSearch.bind(this)}
                    onKeyPress={this.submit.bind(this)}
                    autoFocus placeholder="Search" />

                <div className={styles['search-content']}>
                    <div className={styles['search-close']} onClick={this.close.bind(this)} />
                    {foldersFound}
                    {filesFound}
                </div>
            </div>
        );
    }
}

export default Search;