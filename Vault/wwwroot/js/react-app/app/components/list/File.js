import React from 'react';
import ContextMenu from '../contextmenu/ContextMenu';
import swal from '@sweetalert/with-react';

import { DragDropContainer } from '../dnd/DragDropContainer';
import { DropTarget } from '../dnd/DropTarget';

import { DeleteFile } from '../action/DeleteFile';
import { ShareFile } from '../action/ShareFile';
import { RenameFile } from '../action/RenameFile';
import { ActionAlert } from '../info/ActionAlert';

import styles from '../../app/App.css';

export class File extends React.Component
{
    deleteFile()
    {
        new ActionAlert(<DeleteFile file={this.props.file} />);
    }

    shareFile()
    {
        new ActionAlert(<ShareFile file={this.props.file} />);
    }

    renameFile()
    {
        new ActionAlert(<RenameFile file={this.props.file} />);
    }

    duplicateFile()
    {
        // Setup a loading dialog...
        new ActionAlert(<center><div className="loader" /></center>);

        // Attempt to update the sorting...
        fetch("process/duplicatefile",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `fileid=${encodeURIComponent(this.props.file.id)}`
            })
            .then(res => res.json())
            .then(
                (result) => {
                    // Check if result failed...
                    if (!result.success) {
                        // Alert of the error...
                        new ActionAlert(<p>{result.reason}</p>);

                        // Return here...
                        return;
                    }

                    // Close our swal...
                    swal.close();
                },
                (error) => {
                    // Alert of the error...
                    new ActionAlert(<p>{error.message}</p>);
                }
            );
    }

    downloadFile()
    {
        // Setup a form...
        let form = document.createElement("form");
        form.method = "POST";
        form.action = `process/download/${this.props.file.id}`;

        // Append it to the document...
        document.body.appendChild(form);

        // Submit it...
        form.submit();

        // Remove it from the document...
        document.body.removeChild(form);
    }

    openFileLocation() { if (this.props.openFileLocation) this.props.openFileLocation(this.props.file.id); }

    showContextMenu(event)
    {
        // Setup our contextmenu options...
        const options = (
            <>
                <li className={styles["menu-option"]} onClick={() => { if (this.props.openViewer) this.props.openViewer(this.props.file.id); }}>Open</li>
                {this.props.openFileLocation && <li className={styles["menu-option"]} onClick={this.openFileLocation.bind(this)}>Open File Location</li>}

                <li className={styles["menu-option"]} onClick={this.downloadFile.bind(this)}>Download</li>
                <li className={styles["menu-option"]} onClick={this.duplicateFile.bind(this)}>Make a Copy</li>
                <li className={styles["menu-option"]} onClick={this.renameFile.bind(this)}>Rename</li>
                <li className={styles["menu-option"]} onClick={this.shareFile.bind(this)}>Share</li>
                <li className={styles["menu-option"]} onClick={this.deleteFile.bind(this)}>Delete</li>
            </>
        ); 

        // Toggle the menu of the context menu...
        this.child.toggleMenu(event, options);
    }

    formatDate(unix)
    {
        // Setup our current date...
        const now = new Date();   

        // Set our file creation date...
        let date = new Date(unix * 1000);

        // Format our date...
        let formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

        if (date.getDate() === now.getDate()
            && date.getMonth() === now.getMonth()
            && date.getFullYear() === now.getFullYear()) formattedDate = `Today`;
        else if (date.getDate() === now.getDate() - 1
            && date.getMonth() === now.getMonth()
            && date.getFullYear() === now.getFullYear()) formattedDate = `Yesterday`;

        // Return our final formatted date...
        return `${formattedDate} at ${date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;
    }

    render() {
        // Check if our prop is valid...
        if (!this.props.file) return null;

        // Setup a simple variable of the this file...
        const file = this.props.file;

        // Setup our folder icon style...
        const fileIconStyle =
        { 
            backgroundImage: `url(${file.icon})`,
            backgroundSize: `50px`
        };

        // Format our time...
        const timeFormatted = this.formatDate(file.date);

        // Return a rendered result of this folder...
        if (this.props.listView)
            // Return our listview division...
            return (
                <>
                    <ContextMenu ref={(ref) => { this.child = ref; }} disabled />
                    <DragDropContainer targetKey="file" dragData={file} contextMenu={this.showContextMenu.bind(this)}>
                        <div className={styles["gridItem"]}
                            onClick={() => { if (this.props.openViewer) this.props.openViewer(file.id); }}>

                            <div className={styles["grid-file-icon"]} style={fileIconStyle} />

                            <p className={styles["grid-file-text"]}>{file.name}</p>
                            <p className={styles["grid-text-right"]}>{file.date} ({file.size}) {file.isSharing ? "(S)" : ""}</p>
                        </div>
                    </DragDropContainer>
                </>
            );
        else
            return (
                <>
                    <ContextMenu ref={(ref) => { this.child = ref; }} disabled />
                    <DragDropContainer targetKey="file" dragData={file} contextMenu={this.showContextMenu.bind(this)}>
                        <div className={styles["gridItem-folder"]}
                            onClick={() => { if (this.props.openViewer) this.props.openViewer(file.id); }}>

                            <div className={styles["grid-icon"]} style={fileIconStyle} />

                            <p className={styles["grid-text"]}>{file.name}</p>
                            <p className={styles["grid-subtext"]}>{timeFormatted}</p>
                            <p className={styles["grid-subtext"]}>{file.size}</p>
                        </div>
                    </DragDropContainer>
                </>
            );
    }
}