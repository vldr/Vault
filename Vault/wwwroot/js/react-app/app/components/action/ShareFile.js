import React from 'react';
import swal from '@sweetalert/with-react';

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

    render()
    {
        const path = window.location.href.substr(0, window.location.href.lastIndexOf('/') + 1);

        const loader = this.state.started && !this.state.finished ? (<center><div className="loader" /></center>) : null;

        const checkBox = this.props.file.isSharing ?
            (<div>
                <label id="share-checkbox">Enable<input id="share-checkbox-input" type="checkbox" defaultChecked onClick={this.onClick.bind(this)} />
                    <span className="checkmark" />
                </label>
                <div id="share-box" className="share-box">{path}share/{this.props.file.shareId}</div>
            </div>)
            :
            (<label id="share-checkbox">Enable
                <input id="share-checkbox-input" type="checkbox" onClick={this.onClick.bind(this)} />
                <span className="checkmark" />
            </label>);

        const dialog = !this.state.started && !this.state.finished ? (<div>
            <div id="warning-title">Share</div>
            <div id="warning-message">
                <p>You can easily share your files with anybody around the globe. Simply enable sharing and give them the link below!</p>
                {checkBox}
            </div>
        </div>) : null;

        const error = this.state.finished && this.state.error ? (<div>
            <div id="warning-title">Error!</div>
            <div id="warning-message">{this.state.error}</div>
        </div>) : null;

        return (
        <div>
            {loader}
            {dialog}
            {error}
        </div>);
    }
}