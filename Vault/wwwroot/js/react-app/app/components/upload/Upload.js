import React from 'react';
import DropzoneComponent from 'react-dropzone-component';
import styles from '../../App.css';

class Upload extends React.Component
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
            uploadedItems: 0,
            progress: 0
        };

        // Setup our component config...
        this.componentConfig = { postUrl: 'process/upload' };

        // Setup our Dropzone.JS config...
        this.djsConfig = { autoProcessQueue: true, clickable: `.${styles['btnUpload']}`, parallelUploads: 1, previewsContainer: false };

        // Setup our handlers...
        this.eventHandlers = {
            // Set our state according to if we're processing a file...
            processing: (file) => this.setState({ uploading: true, finished: false, success: false, progress: 0, status: `Uploading ${file.name}` }),

            // Set our state according to update the progress of each transfer...
            totaluploadprogress: (totalProgress, totalBytes, totalBytesSent) => this.setState({ progress: totalProgress }),

            // Set our state according if we just got recieved an error...
            error: (file, response) => this.setState({ uploading: true, finished: true, success: false, status: `Failed to upload ${file.name}...` }),

            // Setup our state accordingly to display if we've completed a transfer...
            complete: (file) =>
            {
                // I forgot why I made this check... 
                if (!this.state.finished)
                {
                    // Set our state to inform that we've finished everything
                    // and update our status text...
                    this.setState({
                        uploading: true,
                        finished: true,
                        uploadedItems: this.state.uploadedItems + 1,
                        success: true,
                        status: this.state.uploadedItems === 0
                            ? `Successfully uploaded ${file.name}...`
                            : `Uploaded ${this.state.uploadedItems + 1} files...`
                    });
                }
            }
        };
    }

    /**
     * Override the entire window on file drop and upload...
     */
    componentDidMount()
    {
        // Hook ondragover so everything else works...
        document.documentElement.ondragover = (e) =>
        {
            e.preventDefault();
            e.stopPropagation();
        };

        // Hook ondragenter so everything else works...
        document.documentElement.ondragenter = (e) =>
        {
            e.preventDefault();
            e.stopPropagation();
        };

        // Hook on drop...
        document.documentElement.ondrop = (e) =>
        {
            e.preventDefault();

            // We have todo this instead of the provided dropzone stuff is cuz it is super broken.
            document.querySelector("body > input").files = e.dataTransfer.files;
            document.querySelector("body > input").dispatchEvent(new Event('change'));
        };
    }

    /**
     * Reset our events upon unmounting...
     */
    componentWillUnmount() {
        document.documentElement.ondragover = undefined;
        document.documentElement.ondragenter = undefined;
        document.documentElement.ondrop = undefined;
    }

    render()
    {
        // Setup our snackbar rendering...
        let progressStyle = { width: `${this.state.progress}%` };

        // Make our progress bar change colours depending if the transfer failed or not...
        if (this.state.finished &&!this.state.success)
            progressStyle = { borderColor: "#c14141", width: `${this.state.progress}%` };
        else if (this.state.finished && this.state.success)
            progressStyle = { borderColor: "#7ac142", width: `${this.state.progress}%` };

        // Initialize our snackbar progress bar...
        let snackBarProgress = this.state.uploading ? <div className={styles['snack-bar-progress']} style={progressStyle} /> : null;

        // The text of our snackbar...
        let snackBarText = this.state.uploading ? <div className={styles['snack-bar-text']} >{this.state.status}</div> : null;

        // The failure icon...
        let snackBarFailure = this.state.finished && !this.state.success ?
            (<svg className={styles['snack-bar-x']} xmlns="http://www.w3.org/2000/svg" viewBox="-81 -80 350 350">
                <path className={styles['snack-bar-x-check']} d="M180.607,10.607l-79.696,79.697l79.696,79.697L170,180.607l-79.696-79.696l-79.696,79.696L0,170.001l79.696-79.697L0,10.607
                L10.607,0.001l79.696,79.696L170,0.001L180.607,10.607z" />
            </svg>) : null; 

        // The checkmark icon...
        let snackBarSuccess = this.state.finished && this.state.success ?
            (<svg className={styles['snack-bar-checkmark']} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className={styles['snack-bar-checkmark-circle']} cx="26" cy="26" r="25" fill="none" />
                <path className={styles['snack-bar-checkmark-check']} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>) : null;

        // The loading icon...
        let snackBarLoader = this.state.uploading && !this.state.finished ? <div className={styles['snack-bar-loader']} /> : null;

        // Setup our snackbar to fade out after two seconds upon transfer completion or failure...
        let snackBarFadeOutStyle = this.state.finished ? { animation: "fadeout 0.6s ease-out 2s 1 normal forwards running" } : {};

        // The entire snackbar...
        let snackBar = this.state.uploading ? (<div className={styles['snack-bar-upload']} style={snackBarFadeOutStyle}>  
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

export default Upload;