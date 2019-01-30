var fadeOutTimer;
var currentFolder;
var rendered;

var multiSelection = null;

var selection = [];

function createCookie(name, value, expires, path, domain) {
    var cookie = name + "=" + escape(value) + ";";

    if (expires) {
        if (expires instanceof Date) {
            if (isNaN(expires.getTime()))
                expires = new Date();
        }
        else
            expires = new Date(new Date().getTime() + parseInt(expires) * 1000 * 60 * 60 * 24);

        cookie += "expires=" + expires.toGMTString() + ";";
    }

    if (path)
        cookie += "path=" + path + ";";
    if (domain)
        cookie += "domain=" + domain + ";";

    document.cookie = cookie;
}

function toggleDarkMode() {
    if (document.cookie.indexOf(".vault.nightmode") !== -1) document.cookie = ".vault.nightmode=0;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    else createCookie(".vault.nightmode", "1");

    document.location.reload(true);
}

function renderFiles(json) {
    var elem = document.getElementById('file-listing');

    if (json.files.length > 0) {
        elem.style.display = "block";
    }

    for (i in json.files) {
        var file = json.files[i];

        elem.insertAdjacentHTML("beforeend",
            `<div class='gridItem'
                data-file-id='${file.id}'
                data-file-title='${file.name}'
                data-file-shared='${file.isSharing}'
                data-file-share='${file.shareId}'
                ondragend='dragEnd(event)'
                ondragstart='dragStart(event)'
                ondrop='drop(event)'
                oncontextmenu="contextMenuFile(event)"
                onclick='processDownload(event)'
                draggable='true'>

            <div class="grid-file-icon" data-file-id="${file.id}" data-file-title="${file.name}" 
            ondragstart="dragStart(event)" draggable="true" style="background-image: url('${file.icon}');"></div>

            <p class="grid-file-text" data-file-title="${file.name}" data-file-id="${file.id}">${file.name}</p>
            <p class="grid-text-right" data-file-title="${file.name}" data-file-id="${file.id}">${file.date} (${file.size}) ${file.isSharing ? "(S)" : ""}</p>
            </div>`);
    }

    highlightCutBoard();

    rendered += json.files.length;
}

function renderListings(json, isSilent = false) {
    var folderListingElem = document.getElementById('folder-listing');
    var fileListingElem = document.getElementById('file-listing');

    folderListingElem.innerHTML = "";
    fileListingElem.style.display = "none";

    currentFolder = json.current;

    if (json.sort === 0) json.sort = 4;

    fileListingElem.innerHTML =
        `<div id="sort-box">
	        <a class="sorting-option-left" onclick="processSortBy(${json.sort >= 0 ? "2" : "-2"})" 
            style="margin-right: 5px; ${Math.abs(json.sort) === 2 ? "font-weight: 600;" : ""}">Name</a>

	        <img id="${json.sort >= 0 ? "sorting-arrow" : "sorting-arrow-down"}" 
                onclick="processSortBy(${-json.sort})" src="images/ui/arrow.svg">

            <a class="sorting-option" onclick="processSortBy(${json.sort >= 0 ? "1" : "-1"})" 
            style="margin-right: 10px; ${Math.abs(json.sort) === 1 ? "font-weight: 600;" : ""}">Size</a>

	        <a class="sorting-option" onclick="processSortBy(${json.sort >= 0 ? "3" : "-3"})"
            style="margin-right: 36px; ${Math.abs(json.sort) === 3 ? "font-weight: 600;" : ""}">Date</a>

	        <a class="sorting-option" onclick="processSortBy(${json.sort >= 0 ? "4" : "-4"})" 
            style="margin-right: 36px; ${Math.abs(json.sort) === 4 ? "font-weight: 600;" : ""}">Type</a>
        </div>`;

    document.getElementById("folder-path").innerHTML = json.path;

    if (!json.isHome) {
        folderListingElem.insertAdjacentHTML("beforeend",
            `<div class="gridItem-folder" data-folder-id="${json.previous}"
                ondrop="drop(event)"
                onclick="processMoveId(${json.previous})"
                style="background-color: rgba(255, 255, 255, 0.19);">

            <div class="grid-icon" data-folder-id="${json.previous}"
                    ondragstart="dragStart(event)" draggable="true" 
                    style="background-image: url('images/file/folder-icon.svg'); background-size: 24px;">
            </div>

            <p class="grid-text" data-folder-id="${json.previous}">...</p>
        </div>`);
    }

    for (i in json.folders) {
        var folder = json.folders[i];

        folderListingElem.insertAdjacentHTML("beforeend",
            `<div class='gridItem-folder ${folder.style}'
                data-folder-id='${folder.id}'
                data-folder-title='${folder.name}'
                data-folder-shared='${folder.isSharing}'
                data-folder-share='${folder.shareId}'
                ondragend='dragEnd(event)'
                ondragstart='dragStart(event)'
                ondrop='drop(event)'
                onclick='processMoveId(${folder.id}, event)'
                oncontextmenu="contextMenuFolder(event)"
                draggable='true'>

                <div class="grid-icon" data-folder-title="${folder.name}" data-folder-id="${folder.id}" ondragstart="dragStart(event)" draggable="true" 
                style="background-image: url('${folder.icon}'); background-size: 24px;"></div>

                <p class="grid-text" data-folder-title="${folder.name}" data-folder-id="${folder.id}">${folder.name}</p>
            </div>`);
    }

    renderFiles(json);
}

