import React from 'react';
import swal from '@sweetalert/with-react';

export class RenameFile extends React.Component
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

        // Fetch our delete file request...
        fetch("process/renamefile",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `fileid=${encodeURIComponent(this.props.file.id)}&newname=${encodeURIComponent(this.newName.value)}`
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
            <div id="warning-title">Rename</div>
            <div id="warning-message">
                <p>Please specify a new name for your file:</p>
                <input type="text"
                    ref={(input) => { this.newName = input; }} 
                    defaultValue={this.props.file.name}
                    onKeyDown={(e) => { if (e.key === 'Enter') this.onClick(); }}
                    onFocus={(e) => { e.target.setSelectionRange(0, e.target.value.lastIndexOf(".")); }}
                />
            </div>

            <div className="button" onClick={this.onClick.bind(this)}>Rename</div>
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