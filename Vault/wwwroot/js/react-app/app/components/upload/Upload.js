import React from 'react';
var ReactDOMServer = require('react-dom/server');
import DropzoneComponent from 'react-dropzone-component';

export class Upload extends React.Component
{
    constructor(props)
    {
        super(props);

        // Setup our states...
        this.state = {
            uploading: false,
            finished: false,
            fileName: null,
            success: false,
            status: "",
            progress: 0
        };

        // Setup our component config...
        this.componentConfig = { postUrl: 'process/upload' };

        // Setup our Dropzone.JS config...
        this.djsConfig = { autoProcessQueue: true, clickable: ".btnUpload", parallelUploads: 1, previewsContainer: false };

        // Setup our handlers...
        this.eventHandlers = {
            processing: (file) => this.setState({ uploading: true, finished: false, success: false, progress: 0, status: `Uploading ${file.name}` }),
            totaluploadprogress: (totalProgress, totalBytes, totalBytesSent) => this.setState({ progress: totalProgress }),
            error: (file, response) => this.setState({ uploading: true, finished: true, success: false, status: `Failed to upload ${file.name}...` }),
            complete: (file) =>
            {
                if (!this.state.finished) this.setState({ uploading: true, finished: true, success: true, status: `Successfully uploaded ${file.name}...` })
            }
        };
    }

    /**
     * Override the entire window on file drop and upload...
     */
    componentDidMount()
    {
        document.documentElement.ondragover = (e) =>
        {
            e.preventDefault();
            e.stopPropagation();
        };

        document.documentElement.ondragenter = (e) =>
        {
            e.preventDefault();
            e.stopPropagation();
        };

        document.documentElement.ondrop = (e) =>
        {
            e.preventDefault();

            // We have todo this instead of the provided dropzone stuff is cuz it is super broken.
            document.querySelector("body > input").files = e.dataTransfer.files;
            document.querySelector("body > input").dispatchEvent(new Event('change'));
        };
    }

    render()
    {
        // Setup our snackbar rendering...
        let progressStyle = { width: `${this.state.progress}%` };

        if (this.state.finished &&!this.state.success)
            progressStyle = { borderColor: "#c14141", width: `${this.state.progress}%` };
        else if (this.state.finished && this.state.success)
            progressStyle = { borderColor: "#7ac142", width: `${this.state.progress}%` };

        let snackBarProgress = this.state.uploading ? <div id="snack-bar-progress" style={progressStyle} /> : null;
        let snackBarText = this.state.uploading ? <div id="snack-bar-text">{this.state.status}</div> : null;
        let snackBarFailure = this.state.finished && !this.state.success ?
            (<svg id="snack-bar-x" xmlns="http://www.w3.org/2000/svg" viewBox="-81 -80 350 350">
                <path id="snack-bar-x-check" d="M180.607,10.607l-79.696,79.697l79.696,79.697L170,180.607l-79.696-79.696l-79.696,79.696L0,170.001l79.696-79.697L0,10.607
                L10.607,0.001l79.696,79.696L170,0.001L180.607,10.607z" />
            </svg>) : null; 

        let snackBarSuccess = this.state.finished && this.state.success ?
            (<svg id="snack-bar-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle id="snack-bar-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path id="snack-bar-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>) : null;

        let snackBarLoader = this.state.uploading && !this.state.finished ? <div id="snack-bar-loader" /> : null;

        let snackBar = this.state.uploading ? (<div id="snack-bar-upload">  
            {snackBarLoader}
            {snackBarFailure}
            {snackBarSuccess}
            {snackBarText}
            {snackBarProgress} 
        </div>) : null;

        // Return our rendering of the item...
        return (
            <React.Fragment>
                <DropzoneComponent className="dropzone" config={this.componentConfig}
                eventHandlers={this.eventHandlers}
                djsConfig={this.djsConfig} />
                {snackBar}
            </React.Fragment>
        );
    }
}