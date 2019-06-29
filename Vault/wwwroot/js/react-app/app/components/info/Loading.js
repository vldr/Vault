import React from 'react';
import styles from '../../app/App.css';

export class Loading extends React.Component
{
    render() {
        return (
            <div className={styles["intro-box"]}>
                <img src="images/ui/logo.svg" />
            </div>
        );
    }
}