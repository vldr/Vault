import React from 'react';
import swal from '@sweetalert/with-react';
import styles from '../../app/App.css';

export class Settings extends React.Component {
    constructor(props) {
        super(props);

        // Setup our states...
        this.state = {
            finished: false,
            error: null,
            response: null,
            action: 0,
        };
    }

    componentDidMount()
    {
        // Load our settings page...
        this.onLoad();
    }

    onUpdatePassword()
    {
        // Set our action accordingly...
        this.setState({ action: 1 });

        // Janky solution to focus on the input box due to animations...
        setTimeout(() => this.currentPassword.focus(), 100);
    }

    onUpdateName() {
        // Set our action accordingly...
        this.setState({ action: 2 });

        // Janky solution to focus on the input box due to animations...
        setTimeout(() => this.name.focus(), 100);
    }

    onSetEncryption()
    {
        // Set our action accordingly...
        this.setState({ action: 3 });
    }

    onGoBack()
    {
        // Set our action back to normal...
        this.setState({ action: 0 });
    }

    downloadShareXConfig()
    {
        // Check that API is enabled or response is set...
        if (!this.state.response || !this.state.response.apiEnabled)
            return;

        // Setup our path...
        const path = window.location.href.substr(0, window.location.href.lastIndexOf('/') + 1);

        // Setup our text...
        var text = `{"Name": "Vault", 
                "DestinationType": "ImageUploader, TextUploader, FileUploader",
                "RequestURL": "${path}share/upload",
                "FileFormName": "file",
                "Arguments": {"apikey": "${this.state.response.apiKey}"}, 
                "URL": "$json:path$"}`;

        // Replace all the tabs...
        text = text.replace(/\s/g, '');

        // Create an element...
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', `sharex.${this.state.response.name.toLowerCase()}.sxcu`);

        // Hide our element...
        element.style.display = 'none';

        // Append it to the document...
        document.body.appendChild(element);

        // Click it...
        element.click();

        // Remove it from the document...
        document.body.removeChild(element);
    }

    onLoad() {
        // Reset our response state...
        this.setState({
            finished: false,
            response: null,
            error: null,
            action: 0
        });

        // Fetch our delete file request...
        fetch("process/settings",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(res => res.json())
            .then(
                (result) => {
                    if (!result.success)
                        this.setState({
                            error: result.reason,
                            finished: true
                        });
                    else {
                        this.setState({
                            response: result,
                            finished: true
                        });
                    }
                },
                (error) => {
                    this.setState({
                        error: error.message,
                        finished: true
                    });
                }
            );
    }

    updatePassword()
    {
        // Reset our response state...
        this.setState({
            finished: false,
            response: null,
            error: null,
            action: 0
        });

        // Fetch our delete file request...
        fetch("process/changepassword",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `currentPassword=${encodeURIComponent(this.currentPassword.value)}&newPassword=${encodeURIComponent(this.newPassword.value)}`
            })
            .then(res => res.json())
            .then(
                (result) => {
                    if (!result.success)
                        this.setState({
                            error: result.reason,
                            finished: true
                        });
                    else
                        this.onLoad();
                },
                (error) => {
                    this.setState({
                        error: error.message,
                        finished: true
                    });
                }
            );
    }

