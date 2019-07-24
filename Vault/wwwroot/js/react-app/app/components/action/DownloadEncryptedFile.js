import React from 'react';
import swal from '@sweetalert/with-react';
import styles from '../../app/App.css';

export class DownloadEncryptedFile extends React.Component
{
    constructor(props)
    {
        super(props);
    }

    componentDidMount() {
        // Janky solution because browser restrictions of animations...
        setTimeout(() => this.password.focus(), 100);
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
        // Check if our input field is empty...
        if (!this.password.value) return;

        // Setup a form...
        let form = document.createElement("form");
        form.method = "POST";
        form.action = this.props.action;

        // Setup our password parameter...
        var input = document.createElement('input');
        input.setAttribute('name', "password");
        input.setAttribute('value', this.password.value);
        input.setAttribute('type', "hidden");

        // Append it to the document...
        form.appendChild(input);
        document.body.appendChild(form);

        // Submit it...
        form.submit();

        // Remove it from the document...
        document.body.removeChild(form);

        // Close our dialog...
        swal.close();
    }

    render()
    {
        const dialog = (<div>
            <div className={styles["unlock-file-icon"]} />
            <div className={styles["warning-title"]}>Decrypt File</div>
            <div className={styles["warning-message"]}>
                <p>Please enter the password of this file to download it:</p>

                <input type="password" style={{ fontSize: "20px", width: "150px" }}
                    ref={(input) => { this.password = input; }}
                    onKeyDown={(e) => { if (e.key === 'Enter') this.onClick(); }}
                />
            </div>

            <button className={styles["button"]} onClick={this.onClick.bind(this)}>Download</button>
            <button className={styles["button"] + " " + styles["inverse"]} onClick={this.close.bind(this)}>Close</button>
        </div>);

        return (
        <div>
            {dialog}
        </div>);
    }
}