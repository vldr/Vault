import React from 'react';
import styles from '../../App.css';

export class PhotoView extends React.Component
{
    render() {
        // Check if we we're provided with a prop...
        if (!this.props.view) return null;

        // Setup a constant...
        const view = this.props.view;

        // Setup our url...
        const url = `${view.relativeURL}${view.url}`;

        // Return our view...
        return <img src={url} className={styles['overlay-preview']} />;
    }
}