import React from 'react';
import swal from '@sweetalert/with-react';
import styles from '../../app/App.css';

export class DeleteComment extends React.Component
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
        fetch("process/deletecomment",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `fileId=${encodeURIComponent(this.props.comment.fileId)}` 
                    + `&commentId=${encodeURIComponent(this.props.comment.id)}` 
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
                    else {
                        // Check if our prop is set...
                        if (this.props.removeComment) this.props.removeComment(this.props.comment);

                        // Close out our swal...
                        swal.close();
                    }
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
        const loader = this.state.started && !this.state.finished ? (<center><div className={styles["loader"]} /></center>) : null;

        const dialog = !this.state.started && !this.state.finished ? (<div>
            <img src="images/comment.svg" style={{ height: "86px", opacity: "0.5" }} />
            <div className={styles["warning-title"]}>Are you sure?</div>
            <div className={styles["warning-message"]}>
                <p>You are about to delete a comment written by <b>{this.props.comment.author}</b>.</p>
            </div>

            <button className={styles["button"]} onClick={this.onClick.bind(this)}>Delete</button>
            <button className={styles["button"] + " " + styles["inverse"]} onClick={this.close.bind(this)}>Cancel</button>
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