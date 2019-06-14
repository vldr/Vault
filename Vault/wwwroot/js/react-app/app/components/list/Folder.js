import React from 'react';
import { Draggable, Droppable } from 'react-drag-and-drop';

export class Folder extends React.Component {

    moveFileToFolder(fileId, folderId)
    {
        // Fetch our new result...
        fetch("process/movefile",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `file=${encodeURIComponent(fileId)}&folder=${encodeURIComponent(folderId)}`
            })
            .then(res => res.json())
            .then(
                 (result) => {
                    if (!result.success)
                        swal(result.reason);
                },
                (error) => {
                    swal(error.message);
                }
            ); 
    }

    moveFolderToFolder(folderId, locationFolderId)
    {
        // Fetch our new result...
        fetch("process/movefolder",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `from=${encodeURIComponent(folderId)}&to=${encodeURIComponent(locationFolderId)}`
            })
            .then(res => res.json())
            .then(
                (result) => {
                    if (!result.success)
                        swal(result.reason);
                },
                (error) => {
                    swal(error.message);
                }
            );
    }

    onDrop(data)
    {
        console.log(data)
        if (data.file) this.moveFileToFolder(data.file, this.props.folder.id);
        else if (data.folder) this.moveFolderToFolder(data.folder, this.props.folder.id);
    }

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
            <Droppable types={['file', 'folder']} onDrop={this.onDrop.bind(this)}>
                <Draggable className={`gridItem-folder ${folderClassName}`} onClick={this.props.gotoFolder.bind(this, folder.id)} type="folder" data={folder.id}>
                    <div className="grid-icon" style={folder.isRecycleBin ? {} : folderIconStyle} />
                    <p className="grid-text">{folder.name}</p>
                </Draggable>
            </Droppable>
        );
    }
}