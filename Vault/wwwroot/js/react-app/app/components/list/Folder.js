import React from 'react';

export class Folder extends React.Component {
    render() {
        // Check if our prop is valid...
        if (!this.props.folder) return null;

        console.log(this.props.folder);

        // Setup a simple variable of the this folder...
        const folder = this.props.folder;

        // Setup our folder icon style...
        const folderIconStyle =
        {
            backgroundImage: `url(${folder.icon})`,
            backgroundSize: `24px`
        };

        // Setup our folder's class name...
        const folderClassName = folder.isRecycleBin ? "" : folder.style;

        // Return a rendered result of this folder...
        return (
            <div className={`gridItem-folder ${folderClassName}`}>
                <div className="grid-icon" style={folderIconStyle} />
            </div>
        );
    }
}