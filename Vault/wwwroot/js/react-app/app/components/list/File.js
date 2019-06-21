import React from 'react';
import ContextMenu from '../contextmenu/ContextMenu';
import swal from '@sweetalert/with-react';

import { Draggable, Droppable } from 'react-drag-and-drop';
import { DeleteFile } from '../action/DeleteFile';
import { ShareFile } from '../action/ShareFile';
import { RenameFile } from '../action/RenameFile';
import { ActionAlert } from '../info/ActionAlert';

import styles from '../../App.css';

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
        swal(<center><div className="loader" /></center>,
            {
                buttons: false,
                closeOnClickOutside: false
            });

        // Attempt to update the sorting...
        fetch("process/duplicatefile",
            {
                method: 'POST',
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
                        new ActionAlert(<p>result.reason</p>);

                        // Return here...
                        return;
                    }

                    // Close our swal...
                    swal.close();
                },
                (error) => {
                    // Alert of the error...
                    new ActionAlert(<p>error.message</p>);
                }
            );
    }

    openFileLocation() {
        // Setup a loading dialog...
        swal(<center><div className="loader" /></center>,
            {
                buttons: false,
                closeOnClickOutside: false
            });

        // Attempt to update the sorting...
        fetch("process/openfilelocation",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `fileid=${encodeURIComponent(this.props.file.id)}`
            })
            .then(res => res.json())
            .then(
                (result) => 
                {
                    // Check if result failed...
                    if (!result.success) {
                        // Alert of the error...
                        new ActionAlert(<p>result.reason</p>);

                        // Return here...
                        return;
                    }

                    // Call our callback...
                    this.props.searchCallback();

                    // Close our swal...
                    swal.close();
                },
                (error) => {
                    // Alert of the error...
                    new ActionAlert(<p>error.message</p>);
                }
            );
    }

    downloadFile()
    {
        var form = document.createElement("form");

        form.method = "POST";
        form.action = `process/download/${this.props.file.id}`;

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    }

    showContextMenu(event)
    {
        // Setup our contextmenu options...
        const options = (
            <>
                <li className={styles["menu-option"]}>Select</li>

                {this.props.searchCallback
                    && <li className={styles["menu-option"]} onClick={this.openFileLocation.bind(this)}>Open File Location</li>}

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

    render() {
        // Check if our prop is valid...
        if (!this.props.file) return null;

        // Setup a simple variable of the this file...
        const file = this.props.file;

        // Setup our folder icon style...
        const fileIconStyle =
        {
            backgroundImage: `url(${file.icon})`
        };
         
        // Return our rendering of the item...
        return (
            <>
                <ContextMenu ref={(ref) => { this.child = ref; }} disabled />
                <Draggable type="file" data={file.id} onContextMenu={this.showContextMenu.bind(this)}>
                    <div className={styles["gridItem"]} onClick={() => { if (this.props.openViewer) this.props.openViewer(file.id); }}>
                        <div className={styles["grid-file-icon"]} style={fileIconStyle} />

                        <p className={styles["grid-file-text"]}>{file.name}</p>
                        <p className={styles["grid-text-right"]}>{file.date} ({file.size}) {file.isSharing ? "(S)" : ""}</p>
                    </div>
                </Draggable>
            </>
        );
    }
}