function processListFiles(reset = true, offset = 0, callback) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200 && xmlhttp.status < 300) {
                document.getElementById("loader-horizontal").style.display = "none";

                var json = JSON.parse(xmlhttp.responseText);

                if (!json.success) {
                    swal("Error!", json.reason, "error");
                    return;
                }

                var display = document.getElementById("file-viewer").style.display;

                if (display === "block")
                {
                    var value = document.getElementById("search-box").value;
                    showSearch(value, callback);

                    if (callback !== undefined)
                        callback = undefined;
                }

                if (reset) {
                    rendered = 0;
                    renderListings(json);
                }
                else renderFiles(json);

                if (json.isHome && rendered === 0 && json.folders.length === 0) {
                    document.getElementById("file-listing").innerHTML = "";
                    document.getElementById("file-listing").style.display = "none";
                    document.getElementById("folder-listing").innerHTML = `<center>
                        <img style="max-width:100%;max-height:100%;" src="images/ui/wind.png" />
                    </center>`;

                    return;
                }

                if (json.files.length !== 0) {
                    window.onscroll = function (ev) {
                        if ((window.innerHeight + window.pageYOffset) >= (document.body.offsetHeight * 0.8)) {
                            processListFiles(false, rendered);
                            window.onscroll = null;
                        }
                    };
                }

                if (callback !== undefined) callback();
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
        else if (xmlhttp.readyState < 4) {
            document.getElementById("loader-horizontal").style.display = "block";
        }
    };

    xmlhttp.open("POST", "process/list", true);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.send("offset=" + offset);
}


function processDelete(str) {
    swal({
        title: "Are you sure?",
        text: "You will not be able to recover this file ever!",
        type: "warning",
        animation: "fadein",
        showCancelButton: true,
        dangerMode: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
    },
    function () {
        var xhr = new XMLHttpRequest();

        swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4)
            {
                if (xhr.status === 200 && xhr.status < 300) {
                    var json = JSON.parse(xhr.responseText);

                    if (json.success) swal.close();
                    else swal("Error!", json.reason, "error");
                }
                else {
                    swal("Error!", "Failed to connect!", "error");
                }
            }
        };

        xhr.open('POST', 'process/deletefile');
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send("file=" + encodeURIComponent(str));
    });
}

function resetContextMenu() {
    var menu = document.getElementById("context-menu");
    var menuOptions = document.getElementById("context-menu-options");
    menu.style.display = "none";
    menuOptions.innerHTML = "";
}

