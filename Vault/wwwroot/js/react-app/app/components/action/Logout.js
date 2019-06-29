import React from 'react';
import styles from '../../app/App.css';

export class Logout extends React.Component {
    /**
     * Close our dialog when close is needed...
     */
    close() {
        swal.close();
    }

    onClick() {
        window.location.href = `process/logout`;
    }

    render() {
        return (
            <div>
                <div className={styles["warning-title"]}>Logout</div>
                <div className={styles["warning-message"]}>
                    <p>Performing this action will log you out of your account...</p>
                </div>

                <button className={styles["button"]} onClick={this.onClick.bind(this)}>Logout</button>
                <button className={styles["button"] + " " + styles["inverse"]} onClick={this.close.bind(this)}>Close</button>
            </div>
        );
    }
}