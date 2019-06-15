import React from 'react';

import { Pathbar } from '../topbar/Pathbar';
import { Error } from '../info/Error';
import { Loading } from '../info/Loading';

import { Folder } from './Folder';
import { File } from './File';
import { Sortbar } from './Sortbar';

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
            response: null
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
    requestList(offset = 0) {
        fetch("process/list",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `offset=${encodeURIComponent(offset)}`
            })
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        finished: true,
                        response: result
                    });
                },
                (error) => {
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
                        finished: true,
                        response: result
                    });
                },
                (error) => {
                    this.setState({
                        finished: true,
                        error
                    });
                }
            );
    }

    render() {
        // Setup our state variables...
        const { error, finished, response } = this.state;

        // Check if there is an error loading our files...
        if (error) 
            return (
                <Error message={error.message} />
            );
        // Check if our content is still loading...
        else if (!finished)
            return (
                <Loading />
            );

        // Check if our request was unsuccessful...
        if (!response.success)
            return (
                <Error message={response.reason} />
            );

        console.log(response);

        /////////////////////////////////////////////////////

        // Find our recycle bin...
        const recycleBin = response.folders.find((folder) => folder.isRecycleBin);

        // Setup our previous folder...
        const previousFolder = response.isHome ? null :
            { id: response.previous, name: "...", icon: "images/file/folder-icon.svg", style: "", isRecycleBin: false, isSharing: false };

        // Setup our file listing...
        const fileListing = response.files.length ? (<div id="file-listing">
            <Sortbar sort={response.sort} />
            {
                response.files.map((file) =>
                {
                    return (<File file={file} />);
                })
            }
        </div>) : null;

        // Setup our folder listing...
        const folderListing = (<div id="folder-listing">
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
            <>
                <Pathbar path={response.path} gotoFolder={this.gotoFolder.bind(this)} />
                
                {folderListing}
                {fileListing}
            </>
        );
    }
}