function contextMenuFolder(event) {
    event.preventDefault();

    var menu = document.getElementById("context-menu");
    var menuOptions = document.getElementById("context-menu-options");

    menuOptions.innerHTML = "";

    const toggleMenu = command => {
        menu.style.display = command === "show" ? "block" : "none";
    };

    const setPosition = ({ top, left }) => {
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        toggleMenu('show');
    };

    const origin = {
        left: event.pageX,
        top: event.pageY
    };
    setPosition(origin);

    var folderId = event.target.getAttribute('data-folder-id');
    var folderTitle = event.target.getAttribute('data-folder-title').replace(/"/g, '&quot;');

    menuOptions.innerHTML = `<li class="menu-option" onclick="processMoveId(${folderId})">Open</li>`
        + `<li class="menu-option" data-folder-title="${folderTitle}" onclick="processRenameFolder(event, ${folderId})">Rename</li>`
        + `<li class="menu-option" onclick="processDownloadFolder(${folderId})">Download</li>`
        + `<li class="menu-option" onclick="processShareFolder(${folderId})">Share</li>`
        + `<li class="menu-option" data-folder-id="${folderId}" onclick="processDeleteFolder(event)">Delete</li>`
        + `<li class="menu-option-color-picker">
                <div onclick="processFolderColour(${folderId}, 0)" class="color-circle orange"></div>
                <div onclick="processFolderColour(${folderId}, 1)" class="color-circle purple"></div>
                <div onclick="processFolderColour(${folderId}, 2)" class="color-circle green"></div>
                <div onclick="processFolderColour(${folderId}, 3)" class="color-circle red"></div>
                <div onclick="processFolderColour(${folderId}, 4)" class="color-circle blue"></div>
            </li>`;
}

function processDownloadFolder(id) {
    window.location.href = "process/download/folder/" + id;
}

function processDownloadFile(id) {
    var form = document.createElement("form");

    form.method = "POST";
    form.action = "process/download/" + id;

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

function contextMenuFile(event)
{
    event.preventDefault();

    var menu = document.getElementById("context-menu");
    var menuOptions = document.getElementById("context-menu-options");

    menuOptions.innerHTML = "";

    const toggleMenu = command => {
        menu.style.display = command === "show" ? "block" : "none";
    };

    const setPosition = ({ top, left }) => {
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        toggleMenu('show');
    };

    const origin = {
        left: event.pageX,
        top: event.pageY
    };
    setPosition(origin);

    var fileId = event.target.getAttribute('data-file-id');
    var fileTitle = event.target.getAttribute('data-file-title').replace(/"/g, '&quot;');

    var selected = selection.findIndex((x) => x.id == fileId) === -1 ? true : false;

    menuOptions.innerHTML = (selected ? `<li class="menu-option" onclick="addSelectionFile(null, ${fileId})">Select</li>`
        : `<li class="menu-option" onclick="addSelectionFile(null, ${fileId})">Deselect</li>`)
        + `<li class="menu-option" onclick="processDownloadFile(${fileId})">Download</li>`
        + `<li class="menu-option" data-file-title="${fileTitle}" onclick="processRenameFile(event, ${fileId})">Rename</li>`
        + `<li class="menu-option" onclick="processShareFile(${fileId})">Share</li>`
        + `<li class="menu-option" onclick="processDelete(${fileId})">Delete</li>`;
}

function contextMenu(event)
{
    event.preventDefault();

    var menu = document.getElementById("context-menu");
    var menuOptions = document.getElementById("context-menu-options");

    menuOptions.innerHTML = "";

    const toggleMenu = command => {
        menu.style.display = command === "show" ? "block" : "none";
    };

    const setPosition = ({ top, left }) => {
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        toggleMenu('show');
    };

    const origin = {
        left: event.pageX,
        top: event.pageY
    };
    setPosition(origin);

    menuOptions.innerHTML =
        `<li class="menu-option" onclick="processFolderCreate()">New Folder</li>`
        + (selection.length > 0 ? `<li class="menu-option" onclick="processPaste()">Paste</li>`
        : `<li class="menu-option" style="color:gray;cursor:default;">Paste</li>`);
}

function showLogout() {
    swal({
        title: "Are you sure?",
        html: true,
        animation: false,
        showConfirmButton: false,
        allowOutsideClick: true,
        text: `You will be logged out of your account.<br><br><a href="process/logout" class="btn black">Logout</a>`
    });
}

function processPaste(folder = currentFolder)
{
    if (selection.length === 0) return;

    const files = selection.filter(x => x.type === 0).map(x => x.id);
    const folders = selection.filter(x => x.type === 1).map(x => x.id);

    processMoveFiles(files, folder);
    processMoveFolders(folders, folder);
 
    selection = [];
}

function resetCutBoard(clear = true)
{
    var fileEntries = document.getElementsByClassName("gridItem");
    var folderEntries = document.getElementsByClassName("gridItem-folder");

    Array.from(fileEntries).forEach(function (item) { item.style.outline = ""; });
    Array.from(folderEntries).forEach(function (item) { item.style.outline = ""; });

    if (clear) selection = [];
}

function highlightCutBoard() {
    var fileEntries = document.getElementsByClassName("gridItem");
    var folderEntries = document.getElementsByClassName("gridItem-folder");

    resetCutBoard(false);

    Array.from(fileEntries).forEach(function (entry)
    {
        for (i in selection)
        {
            var object = selection[i];

            if (entry.dataset["fileId"] == object.id || entry.dataset["folderId"] == object.id)
                entry.style.outline = "rgba(24, 138, 255, 0.43) solid 2px";
        }
    });

    Array.from(folderEntries).forEach(function (entry)
    {
        for (i in selection) {
            var object = selection[i];

            if (entry.dataset["folderId"] == object.id)
                entry.style.outline = "rgba(24, 138, 255, 0.43) solid 2px";
        }
    });
}

function showSettings() {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            document.getElementById("loader-horizontal").style.display = "none";

            if (xhr.status === 200 && xhr.status < 300) {
                swal({
                    title: "Settings",
                    html: true,
                    animation: false,
                    showConfirmButton: false,
                    allowOutsideClick: true,
                    text: xhr.responseText
                });
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
        else if (xhr.readyState < 4) {
            document.getElementById("loader-horizontal").style.display = "block";
        }
    };

    xhr.open('POST', 'settings');
    xhr.send();
}

function toggleAPI() {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300) {
                var json = JSON.parse(xhr.responseText);

                if (json.success) {
                    showSettings();
                }
                else
                    swal({ title: "Error!", text: json.reason, type: "error", timer: 1500, showConfirmButton: false });
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
        else if (xhr.readyState < 4) {
            swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });
        }
    };

    xhr.open('POST', 'process/toggleapi');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send();
}

function processToggleFolderSharing(id) {
    var checkBox = document.getElementById("share-checkbox-input");
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });

            if (xhr.status === 200 && xhr.status < 300) {
                var json = JSON.parse(xhr.responseText);

                if (json.success)
                    processListFiles(true, 0, function () { processShareFolder(id); });
                else
                    swal({ title: "Error!", text: json.reason, type: "error", timer: 1500, showConfirmButton: false });
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
    };

    xhr.open('POST', 'process/togglefoldershare');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("folderid=" + encodeURIComponent(id));
}

function processToggleSharing(id) {
    var checkBox = document.getElementById("share-checkbox-input");
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });

            if (xhr.status === 200 && xhr.status < 300) {
                var json = JSON.parse(xhr.responseText);

                if (json.success)
                    processListFiles(true, 0, function () { processShareFile(id); });
                else
                    swal({ title: "Error!", text: json.reason, type: "error", timer: 1500, showConfirmButton: false });
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
    };

    xhr.open('POST', 'process/toggleshare');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("fileid=" + encodeURIComponent(id));
}

function downloadShareX(apiKey) {
    const loc = window.location.href;
    const path = loc.substr(0, loc.lastIndexOf('/') + 1);

    var text = `{"Name": "Vault", 
                "DestinationType": "ImageUploader, TextUploader, FileUploader",
                "RequestURL": "${path}share/upload",
                "FileFormName": "file",
                "Arguments": {"apikey": "${apiKey}"}, 
                "URL": "$json:path$"}`;

    text = text.replace(/\s/g, '');

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', "sharex.sxcu");

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function selectText() {
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById("share-box"));
        range.select();
    } else if (window.getSelection) {
        var rangeC = document.createRange();
        rangeC.selectNode(document.getElementById("share-box"));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(rangeC);
    }
}

