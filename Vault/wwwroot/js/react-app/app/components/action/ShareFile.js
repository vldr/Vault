import React from 'react';
import swal from '@sweetalert/with-react';
import styles from '../../app/App.css';

export class ShareFile extends React.Component
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

        // Fetch our delete file request...
        fetch("process/toggleshare",
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
                    if (!result.success)
                        this.setState({
                            finished: true,
                            error: result.reason
                        });
                    else
                    {
                        if (result.shareId)
                        {
                            this.props.file.shareId = result.shareId;
                            this.props.file.isSharing = true;
                        }
                        else this.props.file.isSharing = false;
 
                        this.setState({
                            started: false
                        });
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

	copy() 
	{
		let range = document.createRange();
        range.selectNode(this.urlBox);

        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);

		document.execCommand("copy");

		this.copyButton.innerText = `Copy to Clipboard (copied)`;
	}

    render()
    {
        const path = window.location.href.substr(0, window.location.href.lastIndexOf('/') + 1);

        const loader = this.state.started && !this.state.finished ? (<center><div className={styles["loader"]} /></center>) : null;

        const checkBox = this.props.file.isSharing ?
            (<div>
                <label className={styles["share-checkbox"]}>Enable<input className={styles["share-checkbox-input"]} type="checkbox" defaultChecked onClick={this.onClick.bind(this)} />
                    <span className={styles["checkmark"]} />
                </label>
                <div className={styles["share-box"]}
					ref={(ref) => { this.urlBox = ref; }}
                    onClick={(e) => {
                        let range = document.createRange();
                        range.selectNode(e.target);
                        window.getSelection().removeAllRanges();
                        window.getSelection().addRange(range);
                    }}>{path}share/{this.props.file.shareId}
				</div>

				<button className={`${styles["button"]} ${styles["copyToClipboardButton"]}`} 
				onClick={this.copy.bind(this)} 
				ref={(ref) => { this.copyButton = ref; }}>Copy to Clipboard</button>
            </div>)
            :
            (<label className={styles["share-checkbox"]}>Enable
                <input className={styles["share-checkbox-input"]} type="checkbox" onClick={this.onClick.bind(this)} />
                <span className={styles["checkmark"]} />
            </label>);

        const dialog = !this.state.started && !this.state.finished ? (<div>
            <div className={styles["warning-title"]}>Share</div>
            <div className={styles["warning-message"]}>
                <p>You can toggle whether you want a randomly generated shareable link to be associated to your file:</p>
                {checkBox}
            </div>
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