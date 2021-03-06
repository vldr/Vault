﻿import React from 'react';
import swal from '@sweetalert/with-react';
import styles from '../../app/App.css';

export class DeleteFolder extends React.Component
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

    componentDidMount()
    {
        setTimeout(() => this.deleteButton.focus(), 100);
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
		const folderClassName = styles[this.props.folder.style];

        const loader = this.state.started && !this.state.finished ? (<center><div className={styles["loader"]} /></center>) : null;

        const dialog = !this.state.started && !this.state.finished ? (<div>
            <div className={styles["warning-title"]}>Are you sure?</div>
            <div className={styles["warning-message"]}>
                <p>You are about to delete this folder:</p>

				<div className={styles["gridItem-folder"]}>
                    <div className={styles["grid-icon"]} />
                    <p className={styles["grid-text"]}>
                        <div className={folderClassName} />
                        {this.props.folder.name}
                    </p>
                </div>
            </div>

            <button className={styles["button"]} ref={(input) => { this.deleteButton = input; }} onClick={this.onClick.bind(this)}>Delete</button>
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