function processShareFile(id) {
    var isShared = document.querySelector(`[data-file-id='${id}']`).getAttribute("data-file-shared");
    var shareId = document.querySelector(`[data-file-id='${id}']`).getAttribute("data-file-share");

    const loc = window.location.href;
    const path = loc.substr(0, loc.lastIndexOf('/') + 1);

    swal({
        title: "Share",
        html: true,
        animation: false,
        customClass: 'fadein',
        showConfirmButton: true,

        text: `<p style="text-align: left;">You can easily share your files with anybody around the globe. Simply enable sharing and give them the link below!</p><br>`
            + (isShared === "true" ? `
            <label id="share-checkbox">Enable<input id="share-checkbox-input" type="checkbox" checked onclick="processToggleSharing(${id})">
                <span class="checkmark"></span>
            </label>
            <div id="share-box" class="share-box" onclick="selectText()">${path}share/${shareId}</div>
            <br><br>`
                : `<label id="share-checkbox">Enable
                <input id="share-checkbox-input" type="checkbox" onclick="processToggleSharing(${id})">
                <span class="checkmark"></span>
            </label>`)
    });
}

function processShareFolder(id) {
    var isShared = document.querySelector(`[data-folder-id='${id}']`).getAttribute("data-folder-shared");
    var shareId = document.querySelector(`[data-folder-id='${id}']`).getAttribute("data-folder-share");

    const loc = window.location.href;
    const path = loc.substr(0, loc.lastIndexOf('/') + 1);

    swal({
        title: "Share",
        html: true,
        animation: false,
        customClass: 'fadein',
        showConfirmButton: true,

        text: `<p style="text-align: left;">You can easily share your folders with anybody around the globe. Simply enable sharing and give them the link below!</p><br>`
            + (isShared === "true" ? `
            <label id="share-checkbox">Enable<input id="share-checkbox-input" type="checkbox" checked onclick="processToggleFolderSharing(${id})">
                <span class="checkmark"></span> 
            </label>
            <div id="share-box" class="share-box" onclick="selectText()">${path}share/folder/${shareId}</div>
            <br><br>`
                : `<label id="share-checkbox">Enable
                <input id="share-checkbox-input" type="checkbox" onclick="processToggleFolderSharing(${id})">
                <span class="checkmark"></span>
            </label>`)
    });
}

function processRenameFile(event, id) {
    var title = event.target.getAttribute('data-file-title');

    swal({
        title: "Rename File",
        text: null,
        inputValue: title,
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "fadein",
        inputPlaceholder: "John's File"
    }, function (newName) {
        if (newName === false) return false;

        if (newName === "") {
            swal.showInputError("You need to write something!");
            return false;
        }

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });

                if (xhr.status === 200 && xhr.status < 300) {
                    var json = JSON.parse(xhr.responseText);

                    if (json.success) {
                        swal.close();
                    }
                    else
                        swal("Error!", json.reason, "error");
                }
                else {
                    swal("Error!", "Failed to connect!", "error");
                }
            }
        };

        xhr.open('POST', 'process/renamefile');
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send("fileid=" + encodeURIComponent(id)
            + "&newname=" + encodeURIComponent(newName));
    });
}

function processRenameFolder(event, id)
{
    var title = event.target.getAttribute('data-folder-title');

    swal({
        title: "Rename Folder",
        text: null,
        inputValue: title,
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "fadein",
        inputPlaceholder: "John's Folder"
    }, function (newName) {
        if (newName === false) return false;

        if (newName === "") {
            swal.showInputError("You need to write something!");
            return false;
        }

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });

                if (xhr.status === 200 && xhr.status < 300) {
                    var json = JSON.parse(xhr.responseText);

                    if (json.success) {
                        swal.close();
                    }
                    else
                        swal("Error!", json.reason, "error");
                }
                else {
                    swal("Error!", "Failed to connect!", "error");
                }
            }
        };

        xhr.open('POST', 'process/renamefolder');
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send("folderid=" + encodeURIComponent(id) + "&newname=" + encodeURIComponent(newName));
    });
}

function processDeleteFolder(event) {
    var str = event.target.getAttribute('data-folder-id');

    swal({
        title: "Are you sure?",
        text: "You will not be able to recover this folder!",
        type: "warning",
        animation: "fadein",
        showCancelButton: true,
        dangerMode: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
    },
    function () {
        var xhr = new XMLHttpRequest();

        swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 && xhr.status < 300) {
                    var json = JSON.parse(xhr.responseText);

                    if (json.success) swal.close();
                    else
                        swal("Error!", json.reason, "error");
                }
                else {
                    swal("Error!", "Failed to connect!", "error");
                }
            }
        };

        xhr.open('POST', 'process/deletefolder');
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send("folder=" + encodeURIComponent(str));
    });
}

