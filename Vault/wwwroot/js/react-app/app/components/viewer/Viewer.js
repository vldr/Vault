import React from 'react';
import styles from '../../App.css';

import { ActionAlert } from '../info/ActionAlert';
import { PhotoView } from './PhotoView';
import { AudioView } from './AudioView';
import { VideoView } from './VideoView';

const PDFView = React.lazy(() => import('./PDFView'));

class Viewer extends React.Component {
    constructor(props) {
        super(props);

        // Setup our states...
        this.state = {
            isOpen: false,
            isLoading: false,
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
                        this.setState({ response: result, isLoading: false });
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

    downloadFile()
    {
        // Setup a form...
        let form = document.createElement("form");
        form.method = "POST";
        form.action = this.state.response.url;

        // Append it to the document...
        document.body.appendChild(form);

        // Submit it...
        form.submit();

        // Remove it from the document...
        document.body.removeChild(form);
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
                <img src={this.state.response.icon} />
                <div className={styles['overlay-topbar-text']}>{this.state.response.name}</div>
                <div className={styles['overlay-topbar-right']}>
                    <div className={styles['btn-download-viewer']} onClick={this.downloadFile.bind(this)} />
                    <div className={styles['btn-close-viewer']} onClick={this.close.bind(this)} />
                </div>
            </div>) : null;

        // Setup our view...
        let view = <div className={styles['overlay-message']}>No preview available</div>;

        // Check if our view has loaded...
        if (hasLoaded)
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
                {viewerTopbar}

                <React.Suspense fallback={loaderBar}>
                    {hasLoaded && view}
                </React.Suspense>
            </div>
        );
    }
}

export default Viewer;