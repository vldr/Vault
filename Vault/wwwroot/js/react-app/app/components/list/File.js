import React from 'react';
import ContextMenu from '../contextmenu/ContextMenu';
import swal from '@sweetalert/with-react';

import { Draggable, Droppable } from 'react-drag-and-drop';
import { DeleteFile } from '../action/DeleteFile';
import { ShareFile } from '../action/ShareFile';
import { RenameFile } from '../action/RenameFile';

import styles from '../../App.css';

export class File extends React.Component
{
    deleteFile()
    {
        swal(<DeleteFile file={this.props.file} />, {
            buttons: false
        });
    }

    shareFile()
    {
        swal(<ShareFile file={this.props.file} />, {
            buttons: false
        });
    }

    renameFile()
    {
        swal(<RenameFile file={this.props.file} />, {
            buttons: false
        });
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
                    swal.close();
                },
                (error) => {
                    swal(error.message, {
                        buttons: false
                    });
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
                <ContextMenu onRef={ref => (this.child = ref)} disabled />
                <Draggable type="file" data={file.id} onContextMenu={this.showContextMenu.bind(this)}>
                    <div className={styles["gridItem"]}>
                        <div className={styles["grid-file-icon"]} style={fileIconStyle} />

                        <p className={styles["grid-file-text"]}>{file.name}</p>
                        <p className={styles["grid-text-right"]}>{file.date} ({file.size}) {file.isSharing ? "(S)" : ""}</p>
                    </div>
                </Draggable>
            </>
        );
    }
}