function processChangeName(name) {
    swal
        ({
            title: "Update your name...",
            text: null,
            inputValue: name,
            type: "input",
            showCancelButton: true,
            closeOnCancel: false,
            closeOnConfirm: false,
            animation: "fadein",
            inputPlaceholder: "Current Password"
        },
        function (updatedName) {
            if (updatedName === false) {
                showSettings();
                return false;
            }

            if (updatedName === "") {
                swal.showInputError("You need to write something!");
                return false;
            }

            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });

                    if (xhr.status === 200 && xhr.status < 300) {

                        var json = JSON.parse(xhr.responseText);

                        if (json.success) showSettings();
                        else swal("Error!", json.reason, "error");
                    }
                    else {
                        swal("Error!", "Failed to connect!", "error");
                    }
                }
            };

            xhr.open('POST', 'process/changename');
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send("name=" + encodeURIComponent(updatedName));
        });
}

function processChangePassword() {
    swal
        ({
            title: "Enter your current password...",
            text: null,
            type: "input",
            inputType: "password",
            showCancelButton: true,
            closeOnConfirm: false,
            closeOnCancel: false,
            animation: "fadein",
            inputPlaceholder: "Current Password"
        },
        function (currentPassword) {
            if (currentPassword === false) {
                showSettings();
                return false;
            }

            if (currentPassword === "") {
                swal.showInputError("You need to write something!");
                return false;
            }

            swal
                ({
                    title: "Enter your desired new password...",
                    text: null,
                    type: "input",
                    inputType: "password",
                    showCancelButton: true,
                    closeOnConfirm: false,
                    closeOnCancel: false,
                    animation: "fadein",
                    inputPlaceholder: "New Password"
                },
                function (newPassword) {
                    if (newPassword === false) {
                        showSettings();
                        return false;
                    }

                    if (newPassword === "") {
                        swal.showInputError("You need to write something!");
                        return false;
                    }

                    var xhr = new XMLHttpRequest();

                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });
                            if (xhr.status === 200 && xhr.status < 300) {

                                var json = JSON.parse(xhr.responseText);

                                if (json.success) swal({ title: "Success!", text: "Your password was changed!", type: "success", timer: 1500, showConfirmButton: false });
                                else swal("Error!", json.reason, "error");
                            }
                            else {
                                swal("Error!", "Failed to connect!", "error");
                            }
                        }
                    };

                    xhr.open('POST', 'process/changepassword');
                    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    xhr.send("currentPassword=" + encodeURIComponent(currentPassword)
                        + "&newPassword=" + encodeURIComponent(newPassword));
                });
        });
}

function processFolderColour(id, colour) {  
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300) {
                var json = JSON.parse(xhr.responseText);
                if (!json.success) swal("Error!", json.reason, "error");
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
    };

    xhr.open('POST', 'process/setcolour');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("folderid=" + encodeURIComponent(id) + "&colour=" + encodeURIComponent(colour));
}

function processSortBy(sortby) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });
            if (xhr.status === 200 && xhr.status < 300) {
                var json = JSON.parse(xhr.responseText);
                if (json.success) { swal.close(); }
                else swal("Error!", json.reason, "error");
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
    };

    xhr.open('POST', 'process/sortby');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("sortby=" + encodeURIComponent(sortby));
}

function processRegister(str, str2, str3, str4) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            document.getElementById('txtHint').innerHTML = "Loading...<br><br>";

            if (xhr.status === 200 && xhr.status < 300) {
                var json = JSON.parse(xhr.responseText);

                if (json.success) window.location = "index.html";
                else
                    document.getElementById('txtHint').innerHTML = `${json.reason}<br><br>`;
            }
            else {
                document.getElementById('txtHint').innerHTML = "Failed to connect!<br><br>";
            }
        }
    };

    xhr.open('POST', 'register');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("email=" + encodeURIComponent(str)
        + "&password=" + encodeURIComponent(str2)
        + "&name=" + encodeURIComponent(str3)
        + "&invite=" + encodeURIComponent(str4));
}

function processLogin(str, str2) {
    document.getElementById('login-loader-box').style.display = "block";
    document.getElementById('txtHint').innerHTML = "";

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300) {
                document.getElementById('login-loader-box').style.display = "none";

                var json = JSON.parse(xhr.responseText);

                if (json.success) window.location = "control";
                else document.getElementById('txtHint').innerHTML = `${json.reason}<br><br>`;
            }
            else {
                document.getElementById('txtHint').innerHTML = "Failed to connect!<br><br>";
            }
        }
    };

    xhr.open('POST', 'login');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("email=" + encodeURIComponent(str) + "&password=" + encodeURIComponent(str2));

}

function processMovingFileToFolder(fileId, folderId)
{
    if (folderId === null) {
        contextMenuFile(event);
        return;
    }

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300) {
                var json = JSON.parse(xhr.responseText);
                if (!json.success) swal("Error!", json.reason, "error");
            }
        }
    };

    xhr.open('POST', 'process/movefile');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("file=" + encodeURIComponent(fileId) + "&folder=" + encodeURIComponent(folderId));
}

function serialize(paramName, obj) {
    var str = [];

    for (var p in obj)
        str.push(encodeURIComponent(paramName) + "=" + encodeURIComponent(obj[p]));

    return str.join("&");
}

function processMoveFiles(files, folderId)
{
    if (files.length === 0) return;

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300) {
                var json = JSON.parse(xhr.responseText);
                if (!json.success) swal("Error!", json.reason, "error");
            }
        }
    };

    xhr.open('POST', 'process/movefiles');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(serialize("files", files) + "&folder=" + encodeURIComponent(folderId));
}

