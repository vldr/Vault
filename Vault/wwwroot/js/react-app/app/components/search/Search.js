import React from 'react';
import styles from '../../App.css';

import { ActionAlert } from '../info/ActionAlert';
import { File } from '../list/File';
import { Folder } from '../list/Folder';

export class Search extends React.Component
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
            // Check if SPACE was pressed...
            if (event.keyCode === 32) return;

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

    onSearch() {
        // Don't perform search if the box is empty...
        if (!this.searchBox.value) return;

        // Set our state to be started...
        this.setState({
            isLoading: true
        });

        // Fetch our delete file request...
        fetch("process/search",
            {
                method: 'POST',
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


    render()
    {
        // Don't display anything if we're not searching anything...
        if (!this.state.isSearching) return null;

        // Setup our loader bar...
        const loaderBar = this.state.isLoading ? (<div className={styles['loader-bar']} />) : null;

        const filesFound = this.state.response ?
            this.state.response.files.map((file) => {
                return (<File file={file} />);
            }) : null;

        // Setup our files found...
        const foldersFound = this.state.response ?
            this.state.response.folders.map((folder) =>
            {
                return (<Folder folder={folder} listView />);
            }) : null;

        return (
            <div className={styles['overlay']}>
                {loaderBar}

                <input type="text"
                    className={styles['search-box']}
                    ref={(input) => { this.searchBox = input; }}
                    onChange={this.onSearch.bind(this)}
                    autoFocus placeholder="Search" />

                <div className={styles['search-content']}>
                    {foldersFound}
                    {filesFound}
                </div>
            </div>
        );
    }
}