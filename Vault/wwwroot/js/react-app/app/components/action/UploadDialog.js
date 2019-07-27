import React from 'react';
import swal from '@sweetalert/with-react';
import styles from '../../app/App.css';

export class UploadDialog extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            view: 0 
        };
    }

    /**
     * Close our dialog when close is needed...
     */
    close()
    {
        swal.close();
    }

    upload()
    {
        // Close our dialog...
        this.close();

        // Process all our files...
        this.props.zone.files.forEach((item) =>
        {
            // Only process our queued files...
            if (item.status === "queued")
            {
                // Set our password param...
                this.props.zone.options.params = {};

                // Process our file...
                this.props.zone.processFile(item);
            }
        });
    }

    uploadAndEncrypt()
    {
        // Check if our value is valid...
        if (!this.password.value) return;

        // Focus on our password...
        this.password.focus()

        // Close our dialog...
        this.close();

        // Process all our files...
        this.props.zone.files.forEach((item) =>
        {
            // Only process our queued files...
            if (item.status === "queued")
            {
                // Set our password param...
                this.props.zone.options.params = { password: this.password.value };

                // Process our file...
                this.props.zone.processFile(item);
            }
        });
    }

    changeView(view) { this.setState({ view: view }); }

    render()
    {
        const dialog = this.state.view === 0 && (<div style={{display: "flex"}}>
            <div className={styles["upload-selection-button"]} onClick={this.upload.bind(this)}>
                <div className={styles["upload-file-icon"]} />

                <h3>Upload</h3>
                <p>Uploading without encryption provides more features but is less secure against possible threats.</p>
            </div>
            <div className={styles["upload-selection-button"]} onClick={this.changeView.bind(this, 1)}>
                <div className={styles["lock-file-icon"]} />
                <h3>Upload and Encrypt</h3>
                <p>Uploading and encrypting disables previews but is a lot more secure against possible threats.</p>
            </div>
        </div>);

        const encrypt = this.state.view === 1 && (<div>
            <div className={styles["lock-file-icon"]} />
            <div className={styles["warning-title"]}>Encrypt File(s)</div>
            <div className={styles["warning-message"]}>
                <p>Please type a strong password to encrypt your file(s):
                    <br />
                    <i>(note: if you're uploading multiple files this password will apply to all of them)</i>
                </p>

                <input type="password" style={{ fontSize: "20px", width: "150px" }}
                    ref={(input) => { this.password = input; }}
                    onKeyDown={(e) => { if (e.key === 'Enter') this.uploadAndEncrypt(); }}
                />
            </div>

            <button className={styles["button"]} onClick={this.uploadAndEncrypt.bind(this)}>Encrypt</button>
            <button className={styles["button"] + " " + styles["inverse"]} onClick={this.changeView.bind(this, 0)}>Go Back</button>
        </div>);

        return (
        <div>
            {encrypt}
            {dialog}
        </div>);
    }
}