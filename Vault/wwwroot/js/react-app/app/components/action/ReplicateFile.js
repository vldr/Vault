import React from 'react';
import swal from '@sweetalert/with-react';
import styles from '../../app/App.css';

export class ReplicateFile extends React.Component
{
    constructor(props)
    {
        super(props);

        // Setup our states...
        this.state = {
            isLoading: true,
            result: null,
            error: null
        };
    }

    componentDidMount()
    {
        this.getListing();
    }

    // Close our dialog when close is needed...
    close() {
        swal.close();
    }

    onClick()
    {
        // Set our state to be started...
        this.setState({ isLoading: true });

        // Fetch our delete file request...
        fetch("process/togglereplicate",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `fileid=${encodeURIComponent(this.props.file.id)}`
            })
            .then(res => res.json())
            .then(
                (result) => 
                {
                    if (!result.success) this.setState({ isLoading: false, error: result.reason });
                    else {
                        this.getListing();
                    }
                },
                (error) => {
                    this.setState({ isLoading: false, error: error.message });
                }
            );
    }

    getListing()
    {
        // Set our state to be started...
        this.setState({ isLoading: true });

        // Fetch our delete file request...
        fetch("process/replicationlisting",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `fileid=${encodeURIComponent(this. props.file.id)}`
            })
            .then(res => res.json())
            .then(
                (result) =>
                {
                    if (!result.success) this.setState({ isLoading: false, error: result.reason });
                    else {
                        this.setState({ isLoading: false, result: result.listing });
                    }
                },
                (error) =>
                { 
                    this.setState({ isLoading: false, error: error.message });
                }
            );
    }

    render()
    {
        // Our loader...
        const loader = this.state.isLoading ? (<center><div className={styles["loader"]} /></center>) : null;

        const servers = this.state.result && this.state.result.servers.length ? (<>
            {
                this.state.result.servers.map((server, i) =>
                {
                    return (<div className={styles["server-listing"]}>
                        <div className={this.state.result.isReplicated ? styles["server-on"] : styles["server-off"]} />
                        {server}
                    </div>);
                })
            }
        </>) : null;

        const info = this.props.file.isReplicated ?
            <>
                <p>
                    Replication is currently enabled for this file.<br />
                    Listed below are all the servers where the file is currently located:
                </p>
                <div className={styles["servers-container"]}>
                    {servers}
                </div>

                <label className={styles["share-checkbox"]}>Enable<input className={styles["share-checkbox-input"]}
                    type="checkbox" defaultChecked onClick={this.onClick.bind(this)} />
                    <span className={styles["checkmark"]} />
                </label>
            </>
            :
            <>
                <p>
                    Replication is currently disabled for this file.<br />
                    Listed below are all the servers available for replication:
                </p>
                <div className={styles["servers-container"]}>
                    {servers}
                </div>
                <label className={styles["share-checkbox"]}>Enable<input className={styles["share-checkbox-input"]}
                    type="checkbox" defaultChecked={this.props.file.isReplicated} onClick={this.onClick.bind(this)} />
                    <span className={styles["checkmark"]} />
                </label>
            </>;

        // Our dialog...
        const dialog = !this.state.isLoading && !this.state.error && this.state.result ?
        (<div>
            <div className={styles["warning-title"]}>Replicate</div>
            <div className={styles["warning-message"]}>
                {this.state.result.isProcessing ?
                    <>
                        <div className={styles["clock-icon"]} />
                        <p>We are currently processing your file, check back later...</p>
                    </> : info
                }
            </div>
        </div>) : null;

        // Our error dialog...
        const error = !this.state.isLoading && this.state.error ? (<div>
            <div className={styles["warning-title"]}>Error!</div>
            <div className={styles["warning-message"]}>{this.state.error}</div>
        </div>) : null;

        return (
        <div>
            {loader}
            {dialog}
            {error}
        </div>);
    }
}