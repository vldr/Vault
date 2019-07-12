import React from 'react';
import styles from '../../app/App.css';

import { ActionAlert } from '../info/ActionAlert';
import { PhotoView } from '../viewer/PhotoView';
import { AudioView } from '../viewer/AudioView';
import { VideoView } from '../viewer/VideoView';

const PDFView = React.lazy(() => import('../viewer/PDFView'));
const Comments = React.lazy(() => import('../comments/Comments'));

class ShareViewer extends React.Component {
    constructor(props) {
        super(props);

        // Setup our states...
        this.state = {
            isOpen: false,
            isLoading: false,
            response: null
        };
    }

    componentDidMount() {
        if (this.props.id) this.onOpenWithShareId(this.props.id);
    }

    onOpen(fileId) {
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

    downloadFile() {
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

    render() {
        // Setup a variable to track if everything has loaded...
        const hasLoaded = !this.state.isLoading && this.state.response;

        // Setup our loader bar...
        const loaderBar = <div className={styles['loader']} />;

        // Setup our intro box...
        const introBox = (<div className={styles["intro-box"]}>
            <img src="../images/ui/logo.svg" />
        </div>);

        // Setup our viewer content...
        const topbar = hasLoaded ?
            (<div className={styles['share-overlay-topbar']} >
                <img src={this.state.response.relativeURL + this.state.response.icon} />
                <div className={styles['overlay-topbar-text']}>{this.state.response.name}</div>
                <div className={styles['overlay-topbar-right']}>
                    <div className={styles['btn-download-viewer']} onClick={this.downloadFile.bind(this)} />
                </div>
            </div>) : null;

        // Setup our view...
        let view = <div className={styles['overlay-message']}>No preview available</div>;

        // Check if our view has loaded...
        if (hasLoaded)
            // Perform a switch to choose our...
            switch (this.state.response.action) {
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

        // Render our entire share view system...
        return (
            
            <div className={styles['share-overlay']}>
                <div className={styles['share-view']}>
                    <React.Suspense fallback={loaderBar}>
                        {topbar}
                        {hasLoaded && view}
                    </React.Suspense>
                </div>

                <div className={styles['share-comments']}>
                    <React.Suspense fallback={loaderBar}>
                        <Comments id={this.props.id} /> 
                    </React.Suspense>
                </div>
            </div>
        );
    }
}

export default ShareViewer;