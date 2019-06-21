import React from 'react';
import styles from '../../App.css';

export class VideoView extends React.Component
{
    render() {
        // Check if we we're provided with a prop...
        if (!this.props.view) return null;

        // Setup a constant...
        const view = this.props.view;

        // Setup our url...
        const url = `${view.relativeURL}${view.url}`;

        // Return our view...
        return (
            <>
                <video className={styles['overlay-preview']} controls>
                    <source src={url} type="video/mp4" />
                    <source src={url} type="video/ogg" />
                </video>
            </>);
    }
}