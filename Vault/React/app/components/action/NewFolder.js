import React from 'react';
import swal from '@sweetalert/with-react';
import styles from '../../app/App.css';

export class NewFolder extends React.Component
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
        // Janky solution because browser restrictions of animations...
        setTimeout(() => this.newName.focus(), 100);
    }

    /**
     * Close our dialog when close is needed...
     */ 
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

        // Fetch our rename folder request...
        fetch("process/newfolder",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `foldername=${encodeURIComponent(this.newName.value)}`
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
        const loader = this.state.started && !this.state.finished ? (<center><div className={styles["loader"]} /></center>) : null;

        const dialog = !this.state.started && !this.state.finished ? (<div>
            <div className={styles["warning-title"]}>New Folder</div>
            <div className={styles["warning-message"]}>
                <p>Please specify a name for your new folder:</p>
                <input type="text"
                    ref={(input) => { this.newName = input; }} 
                    onKeyDown={(e) => { if (e.key === 'Enter') this.onClick(); }}
                />
            </div>

            <button className={styles["button"]} onClick={this.onClick.bind(this)}>Create</button>
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