function processMoveFolders(folders, folderId) {
    if (folders.length === 0) return;

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300) {
                var json = JSON.parse(xhr.responseText);
                if (!json.success) swal("Error!", json.reason, "error");
            }
        }
    };

    xhr.open('POST', 'process/movefolders');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(serialize("folders", folders) + "&to=" + encodeURIComponent(folderId));
}

function processMovingFolderToFolder(from, to) {
    if (from === to) {
        contextMenuFolder(event);
        return;
    }

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300) {
                var json = JSON.parse(xhr.responseText);
                if (!json.success) swal("Error!", json.reason, "error");
            }
        }
    };

    xhr.open('POST', 'process/movefolder');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("from=" + encodeURIComponent(from) + "&to=" + encodeURIComponent(to));
}

function processFolderCreate() {

    swal
        ({
            title: "New Folder",
            text: null,
            type: "input",
            showCancelButton: true,
            closeOnConfirm: false,
            animation: "fadein",
            inputPlaceholder: "Documents, Applications, et al."
        },
        function (inputValue) {
            if (inputValue === false) return false;
            if (inputValue === "") {
                swal.showInputError("You need to write something!");
                return false;
            }

            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 && xhr.status < 300) {

                        var json = JSON.parse(xhr.responseText);

                        if (json.success)
                            swal.close();
                        else
                            swal("Error!", json.reason, "error");
                    }
                    else {
                        swal("Error!", "Failed to connect!", "error");
                    }
                }
            };

            xhr.open('POST', 'process/newfolder');
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send("foldername=" + encodeURIComponent(inputValue));
        });
}

function processMoveId(id, event = null)
{
    if (event !== null
        && (event.ctrlKey || event.metaKey))
        return selectFolder(event.target);

    document.getElementById("file-viewer").style.display = "none";

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300) {
                document.getElementById("loader-horizontal").style.display = "none";

                var json = JSON.parse(xhr.responseText);

                if (!json.success) {
                    swal("Error!", json.reason, "error");
                    return;
                }

                rendered = 0;
                multiSelection = null;
                renderListings(json);

                if (json.files.length !== 0) {
                    window.onscroll = function (ev) {
                        if ((window.innerHeight + window.pageYOffset) >= (document.body.offsetHeight * 0.8)) {
                            processListFiles(false, rendered);
                            window.onscroll = null;
                        }
                    };
                }
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
        else if (xhr.readyState < 4) {
            document.getElementById("loader-horizontal").style.display = "block";
        }
    };

    xhr.open('POST', 'process/goto');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("folderid=" + encodeURIComponent(id));
}

function dragEnd(event) {
    event.target.style.opacity = '1';
}

function dragStart(event) {
    event.dataTransfer.setData("Text", event.target.getAttribute('data-file-id') + "|" + event.target.getAttribute('data-folder-id'));
    event.target.style.opacity = '0.5';

    console.log(event.target.getAttribute('data-file-id') + "|" + event.target.getAttribute('data-folder-id'));
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    var data = event.dataTransfer.getData("Text");
    var res = data.split("|");

    if (res == "")
        return;

    if (res[0] !== "null" && res[0] !== "")
    {
        if (selection.length > 0)
        {
            var indexOf = Array.from(selection).map(x => x.id).indexOf(res[0]);

            if (indexOf !== -1) return processPaste(event.target.getAttribute('data-folder-id'));
        }

        processMovingFileToFolder(res[0], event.target.getAttribute('data-folder-id'));
    }

    if (res[1] !== "null" && res[1] !== "")
    {
        processMovingFolderToFolder(res[1], event.target.getAttribute('data-folder-id'));
    }
}

function hideFileViewer() {
    document.getElementById("file-viewer").style.display = "none";
    document.getElementById("file-viewer").innerHTML = "";
}

function processDownloadId(id)
{
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            document.getElementById("loader-horizontal").style.display = "none";
            if (xhr.status === 200 && xhr.status < 300) {
                document.getElementById("file-viewer").innerHTML = xhr.responseText;
                document.getElementById("file-viewer").style.display = "block";
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
        else if (xhr.readyState < 4) {
            document.getElementById("loader-horizontal").style.display = "block";
        }
    };

    xhr.open('POST', 'process/viewer');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("fileid=" + encodeURIComponent(id));
}

function addSelectionFile(index, id, splice = true, render = true)
{
    var indexOf = selection.findIndex((x) => x.id === id && x.type === 0);

    if (indexOf === -1)
    {
        selection.push({ id: id, type: 0 });
        multiSelection = index;
    }
    else if (splice)
    {
        selection.splice(indexOf, 1);
    }

    if (render)
        highlightCutBoard();
}

function selectFile(target)
{
    var fileEntries = document.getElementsByClassName("gridItem");

    var indexOf = Array.from(fileEntries).findIndex((x) => x.dataset["fileId"] === target.dataset["fileId"]);

    return addSelectionFile(indexOf, fileEntries[indexOf].dataset["fileId"]);
}

function multiSelectFile(target)
{
    var fileEntries = document.getElementsByClassName("gridItem");

    if (multiSelection === null)
    {
        resetCutBoard();

        selectFile(target);
    }
    else if (multiSelection !== null)
    {
        var indexOf = Array.from(fileEntries).findIndex((x) => x.dataset["fileId"] === target.dataset["fileId"]);

        var range =
        {
            start: Math.min(multiSelection, indexOf),
            end: Math.max(multiSelection, indexOf)
        };

        for (var i = range.start; i <= range.end; i++)
            addSelectionFile(indexOf, fileEntries[i].dataset["fileId"], false, false);

        highlightCutBoard();
        multiSelection = null;
    }
}

