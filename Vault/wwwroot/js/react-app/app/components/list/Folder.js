import React from 'react';
import ContextMenu from '../contextmenu/ContextMenu';
import swal from '@sweetalert/with-react';

import { Draggable, Droppable } from 'react-drag-and-drop';
import { RenameFolder } from '../action/RenameFolder';
import { ShareFolder } from '../action/ShareFolder';
import { DeleteFolder } from '../action/DeleteFolder';
import { EmptyRecycleBin } from '../action/EmptyRecycleBin';

import { ActionAlert } from '../info/ActionAlert';
import styles from '../../App.css';

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
                        swal(result.reason, {
                            buttons: false
                        });
                },
                (error) => {
                    swal(error.message, {
                        buttons: false
                    });
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
                        swal(result.reason, {
                            buttons: false
                        });
                },
                (error) => {
                    swal(error.message, {
                        buttons: false
                    });
                }
            );
    }

    changeFolderColour(colour) {
        // Setup a loading dialog...
        swal(<center><div className={styles["loader"]} /></center>,
            {
                buttons: false,
                closeOnClickOutside: false
            });

        // Attempt to update the sorting...
        fetch("process/setcolour",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `folderid=${encodeURIComponent(this.props.folder.id)}&colour=${encodeURIComponent(colour)}`
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

    onDrop(data)
    {
        if (data.file) this.moveFileToFolder(data.file, this.props.folder.id);
        else if (data.folder) this.moveFolderToFolder(data.folder, this.props.folder.id);
    }

    renameFolder() {
        new ActionAlert(<RenameFolder folder={this.props.folder} />);
    }

    shareFolder() {
        new ActionAlert(<ShareFolder folder={this.props.folder} />);
    }

    deleteFolder() {
        new ActionAlert(<DeleteFolder folder={this.props.folder} />);
    }

    emptyRecycleBin() {
        new ActionAlert(<EmptyRecycleBin folder={this.props.folder} />);
    }

    downloadFolder()
    {
        window.location.href = `process/download/folder/${this.props.folder.id}`;
    }

    showContextMenu(event)
    {
        // Setup our contextmenu options depending if it is a recycle bin or a folder...
        const options = !this.props.folder.isRecycleBin ? (<>
            <li className={styles["menu-option"]}>Select</li>
            <li className={styles["menu-option"]} onClick={this.downloadFolder.bind(this)}>Download</li>
            <li className={styles["menu-option"]} onClick={this.renameFolder.bind(this)}>Rename</li>
            <li className={styles["menu-option"]} onClick={this.shareFolder.bind(this)}>Share</li>
            <li className={styles["menu-option"]} onClick={this.deleteFolder.bind(this)}>Delete</li>
            <li className={styles["menu-option-color-picker"]}>
                <div className={`${styles["color-circle"]} ${styles["orange"]}`} onClick={this.changeFolderColour.bind(this, 0)} />
                <div className={`${styles["color-circle"]} ${styles["purple"]}`} onClick={this.changeFolderColour.bind(this, 1)} />
                <div className={`${styles["color-circle"]} ${styles["green"]}`} onClick={this.changeFolderColour.bind(this, 2)} />
                <div className={`${styles["color-circle"]} ${styles["red"]}`} onClick={this.changeFolderColour.bind(this, 3)} />
                <div className={`${styles["color-circle"]} ${styles["blue"]}`} onClick={this.changeFolderColour.bind(this, 4)} />
            </li>
        </>) : (<>
                <li className={styles["menu-option"]}>Select</li>
                <li className={styles["menu-option"]} onClick={this.emptyRecycleBin.bind(this)}>Empty Recycle Bin</li>
            </>);

        // Toggle the menu of the context menu...
        this.child.toggleMenu(event, options);
    }

    render() {
        // Check if our prop is valid...
        if (!this.props.folder) return null;

        // Setup a simple variable of the this folder...
        const folder = this.props.folder;

        // Set our folder's icon accordingly...
        if (folder.isRecycleBin)
            folder.icon = (folder.empty === true ? "images/recycle-empty.svg" : "images/recycle.svg");

        // Setup our folder icon style...
        const folderIconStyle =
        {
            backgroundImage: `url(${folder.icon})`,
            backgroundSize: `24px`
        };

        // Setup our folder's class name...
        const folderClassName = folder.isRecycleBin ? folder.empty === true ? styles["recycle-bin-empty"] : styles["recycle-bin"] : styles[folder.style];

        // Return a rendered result of this folder...
        if (this.props.listView)
            // Return our listview division...
            return (
                <div>
                    <ContextMenu ref={(ref) => { this.child = ref; }} disabled />
                    <div className={`${styles["gridItem"]}`} onContextMenu={folder.isPrevious ? null : this.showContextMenu.bind(this)}>
                        <div className={styles["grid-file-icon"]} style={folderIconStyle} />
                        <p className={styles["grid-file-text"]}>{folder.name}</p>
                        <p className={styles["grid-text-right"]} />
                    </div>
                </div>
            );
        else
            // Return our normal view...
            return (
                <Droppable types={['file', 'folder']} onDrop={this.onDrop.bind(this)}>
                    <ContextMenu ref={(ref) => { this.child = ref; }} disabled />
                    <Draggable className={`${styles["gridItem-folder"]} ${folderClassName}`}
                        onContextMenu={folder.isPrevious ? null : this.showContextMenu.bind(this)}
                        onClick={this.props.gotoFolder.bind(this, folder.id)}

                        type="folder"
                        data={folder.id}>
                        <div className={styles["grid-icon"]} style={folder.isRecycleBin ? {} : folderIconStyle} />
                        <p className={styles["grid-text"]}>{folder.name}</p>
                    </Draggable>
                </Droppable>
            );
    }
}