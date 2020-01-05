import React from 'react';
import styles from '../../app/App.css';

export class DeleteFlashcard extends React.Component {
    close() {
        swal.close();
    }

    onClick() {
        this.props.deleteCard(this.props.index);
        this.close();
    }

    render() {
        return (
            <div>
                <div className={styles["warning-title"]}>Are you sure?</div>
                <div className={styles["warning-message"]}>
                    <p>Performing this action will delete the flashcard.</p>
                </div>

                <button className={styles["button"]} onClick={this.onClick.bind(this)}>Delete</button>
                <button className={styles["button"] + " " + styles["inverse"]} onClick={this.close.bind(this)}>Close</button>
            </div>
        );
    }
}