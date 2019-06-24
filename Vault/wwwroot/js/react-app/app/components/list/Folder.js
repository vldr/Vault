import React from 'react';
import ContextMenu from '../contextmenu/ContextMenu';
import swal from '@sweetalert/with-react';

import { DragDropContainer } from '../dnd/DragDropContainer';
import { DropTarget } from '../dnd/DropTarget';

import { RenameFolder } from '../action/RenameFolder';
import { ShareFolder } from '../action/ShareFolder';
import { DeleteFolder } from '../action/DeleteFolder';
import { EmptyRecycleBin } from '../action/EmptyRecycleBin';

import { ActionAlert } from '../info/ActionAlert';
import styles from '../../App.css';

export class Folder extends React.Component {

    moveFileToFolder(fileId, folderId, draggedElement)
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
                     {
                         // Bring up a dialog of what happened...
                         swal(result.reason, {
                             buttons: false
                         });

                         // Reset our opacity...
                         draggedElement.style.opacity = "unset";
                     }
                },
                (error) => {
                    // Bring up a dialog of what happened...
                    swal(error.message, {
                        buttons: false
                    });

                    // Reset our opacity...
                    draggedElement.style.opacity = "unset";
                }
            ); 
    }

    moveFolderToFolder(folderId, locationFolderId, draggedElement)
    {
        // Ignore passing the folder inside of itself...
        if (folderId === locationFolderId) {
            // Reset our opacity...
            draggedElement.style.opacity = "unset";

            // Return here...
            return;
        }

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
                    if (!result.success) {
                        // Bring up a dialog of what happened...
                        swal(result.reason, {
                            buttons: false
                        });

                        // Reset our opacity...
                        draggedElement.style.opacity = "unset";
                    }
                },
                (error) => {
                    // Bring up a dialog of what happened...
                    swal(error.message, {
                        buttons: false
                    });

                    // Reset our opacity...
                    draggedElement.style.opacity = "unset";
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

    onDrop(event)
    {
        if (event.type === 'fileDrop') {
            // Set our opacity to indicate that it is about to disappear...
            event.containerElem.style.opacity = "0.3";

            // Move our file to the folder indicated...
            this.moveFileToFolder(event.dragData.id, this.props.folder.id, event.containerElem);
        }
        else if (event.type === 'folderDrop') {
            // Set our opacity to indicate that it is about to disappear...
            event.containerElem.style.opacity = "0.3";

            // Move our folder to the folder indicated...
            this.moveFolderToFolder(event.dragData.id, this.props.folder.id, event.containerElem);
        }
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
                    <div className={`${styles["gridItem"]}`}
                        onClick={this.props.gotoFolder.bind(this, folder.id)}
                        onContextMenu={folder.isPrevious ? null : this.showContextMenu.bind(this)}>
                        <div className={styles["grid-file-icon"]} style={folderIconStyle} />
                        <p className={styles["grid-file-text"]}>{folder.name}</p>
                        <p className={styles["grid-text-right"]} />
                    </div>
                </div>
            );
        else
            // Return our normal view...
            return (
                <DropTarget targetKey="folder" onHit={this.onDrop.bind(this)}>
                    <DropTarget targetKey="file" onHit={this.onDrop.bind(this)}>

                        <DragDropContainer targetKey="folder" dragData={folder} contextMenu={folder.isPrevious ? null : this.showContextMenu.bind(this)}>
                            <ContextMenu ref={(ref) => { this.child = ref; }} disabled />

                            <div className={`${styles["gridItem-folder"]} ${folderClassName}`}
                                onClick={this.props.gotoFolder.bind(this, folder.id)}>

                                <div className={styles["grid-icon"]} style={folder.isRecycleBin ? {} : folderIconStyle} />
                                <p className={styles["grid-text"]}>{folder.name}</p>
                            </div>
                        </DragDropContainer>

                    </DropTarget>
                </DropTarget>
            );
    }
}