    updateName() {
        // Reset our response state...
        this.setState({
            finished: false,
            response: null,
            error: null,
            action: 0
        });

        // Fetch our delete file request...
        fetch("process/changename",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `name=${encodeURIComponent(this.name.value)}`
            })
            .then(res => res.json())
            .then(
                (result) => {
                    if (!result.success)
                        this.setState({
                            error: result.reason,
                            finished: true
                        });
                    else
                        this.onLoad();
                },
                (error) => {
                    this.setState({
                        error: error.message,
                        finished: true
                    });
                }
            );
    }

    disableAPI()
    {
        // Reset our response state...
        this.setState({
            finished: false,
            response: null,
            error: null,
            action: 0
        });

        // Fetch our delete file request...
        fetch("process/toggleapi",
        {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(res => res.json())
        .then(
            (result) => {
                if (!result.success)
                    this.setState({
                        error: result.reason,
                        finished: true
                    });
                else
                    this.onLoad();
            },
            (error) => {
                this.setState({
                    error: error.message,
                    finished: true
                });
            }
        );
    }

    updateEncryptionPassword()
    {
        // Set our password...
        if (this.props.setPassword) this.props.setPassword(this.encryptionPassword.value);

        // Go back...
        this.onGoBack();
    }

    render()
    {
        const loader = !this.state.finished ? (<center><div className={styles["loader"]} /></center>) : null;

        const passwordDialog = this.state.action === 1 && !this.state.error && this.state.finished ? (<div>
            <div className={styles["warning-title"]}>Change Password</div>
            <div className={styles["warning-message"]}>
                <p>Please specify your current password:</p>
                <input type="password"
                    ref={(input) => { this.currentPassword = input; }}
                    onKeyDown={(e) => { if (e.key === 'Enter') this.newPassword.focus(); }}
                />

                <p>Please specify a new password:</p>
                <input type="password"
                    ref={(input) => { this.newPassword = input; }}
                    onKeyDown={(e) => { if (e.key === 'Enter') this.updatePassword(); }}
                />
            </div>

            <button className={styles["button"]} onClick={this.updatePassword.bind(this)}>Change</button>
            <button className={styles["button"] + " " + styles["inverse"]} onClick={this.onGoBack.bind(this)}>Close</button>
        </div>) : null;

        const nameDialog = this.state.action === 2 && !this.state.error && this.state.finished ? (<div>
            <div className={styles["warning-title"]}>Change Name</div>
            <div className={styles["warning-message"]}>
                <p>Please specify a new name:</p>
                <input type="text"
                    placeholder="John"
                    ref={(input) => { this.name = input; }}
                    defaultValue={this.state.response.name}
                    onKeyDown={(e) => { if (e.key === 'Enter') this.updateName(); }}
                />
            </div>

            <button className={styles["button"]} onClick={this.updateName.bind(this)}>Change</button>
            <button className={styles["button"] + " " + styles["inverse"]} onClick={this.onGoBack.bind(this)}>Close</button>
        </div>) : null;

        const encryptionDialog = this.state.action === 3 && !this.state.error && this.state.finished ? (<div>
            <div className={styles["warning-title"]}>Encryption Mode</div>
            <div className={styles["warning-message"]}>
                <p>Please specify an encryption password to enable encryption mode, leave blank to disable it:</p>

                <input type="password" style={{fontSize: "48px"}}
                    ref={(input) => { this.encryptionPassword = input; }}
                    onKeyDown={(e) => { if (e.key === 'Enter') this.updateEncryptionPassword(); }}
                />
            </div>

            <button className={styles["button"]} onClick={this.updateEncryptionPassword.bind(this)}>Set</button>
            <button className={styles["button"] + " " + styles["inverse"]} onClick={this.onGoBack.bind(this)}>Close</button>
        </div>) : null;

        const dialog = this.state.action === 0 && !this.state.error && this.state.finished ?
            (<div>
                <div className={styles["warning-title"]}>Settings</div>
                <div className={styles["warning-message"]}>
                    <h3>Name: </h3>
                    <span>{this.state.response.name} <img src="images/pencil.svg" className={styles["edit-button"]} onClick={this.onUpdateName.bind(this)} /></span>

                    <h3>Password: </h3>
                    <span>••••••••••  <img src="images/pencil.svg" className={styles["edit-button"]} onClick={this.onUpdatePassword.bind(this)} /></span>

                    <h3>Storage: </h3>
                    <span>{this.state.response.storage}</span>

                    <h3>Encryption Mode: </h3>
                    <span>
                        <p>
                            Encryption mode is currently
                            {this.props.setPassword && this.props.setPassword() ? <b> enabled</b> : <> disabled</>}
                            , <a onClick={this.onSetEncryption.bind(this)}>click here</a> to configure encryption mode...
                        </p>
                    </span>

                    <h3>API: </h3>
                    <span>
                        {this.state.response.apiEnabled ?
                            (<div>
                                <p>Your API is currently enabled, <a onClick={this.disableAPI.bind(this)}>click here</a> to disable API...</p>
                                <div className={styles["api-box"]}>{this.state.response.apiKey}
                                    <img className={styles["sharex"]} src="images/sharex.svg" onClick={this.downloadShareXConfig.bind(this)} />
                                </div>
                                
                            </div>)
                            : (<div>
                                <p>Your API is currently disabled, <a onClick={this.disableAPI.bind(this)}>click here</a> to enable API...</p>
                            </div>)}
                    </span>


                </div>
            </div>) : null;

        const error = this.state.error && this.state.finished ?
        (<div>
            <div className={styles["warning-title"]}>Error!</div>
            <div className={styles["warning-message"]}>{this.state.error}</div>
        </div>) : null;

        return (
            <div>
                {loader}
                {dialog}
                {passwordDialog}
                {nameDialog}
                {encryptionDialog}
                {error}
            </div>);
    }
}