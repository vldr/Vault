import React from 'react';
import swal from '@sweetalert/with-react';

export class DeleteFile extends React.Component
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
        fetch("process/deletefile",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `file=${encodeURIComponent(this.props.file.id)}`
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
        const loader = this.state.started && !this.state.finished ? (<center><div className="loader" /></center>) : null;

        const dialog = !this.state.started && !this.state.finished ? (<div>
            <div id="warning-title">Are you sure?</div>
            <div id="warning-message">
                <p>You will not be able to restore this file:</p>
                <div className="file-descriptor">
                    <img src={this.props.file.icon} />
                    <div>{this.props.file.name}</div>
                    <div>{this.props.file.size}</div>
                </div>
            </div>


            <div className="button" onClick={this.onClick.bind(this)}>Delete</div>
            <div className="button inverse" onClick={this.close.bind(this)}>Close</div>
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