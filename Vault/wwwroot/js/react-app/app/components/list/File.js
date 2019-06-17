import React from 'react';
import ContextMenu from '../contextmenu/ContextMenu';
import swal from '@sweetalert/with-react';

import { Draggable, Droppable } from 'react-drag-and-drop';
import { DeleteFile } from '../action/DeleteFile';
import { ShareFile } from '../action/ShareFile';
import { RenameFile } from '../action/RenameFile';

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
                <li className="menu-option">Select</li>
                <li className="menu-option" onClick={this.downloadFile.bind(this)}>Download</li>
                <li className="menu-option">Make a Copy</li>
                <li className="menu-option" onClick={this.renameFile.bind(this)}>Rename</li>
                <li className="menu-option" onClick={this.shareFile.bind(this)}>Share</li>
                <li className="menu-option" onClick={this.deleteFile.bind(this)}>Delete</li>
            </>
        ); 

        /*
        (selected ? `<li class="menu-option" onclick="addSelectionFile(null, ${fileId})">Select</li>`
        : `<li class="menu-option" onclick="addSelectionFile(null, ${fileId})">Deselect</li>`)
        + (isSearching ? `<li class="menu-option" onclick="processOpenFileLocation(${fileId})">Open File Location</li>` : ``)
        + `<li class="menu-option" onclick="processDownloadFile(${fileId})">Download</li>`
        + `<li class="menu-option" onclick="processDuplicateFile(${fileId})">Make a Copy</li>`
        + `<li class="menu-option" data-file-title="${fileTitle}" onclick="processRenameFile(event, ${fileId})">Rename</li>`
        + `<li class="menu-option" onclick="processShareFile(${fileId})">Share</li>`
        + `<li class="menu-option" onclick="processDelete(${fileId})">Delete</li>`
        */

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
                    <div className="gridItem">
                        <div className="grid-file-icon" style={fileIconStyle} />

                        <p className="grid-file-text">{file.name}</p>
                        <p className="grid-text-right">{file.date} ({file.size}) {file.isSharing ? "(S)" : ""}</p>
                    </div>
                </Draggable>
            </>
        );
    }
}