function addSelectionFolder(index, id, splice = true, render = true) {
    var indexOf = selection.findIndex((x) => x.id === id && x.type === 1);

    if (indexOf === -1) selection.push({ id: id, type: 1 });
    else if (splice) selection.splice(indexOf, 1);

    if (render) highlightCutBoard();
}

function selectFolder(target) {
    var folderEntries = document.getElementsByClassName("gridItem-folder");

    var indexOf = Array.from(folderEntries).findIndex((x) => x.dataset["folderId"] === target.dataset["folderId"]);

    return addSelectionFolder(indexOf, folderEntries[indexOf].dataset["folderId"]);
}

function processDownload(event)
{
    if (event.shiftKey) return multiSelectFile(event.target);
    if (event.ctrlKey || event.metaKey) return selectFile(event.target);

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            document.getElementById("loader-horizontal").style.display = "none";
            if (xhr.status === 200 && xhr.status < 300) {
                document.getElementById("file-viewer").innerHTML = xhr.responseText;
                document.getElementById("file-viewer").style.display = "block";
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
        else if (xhr.readyState < 4) {
            document.getElementById("loader-horizontal").style.display = "block";
        }
    };

    xhr.open('POST', 'process/viewer');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("fileid="
        + encodeURIComponent(event.target.getAttribute('data-file-id')));
}

function showSearch(term = null, callback)
{
    var fileViewer = document.getElementById("file-viewer");

    if (fileViewer.style.display !== "block")
    {
        fileViewer.innerHTML
            = `<input type="text" id="search-box" name="search-box" autofocus placeholder="Search">
           <div id="close-button" onclick="document.getElementById('file-viewer').style.display = 'none'"></div>
           <div id="search-content"></div>`;

        fileViewer.style.display = "block";
    }
    
    var searchBox = document.getElementById("search-box");
    var searchTerm = searchBox.value.trim();

    if (term !== null)
    {
        searchBox.value = term;
        processSearchQuery(null, callback);
    }

    searchBox.focus();
    searchBox.onkeyup = processSearchQuery;
}

function processSearchQuery(event, callback)
{
    var searchBox = document.getElementById("search-box");
    var searchTerm = searchBox.value.trim();

    if (searchTerm === "") return;
    if (event !== null && event.keyCode === 32) return;

    var xhr = new XMLHttpRequest();
    var searchContent = document.getElementById("search-content");

    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === 4) {
            document.getElementById("loader-horizontal").style.display = "none";

            if (xhr.status === 200 && xhr.status < 300)
            {
                var json = JSON.parse(xhr.responseText);

                if (!json.success) {
                    swal("Error!", json.reason, "error");
                    return;
                }

                searchContent.innerHTML = ``;

                if (event !== null && event.keyCode === 13) {
                    if (json.folders.length > 0)
                    {
                        processMoveId(json.folders[0].id);
                        return;
                    }
                    else if (json.files.length > 0)
                    {
                        processDownloadId(json.files[0].id);
                        return;
                    }
                }

                for (i in json.folders) {
                    var folder = json.folders[i];

                    searchContent.insertAdjacentHTML("beforeend",
                        `<div class='gridItem'
                        data-folder-id='${folder.id}'
                        data-folder-title='${folder.name}'
                        data-folder-shared='${folder.isSharing}'
                        data-folder-share='${folder.shareId}'
                        oncontextmenu="contextMenuFolder(event)"
                        onclick='processMoveId(${folder.id})'>

                        <div class="grid-file-icon"
                            data-folder-id="${folder.id}"
                            data-folder-title="${folder.name}"
                            style="background-image: url('${folder.icon}'); background-size: 24px;"></div>

                        <p class="grid-file-text" data-folder-title="${folder.name}" data-folder-id="${folder.id}">${folder.name}</p>
                    </div>`);
                }

                for (i in json.files) {
                    var file = json.files[i];

                    searchContent.insertAdjacentHTML("beforeend",
                        `<div class='gridItem'
                        data-file-id='${file.id}'
                        data-file-title='${file.name}'
                        data-file-shared='${file.isSharing}'
                        data-file-share='${file.shareId}'
                        oncontextmenu="contextMenuFile(event)"
                        onclick='processDownload(event)'>

                        <div class="grid-file-icon"
                            data-file-title="${file.name}"
                            data-file-id="${file.id}" 
                            style="background-image: url('${file.icon}');"></div>
                        <p class="grid-file-text" data-file-title="${file.name}" data-file-id="${file.id}">${file.name}</p>
                        <p class="grid-text-right" data-file-title="${file.name}" data-file-id="${file.id}">${file.date} (${file.size}) ${file.isSharing ? "(S)" : ""}</p>
                    </div>`);
                }

                highlightCutBoard();

                if (callback !== undefined)
                    callback();
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
        else if (xhr.readyState < 4) {
            document.getElementById("loader-horizontal").style.display = "block";
        }
    };

    xhr.open('POST', 'process/search');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("term=" + encodeURIComponent(searchTerm));
}

