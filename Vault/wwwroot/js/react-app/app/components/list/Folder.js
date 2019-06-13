import React from 'react';

export class Folder extends React.Component {

    render() {
        // Check if our prop is valid...
        if (!this.props.folder) return null;

        // Setup a simple variable of the this folder...
        const folder = this.props.folder;

        // Setup our folder icon style...
        const folderIconStyle =
        {
            backgroundImage: `url(${folder.icon})`,
            backgroundSize: `24px`
        };

        // Setup our folder's class name...
        const folderClassName = folder.isRecycleBin ? folder.empty === true ? "recycle-bin-empty" : "recycle-bin" : folder.style;

        // Return a rendered result of this folder...
        return (
            <div className={`gridItem-folder ${folderClassName}`} onClick={this.props.gotoFolder.bind(this, folder.id)}>
                <div className="grid-icon" style={folder.isRecycleBin ? {} : folderIconStyle} />
                <p className="grid-text">{folder.name}</p>
            </div>
        );
    }
}