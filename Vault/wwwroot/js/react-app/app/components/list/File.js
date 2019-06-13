import React from 'react';

export class File extends React.Component {
    render() {
        // Check if our prop is valid...
        if (!this.props.file) return null;

        // Setup a simple variable of the this file...
        const file = this.props.file;

        console.log(file);

        // Setup our folder icon style...
        const fileIconStyle =
        {
            backgroundImage: `url(${file.icon})`
        };

        // Return our rendering of the item...
        return (
            <div className="gridItem">
                <div className="grid-file-icon" style={fileIconStyle} />

                <p className="grid-file-text">{file.name}</p>
                <p className="grid-text-right">{file.date} ({file.size}) {file.isSharing ? "(S)" : ""}</p>
            </div>
        );
    }
}