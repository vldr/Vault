import React from 'react';
import styles from '../../app/App.css';

import { ActionAlert } from '../info/ActionAlert';
import { PhotoView } from './PhotoView';
import { AudioView } from './AudioView';
import { VideoView } from './VideoView';
import { DownloadEncryptedFile } from '../action/DownloadEncryptedFile';

const PDFView = React.lazy(() => import('./PDFView'));
const Comments = React.lazy(() => import('../comments/Comments'));

class Viewer extends React.Component {
    constructor(props) {
        super(props);

        // Setup our states...
        this.state = {
            isOpen: false,
            isLoading: false,
            fileId: null,
            response: null
        };
    }

    onClose(event) {
        // Make sure the target was the overlay...
        if (event.target.className !== styles['overlay']) return;

        // Close our overlay...
        this.close();
    }

    onOpen(fileId)
    {
        // Close our search if it is open...
        if (this.props.closeSearch) this.props.closeSearch();

        // Set our state to be started...
        this.setState({
            isOpen: true,
            isLoading: true
        });

        // Fetch our delete file request...
        fetch("process/viewer",
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
                (result) => {
                    // Check if we're not logged in or something...
                    if (!result.success) {
                        // Stop our loading state...
                        this.setState({ isLoading: false });

                        // Render a action alert...
                        new ActionAlert(<p>{result.reason}</p>);

                        // Close our overlay...
                        this.close();
                    }
                    // Set our response and turn off isLoading...
                    else
                        this.setState({ response: result, isLoading: false, fileId: fileId });
                },
                (error) => {
                    // Stop our loading state...
                    this.setState({ isLoading: false });

                    // Render a action alert...
                    new ActionAlert(<p>{error.message}</p>);

                    // Close our overlay...
                    this.close();
                }
            );
    }

    onOpenWithShareId(shareId) {
        // Set our state to be started...
        this.setState({
            isOpen: true,
            isLoading: true
        });

        // Fetch our delete file request...
        fetch("viewer",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `shareid=${encodeURIComponent(shareId)}`
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

    downloadFile()
    {
        // Setup a form...
        let form = document.createElement("form");
        form.method = "POST";
        form.action = this.state.response.relativeURL + this.state.response.url;

        // Append it to the document...
        document.body.appendChild(form);

        // Submit it...
        form.submit();

        // Remove it from the document...
        document.body.removeChild(form);
    }


    downloadEncryptedFile()
    {
        // Render an action alert...
        new ActionAlert(<DownloadEncryptedFile action={this.state.response.relativeURL + this.state.response.url} />);
    }

    close()
    {
        // Set our state to hide our search overlay...
        this.setState({ isOpen: false, response: null });
    }

    open()
    {
        // Set our state to display our search overlay...
        this.setState({ isOpen: true });
    }

    render() {
        // Don't display anything if we're not open...
        if (!this.state.isOpen) return null;

        // Setup a variable to track if everything has loaded...
        const hasLoaded = !this.state.isLoading && this.state.response;

        // Setup our loader bar...
        const loaderBar = <center><div className={styles['loader']} /></center>;

        // Setup our viewer content...
        const viewerTopbar = hasLoaded ?
            (<div className={styles['overlay-topbar']} >
                <img src={this.state.response.relativeURL + this.state.response.icon} />
                <div className={styles['overlay-topbar-text']}>{this.state.response.name}</div>
                {this.state.response.isEncrypted && <div className={styles['file-locked']} />}
                <div className={styles['overlay-topbar-right']}>
                    <div className={styles['btn-download-viewer']}
                        onClick={this.state.response.isEncrypted ? this.downloadEncryptedFile.bind(this) : this.downloadFile.bind(this)} />
                    <div className={styles['btn-close-viewer']} onClick={this.close.bind(this)} />
                </div>
            </div>) : null;

        // Setup our view...
        let view = <div className={styles['overlay-message']}>No preview available</div>;

        // Check if our view has loaded...
        if (hasLoaded && !this.state.response.isEncrypted)
            // Perform a switch to choose our...
            switch (this.state.response.action)
            {
                // PhotoView
                case "1":
                    view = <PhotoView view={this.state.response} />;
                    break;
                // VideoView
                case "2":
                    view = <VideoView view={this.state.response} />;
                    break;
                // PDFView
                case "3":
                    view = <PDFView view={this.state.response} />;
                    break;
                // AudioView
                case "4":
                    view = <AudioView view={this.state.response} />;
                    break;
            }

        // Render our entire search system...
        return (
            <div className={styles['overlay']} onClick={this.onClose.bind(this)}>
                {this.state.isLoading && loaderBar}

                <div className={styles['overlay-inherit']}>
                    {viewerTopbar}

                    <React.Suspense fallback={loaderBar}>
                        {hasLoaded && view}
                    </React.Suspense>
                </div>

                {hasLoaded && this.state.response.isSharing && 
                    <div className={styles['share-comments']}>
                        <React.Suspense fallback={loaderBar}>
                            <Comments local id={this.state.response.id} />
                        </React.Suspense>
                    </div>
                }
            </div>
        );
    }
}

export default Viewer;