function processSharedViewer(fileId, folderId, shareId) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            document.getElementById("loader-horizontal").style.display = "none";
            if (xhr.status === 200 && xhr.status < 300) {
                document.getElementById("file-viewer").innerHTML = xhr.responseText;
                document.getElementById("file-viewer").style.display = "block";
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
        else if (xhr.readyState < 4) {
            document.getElementById("loader-horizontal").style.display = "block";
        }
    };

    xhr.open('POST', '../../share/viewer');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("fileId=" + encodeURIComponent(fileId)
        + "&folderId=" + encodeURIComponent(folderId)
        + "&shareId=" + encodeURIComponent(shareId));
}

function renderSharedFiles(json) {
    var elem = document.getElementById('file-listing');

    if (json.files.length > 0) {
        elem.style.display = "block";
    }

    for (i in json.files) {
        var file = json.files[i];

        elem.insertAdjacentHTML("beforeend",
            `<div class='gridItem-file'
                data-file-id='${file.id}'
                data-file-title='${file.name}'
                onclick='processSharedViewer(${file.id}, ${file.folder}, "${json.shareId}")'>

            <div class="grid-file-icon" style="background-image: url('../../${file.icon}');"></div>
            <p class="grid-text">${file.name}</p>
            <p class="grid-text-right">${file.date} (${file.size})</p>
            </div>`);
    }

    rendered += json.files.length;
}

function processSharedSortBy(folderId, shareId, value) {
    createCookie(".vault.sortby", value, "Thu, 01 Jan 2099 00:00:01 GMT;", "/");
    processSharedListFiles(folderId, shareId);
}

function renderSharedListings(json) {
    var folderListing = document.getElementById('folder-listing');
    var fileListing = document.getElementById('file-listing');

    folderListing.innerHTML = "";
    fileListing.style.display = "none";

    if (json.sort === 0) json.sort = 4;

    fileListing.innerHTML =
        `<div id="sort-box">
	    <a class="sorting-option-left" onclick="processSharedSortBy('${json.sharedFolder}', '${json.shareId}', ${json.sort >= 0 ? "2" : "-2"})" 
        style="margin-right: 5px; ${Math.abs(json.sort) === 2 ? "font-weight: 600;" : ""}">Name</a>

	    <img id="${json.sort >= 0 ? "sorting-arrow" : "sorting-arrow-down"}" 
            onclick="processSharedSortBy('${json.sharedFolder}', '${json.shareId}', ${-json.sort})" src="../../images/ui/arrow.svg">

        <a class="sorting-option" onclick="processSharedSortBy('${json.sharedFolder}', '${json.shareId}', ${json.sort >= 0 ? "1" : "-1"})" 
        style="margin-right: 10px; ${Math.abs(json.sort) === 1 ? "font-weight: 600;" : ""}">Size</a>

	    <a class="sorting-option" onclick="processSharedSortBy('${json.sharedFolder}', '${json.shareId}', ${json.sort >= 0 ? "3" : "-3"})"
        style="margin-right: 36px; ${Math.abs(json.sort) === 3 ? "font-weight: 600;" : ""}">Date</a>

	    <a class="sorting-option" onclick="processSharedSortBy('${json.sharedFolder}', '${json.shareId}', ${json.sort >= 0 ? "4" : "-4"})" 
        style="margin-right: 36px; ${Math.abs(json.sort) === 4 ? "font-weight: 600;" : ""}">Type</a>
    </div>`;

    if (!json.isHome) {
        folderListing.insertAdjacentHTML("beforeend",
            `<div class='gridItem-folder'
                data-folder-id='${json.previous}'
                onclick='processSharedListFiles(${json.previous}, "${json.shareId}")'>

                <div class="grid-icon" style="background-image: url('../../images/file/folder-icon.svg');background-size: 24px;"></div>
                <p class="grid-folder-text">...</p>
            </div>`);
    }

    for (i in json.folders) {
        var folder = json.folders[i];

        folderListing.insertAdjacentHTML("beforeend",
            `<div class='gridItem-folder'
                data-folder-id='${folder.id}'
                data-folder-title='${folder.name}'
                onclick='processSharedListFiles(${folder.id}, "${json.shareId}")'>

                <div class="grid-icon" style="background-image: url('../../${folder.icon}'); background-size: 24px;"></div>
                <p class="grid-folder-text">${folder.name}</p>
            </div>`);
    }

    renderSharedFiles(json);
}

function processSharedListFiles(folderId, shareId, reset = true, offset = 0) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200 && xmlhttp.status < 300) {
                document.getElementById("loader-horizontal").style.display = "none";

                var json = JSON.parse(xmlhttp.responseText);

                if (!json.success) {
                    swal("Error!", json.reason, "error");
                    return;
                }

                document.getElementById("download-form").action = `../../share/folder/dl/${folderId}/${shareId}`;

                if (reset) {
                    rendered = 0;
                    renderSharedListings(json);
                }
                else renderSharedFiles(json);

                if (json.files.length !== 0) {
                    window.onscroll = function (ev) {
                        if ((window.innerHeight + window.pageYOffset) >= (document.body.offsetHeight * 0.8)) {
                            processSharedListFiles(folderId, shareId, false, rendered);
                            window.onscroll = null;
                        }
                    };
                }
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
        else if (xmlhttp.readyState < 4) {
            document.getElementById("loader-horizontal").style.display = "block";
        }
    };

    xmlhttp.open("POST", "../../share/list", true);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.send("offset=" + offset + "&shareId=" + shareId + "&folderId=" + folderId);
}