import React from 'react';
import swal from '@sweetalert/with-react';

import { ActionAlert } from '../info/ActionAlert';
import { Pathbar } from '../topbar/Pathbar';
import { Folder } from './Folder';
import { File } from './File';
import { Sortbar } from './Sortbar';

import styles from '../../App.css';

const signalR = require("@aspnet/signalr");

class List extends React.Component
{
    constructor(props)
    { 
        super(props);

        // Setup our states...
        this.state = {
            error: null,
            finished: false,
            response: null,
            shouldScroll: false,
            offset: 0
        };
    }

    componentDidMount() {
        /////////////////////////////////////////////////////
        // SignalR setup...
        /////////////////////////////////////////////////////

        // Setup our signalR connection...
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("notifications")
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Capture our update listing command...
        this.connection.on("UpdateListing", (folderId) => this.updateListing(folderId));

        this.connection.on("UpdatePathBar", (folderId, path) => this.updatePathBar(folderId, path));
        this.connection.on("UpdateFolder", (obj) => this.updateObject(obj, 'FOLDER'));
        this.connection.on("UpdateFile", (obj) => this.updateObject(obj, 'FILE'));

        // Capture our onclose event...
        this.connection.onclose(() =>
        {
            // State that the connection has been lost...
            console.log("Lost connection...");

            // Attempt to reconnect...
            this.connectToSignalR();
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

            if (this.state.shouldScroll && scrollOffset >= document.body.offsetHeight * 0.8)
                this.requestList();
        };
    }

    updateObject(object, type)
    {
        // Setup our response...
        const { response } = this.state;

        // Check if our response exists...
        if (!response) return;

        // Setup our response objects depending whether file or folder...
        const responseObjects = type === 'FILE' ? response.files : response.folders;

        // Attempt to find our file...
        const index = responseObjects.findIndex((x) => x.id === object.id && x.folder === response.current);

        // Check if index exists...
        if (index !== -1)
        {
            // UPDATE operation...
            if (object.folder === response.current)
                // Copy the new object to our folders list...
                responseObjects[index] = object;
            // REMOVE operation...
            else
                // Splice our file listing...
                responseObjects.splice(index, 1);

            // Update our state...
            this.setState({ response: response });

            // Update our search if it is set...
            if (this.props.updateSearch) this.props.updateSearch();
        }
        // ADD operation...
        else if (object.folder === response.current)
        {
            // Place our added item to the top of the list...
            responseObjects.push(object);

            // Update our state...
            this.setState({ response: response });

            // Update our search if it is set...
            if (this.props.updateSearch) this.props.updateSearch();
        }
    }

    updatePathBar(folderId, path)
    {
        // Setup our response...
        const { response } = this.state;

        // Check if the last item was updated...
        if (folderId !== response.current) return;

        // Find the index of our folder...
        const index = path.findIndex((x) => x.id === folderId);

        // Update our pathbar...
        response.path = path;
        response.previous = path[index - 1].id;

        // Update our state...
        this.setState({ response: response });
    }

    updateListing(folderId)
    {
        // Check if were responsible for this...
        if (folderId !== this.state.response.current) return;

        // Update our list...
        this.requestList(true);
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
     * @param {any} reset Prevents concatting...
     */
    requestList(reset = false)
    {
        // Disable loading while we request for a list...
        this.setState({ shouldScroll: false });

        fetch("process/list",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `offset=${encodeURIComponent(this.state.offset)}`
            })
            .then(res => res.json()) 
            .then(
                (result) => 
                {
                    // Check if we're logged out...
                    if (!result.success)
                    {
                        // Set our state accordingly...
                        this.setState({ response: null, error: result.reason, finished: true });

                        // Return here...
                        return;
                    }

                    // Setup our relative offset...
                    const offset = this.state.offset + result.files.length;

                    // If our response is already set, then concat the new files...
                    if (this.state.response)
                    {
                        // Filter repeating items...
                        const filteredResult = result.files.filter(
                            (o1) =>
                            {
                                return !this.state.response.files.some(
                                    (o2) =>
                                    {
                                        return o1.id === o2.id;
                                    });
                            });

                        // Concat our filtered result...
                        this.state.response.files = this.state.response.files.concat(filteredResult);
                    }

                    // Increment our file offset and set our state...
                    this.setState({
                        response: this.state.response ? this.state.response : result,
                        offset: offset,
                        shouldScroll: offset !== result.totalFiles
                    });

                    // Setup a timeout to update our finished state if it isn't set...
                    if (!this.state.finished) setTimeout(() => this.setState({ finished: true }), 300);
                },
                (error) => {
                    // Set our state accordingly that we have recieved an error...
                    this.setState({
                        finished: true,
                        error: error.message
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
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `folderid=${encodeURIComponent(folderId)}`
            })
            .then(res => res.json())
            .then(
                (result) => {
                    // Check if we're logged out...
                    if (!result.success) {
                        // Set our state accordingly...
                        this.setState({ response: null, error: result.reason, finished: true });

                        // Return here...
                        return;
                    }

                    // Close our search if it is set...
                    if (this.props.closeSearch) this.props.closeSearch();

                    // Set state accordingly...
                    this.setState({
                        response: result,
                        offset: result.files.length,
                        shouldScroll: result.files.length !== result.totalFiles
                    });
                },
                (error) => {
                    this.setState({
                        error: error.message
                    });
                }
            );
    }

    /**
     * Opens the folder that a file is located in...
     * @param {any} fileId The id of the file...
     */
    openFileLocation(fileId) {
        // Show a loading dialog...
        new ActionAlert(<center><div className="loader" /></center>);

        // Attempt to update the sorting...
        fetch("process/openfilelocation",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `fileid=${encodeURIComponent(fileId)}`
            })
            .then(res => res.json())
            .then(
                (result) => 
                {
                    // Check if we're logged out...
                    if (!result.success)
                    {
                        // Show an error dialog...
                        new ActionAlert(<p>{result.reason}</p>);

                        // Return here...
                        return;
                    }

                    // Close our search if it is set...
                    if (this.props.closeSearch) this.props.closeSearch();

                    // Set state accordingly...
                    this.setState({
                        response: result,
                        offset: result.files.length,
                        shouldScroll: result.files.length !== result.totalFiles
                    });

                    // Close our dialog...
                    swal.close();
                },
                (error) => {
                    // Show an error dialog...
                    new ActionAlert(<p>{error.message}</p>);
                }
            );
    }

    render() {
        // Setup our state variables...
        const { error, finished, response } = this.state;

        /////////////////////////////////////////////////////

        // Our introduction box...
        const introBox = <div className={styles["intro-box"]}><img src="images/ui/logo.svg" /></div>;

        /////////////////////////////////////////////////////

        // Check if there is an error loading our files...
        if (error)
            return (
                <p>{error}</p>
            );
        // Check if our content is still loading...
        else if (!finished) return (<div>{introBox}</div>);

        // Check if our request was unsuccessful...
        if (!response.success)
            return (
                <p>{response.reason}</p>
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
                response.files.map((file, i) =>
                {
                    return <File key={file.id} file={file} openViewer={this.props.openViewer} />;
                })
            }
        </div>) : null;

        // Setup our folder listing...
        const folderListing = (<div className={styles["folder-listing"]}>
            <Folder folder={previousFolder} gotoFolder={this.gotoFolder.bind(this)} />
            {
                response.folders.map((folder) =>
                {
                    if (!folder.isRecycleBin) return <Folder key={folder.id} folder={folder} gotoFolder={this.gotoFolder.bind(this)} />;
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

export default List;