import React from 'react';

import { Pathbar } from '../topbar/Pathbar';
import { Error } from '../info/Error';
import { Loading } from '../info/Loading';

import { Folder } from './Folder';
import { File } from './File';
import { Sortbar } from './Sortbar';

import styles from '../../App.css';

const signalR = require("@aspnet/signalr");

export class List extends React.Component
{
    constructor(props)
    { 
        super(props);

        // Setup our states...
        this.state = {
            error: null,
            finished: false,
            response: null,
            stopLoading: false,
            offset: 0
        };
    }

    componentDidMount()
    {
        /////////////////////////////////////////////////////
        // SignalR setup...
        /////////////////////////////////////////////////////

        // Setup our signalR connection...
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("notifications")
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Capture our update listing command...
        this.connection.on("UpdateListing", () => this.requestList());

        // Capture our onclose event...
        this.connection.onclose(() =>
        {
            // State that the connection has been lost...
            console.log("Lost connection...");

            // Attempt to reconnect...
            connectToSignalR();
        });

        // Start our connection and attempt to catch any errors...
        this.connectToSignalR();

        /////////////////////////////////////////////////////

        // Request our list...
        this.requestList();

        /////////////////////////////////////////////////////

        window.onscroll = (e) =>
        {
            const scrollOffset = window.innerHeight + window.pageYOffset;

            if (scrollOffset >= (document.body.offsetHeight * 0.8) && !this.state.stopLoading)
                this.requestList(this.state.offset);
        };
    }

    /**
     * Attempts to reconnect to our signalR server... 
     */
    connectToSignalR() {
        this.connection.start().catch(function (err)
        {
            // Log our errors...
            console.error(err.toString());

            // Recall our method in 3 seconds...
            setTimeout(this.reconnectToSignalR(), 3000);
        });
    }

    /**
     * Requests the list of files and folders...
     * @param {any} offset Offset of where we want to display our files...
     */
    requestList(offset = 0)
    {
        // Disable loading while we request for a list...
        this.setState({ stopLoading: true });

        fetch("process/list",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `offset=${encodeURIComponent(this.state.offset)}`
            })
            .then(res => res.json()) 
            .then(
                (result) => 
                {
                    // Increment our file offset and set our state...
                    this.setState({ response: result, offset: result.files.length, stopLoading: result.files.length === this.state.offset});

                    // Setup a timeout to update our finished state if it isn't set...
                    if (!this.state.finished) setTimeout(() => this.setState({ finished: true }), 300);
                },
                (error) => {
                    // Set our state accordingly that we have recieved an error...
                    this.setState({
                        finished: true,
                        error
                    });
                }
            );
    }

    /**
     * Goes to a folder...
     * @param {any} folderId The folder's id number...
     */
    gotoFolder(folderId)
    {
        // Fetch our new result...
        fetch("process/goto",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `folderid=${encodeURIComponent(folderId)}`
            })
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        response: result,
                        stopLoading: false,
                        offset: 0
                    });
                },
                (error) => {
                    this.setState({
                        error
                    });
                }
            );
    }

    render() {
        // Setup our state variables...
        const { error, finished, response } = this.state;

        /////////////////////////////////////////////////////

        // Our introduction box...
        const introBox = (<div className={styles["intro-box"]}>
            <img src="images/ui/logo.svg" />
        </div>);

        /////////////////////////////////////////////////////

        // Check if there is an error loading our files...
        if (error)
            return (
                <Error message={error.message} />
            );
        // Check if our content is still loading...
        else if (!finished) return (<>{introBox}</>);

        // Check if our request was unsuccessful...
        if (!response.success)
            return (
                <Error message={response.reason} />
            );

        // Check if we have an empty homepage...
        if (response.isHome && response.files.length === 0 && response.folders.length === 0)
            return (<center>
                <img className={styles["wind"]} src="images/ui/wind.png" />
            </center>);

        /////////////////////////////////////////////////////

        const recycleBin = response.folders.find((folder) => folder.isRecycleBin);

        // Setup our previous folder...
        const previousFolder = response.isHome ? null :
            { id: response.previous, name: "...", icon: "images/file/folder-icon.svg", style: "", isRecycleBin: false, isSharing: false, isPrevious: true };
        
        // Setup our file listing...
        const fileListing = response.files.length ? (<div className={styles["file-listing"]}>
            <Sortbar sort={response.sort} />
            {
                response.files.map((file) =>
                {
                    return (<File file={file} />);
                })
            }
        </div>) : null;

        // Setup our folder listing...
        const folderListing = (<div className={styles["folder-listing"]}>
            <Folder folder={previousFolder} gotoFolder={this.gotoFolder.bind(this)} />
            {
                response.folders.map((folder) => {
                    if (!folder.isRecycleBin) return (<Folder folder={folder} gotoFolder={this.gotoFolder.bind(this)} />);
                })
            }
            <Folder folder={recycleBin} gotoFolder={this.gotoFolder.bind(this)} />
        </div>);

        // Otherwise render all our items...
        return (
            <div className={styles["items"]}>
                <Pathbar path={response.path} gotoFolder={this.gotoFolder.bind(this)} />
                
                {folderListing}
                {fileListing}
            </div>
        );
    }
}