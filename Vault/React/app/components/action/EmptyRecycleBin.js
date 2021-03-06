﻿import React from 'react';
import swal from '@sweetalert/with-react';
import styles from '../../app/App.css';

export class EmptyRecycleBin extends React.Component
{
    constructor(props)
    {
        super(props);

        // Setup our states...
        this.state = {
            started: false,
            error: null,
            finished: false
        };
    }

    // Close our dialog when close is needed...
    close()
    {
        swal.close();
    }

    onClick()
    {
        // Set our state to be started...
        this.setState({
            started: true
        });

        // Fetch our delete folder request...
        fetch("process/deletefolder",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `folder=${encodeURIComponent(this.props.folder.id)}`
            })
            .then(res => res.json())
            .then(
                (result) => 
                {
                    if (!result.success)
                        this.setState({
                            finished: true,
                            error: result.reason
                        });
                    else swal.close();
                },
                (error) => {
                    this.setState({
                        finished: true,
                        error: error.message
                    });
                }
            );
    }

    render()
    {
        const folderIconStyle =
        {
            backgroundImage: `url(${this.props.folder.icon})`,
            backgroundSize: `24px`
        };

        const loader = this.state.started && !this.state.finished ? (<center><div className={styles["loader"]} /></center>) : null;

        const dialog = !this.state.started && !this.state.finished ? (<div>
            <img src="images/flush.svg" style={{ height: "86px", opacity: "0.3" }} />
            <div className={styles["warning-title"]}>Are you sure?</div>
            <div className={styles["warning-message"]}>

                <p>Performing this operation will have an irreversible outcome.
                    <br />This will <b>permanently erase</b> all the files and folders inside...
                </p>
            </div>

            <button className={styles["button"]} onClick={this.onClick.bind(this)}>Empty</button>
            <button className={styles["button"] + " " + styles["inverse"]} onClick={this.close.bind(this)}>Close</button>
        </div>) : null;

        const error = this.state.finished && this.state.error ? (<div>
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