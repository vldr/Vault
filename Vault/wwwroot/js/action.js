var fadeOutTimer;
var rendered = 0;

function createCookie(name, value, expires, path, domain) {
	var cookie = name + "=" + escape(value) + ";";

	if (expires) {
		if(expires instanceof Date) {
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

function toggleDarkMode()
{
    if (document.cookie.indexOf(".vault.nightmode") !== -1) document.cookie = ".vault.nightmode=0;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    else createCookie(".vault.nightmode", "1");

    document.location.reload(true);
}

function renderFiles(json)
{
    var elem = document.getElementById('file-listing');

    if (json.files.length > 0)
    {
        elem.style.display = "block";
    }

    for (i in json.files)
    {
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
                onclick='${file.action}'
                draggable='true'>

            <div class="grid-file-icon" data-file-id="${file.id}" ondragstart="dragStart(event)" draggable="true" style="background-image: url('${file.icon}');"></div>
            <p class="grid-file-text" data-file-id="${file.id}">${file.name}</p>
            <p class="grid-text-right" data-file-id="${file.id}">${file.date} (${file.size})</p>
            </div>`);
    }

    rendered += json.files.length;
}

function renderListings(json, isSilent = false)
{
    var folderListingElem = document.getElementById('folder-listing');
    var fileListingElem = document.getElementById('file-listing');

    folderListingElem.innerHTML = "";
    fileListingElem.style.display = "none";

    if (json.sort === 0) json.sort = 4;

    fileListingElem.innerHTML =
        `<div id="sort-box">
	        <a class="sorting-option-left" onclick="processSortBy(${json.sort >= 0 ? "2" : "-2"})" 
            style="margin-right: 5px; ${Math.abs(json.sort) === 2 ? "font-weight: 600;" : ""}">Name</a>

	        <img id="${json.sort >= 0 ? "sorting-arrow" : "sorting-arrow-down"}" 
                onclick="processSortBy(${-json.sort})" src="/manager/images/ui/arrow.svg">

            <a class="sorting-option" onclick="processSortBy(${json.sort >= 0 ? "1" : "-1"})" 
            style="margin-right: 10px; ${Math.abs(json.sort) === 1 ? "font-weight: 600;" : ""}">Size</a>

	        <a class="sorting-option" onclick="processSortBy(${json.sort >= 0 ? "3" : "-3"})"
            style="margin-right: 36px; ${Math.abs(json.sort) === 3 ? "font-weight: 600;" : ""}">Date</a>

	        <a class="sorting-option" onclick="processSortBy(${json.sort >= 0 ? "4" : "-4"})" 
            style="margin-right: 36px; ${Math.abs(json.sort) === 4 ? "font-weight: 600;" : ""}">Type</a>
        </div>`;

    document.getElementById("folder-path").innerHTML = json.path;

    if (!json.isHome)
    {
        folderListingElem.insertAdjacentHTML("beforeend",
            `<div class="gridItem-folder" data-folder-id="${json.previous}"
                ondrop="drop(event)"
                onclick="processMove(event)"
                style="background-color: rgba(255, 255, 255, 0.27);">

            <div class="grid-icon" data-folder-id="${json.previous}"
                    ondragstart="dragStart(event)" draggable="true" 
                    style="background-image: url('/manager/images/folder-icon.png'); background-size: 24px;">
            </div>

            <p class="grid-text" data-folder-id="${json.previous}">...</p>
        </div>`);
    }

    for (i in json.folders)
    {
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
                onclick='processMove(event)'
                oncontextmenu="contextMenuFolder(event)"
                draggable='true'>

                <div class="grid-icon" data-folder-id="${folder.id}" ondragstart="dragStart(event)" draggable="true" 
                style="background-image: url('${folder.icon}'); background-size: 24px;"></div>

                <p class="grid-text" data-folder-id="${folder.id}">${folder.name.substring(0, 13)}</p>
            </div>`);
    }

    renderFiles(json);
}

function processListFiles(reset = true, offset = 0, callback)
{
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function ()
    {
        if (xmlhttp.readyState === 4)
        {
            if (xmlhttp.status === 200 && xmlhttp.status < 300)
            {
                document.getElementById("loader-horizontal").style.display = "none";

                var json = JSON.parse(xmlhttp.responseText);

                if (!json.success) {
                    swal("Error!", json.reason, "error");
                    return;
                }

                if (reset)
                {
                    rendered = 0;
                    renderListings(json);
                }
                else renderFiles(json);

                if (json.isHome && rendered === 0 && json.folders.length === 0)
                {
                    document.getElementById("file-listing").innerHTML = "";
                    document.getElementById("file-listing").style.display = "none";
                    document.getElementById("folder-listing").innerHTML = `<center>
                        <img style="max-width:100%;max-height:100%;" src="/manager/images/ui/wind.png" />
                    </center>`;

                    return;
                }

                if (json.files.length !== 0)
                {
                    window.onscroll = function (ev) {
                        if ((window.innerHeight + window.pageYOffset) >= (document.body.offsetHeight * 0.8)) {
                            processListFiles(false, rendered);
                            window.onscroll = null;
                        }
                    };
                }

                if (callback !== undefined)
                    callback();
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
        else if (xmlhttp.readyState < 4)
        {
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
    function ()
    {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 && xhr.status < 300)
                {
                    var json = JSON.parse(xhr.responseText);

                    if (json.success)
                        swal({ title: "Deleted!", text: "The file has been deleted!", type: "success", timer: 700, showConfirmButton: false });
                    else
                        swal("Error!", json.reason, "error");
                }
                else {
                    swal("Error!", "Failed to connect!", "error");
                }
            }
        };

        xhr.open('POST', '/manager/process/deletefile');
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send("file=" + str);
	});
}

function resetContextMenu()
{
    var menu = document.getElementById("context-menu");
    var menuOptions = document.getElementById("context-menu-options");
    menu.style.display = "none";
    menuOptions.innerHTML = "";
}

function contextMenuFolder(event)
{
    event.preventDefault();

    var menu = document.getElementById("context-menu");
    var menuOptions = document.getElementById("context-menu-options");

    menuOptions.innerHTML = "";

    const toggleMenu = command =>
    {
        menu.style.display = command === "show" ? "block" : "none";
    };

    const setPosition = ({ top, left }) =>
    {
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

    menuOptions.innerHTML = `<li class="menu-option" data-folder-id="${folderId}" onclick="processMove(event)">Open</li>`
        + `<li class="menu-option" data-folder-id="${folderId}" onclick="processRenameFolder(event)">Rename</li>`
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

function processDownloadFolder(id)
{
    window.location.href = "/manager/process/download/folder/" + id;
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

    menuOptions.innerHTML = `<li class="menu-option"
            onclick="location.href = '/manager/process/download/${fileId}'">Download</li>`
        + `<li class="menu-option" data-file-id="${fileId}" onclick="processRenameFile(event)">Rename</li>`
        + `<li class="menu-option" onclick="processShareFile(${fileId})">Share</li>`
        + `<li class="menu-option" onclick="processDelete(${fileId})">Delete</li>`;
}

function showLogout()
{
    swal({
        title: "Logout",
        html: true,
        animation: false,
        showConfirmButton: false,
        allowOutsideClick: true,
        text: `<a href="process/logout" class="btn">Logout</a>`
    });
}

function showSettings()
{
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4)
        {
            document.getElementById("loader-horizontal").style.display = "none";

            if (xhr.status === 200 && xhr.status < 300)
            {
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
        else if (xhr.readyState < 4)
        {
            document.getElementById("loader-horizontal").style.display = "block";
        }
    };

    xhr.open('POST', '/manager/settings');
    xhr.send();
}

function showSort()
{
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            document.getElementById("loader-horizontal").style.display = "none";
            if (xhr.status === 200 && xhr.status < 300) {
                swal({
                    title: "Sort",
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

    xhr.open('POST', '/manager/sort');
    xhr.send();
}

function showAbout()
{
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === 4) {
            document.getElementById("loader-horizontal").style.display = "none";
            if (xhr.status === 200 && xhr.status < 300)
            {
                swal({
                    title: "About",
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

    xhr.open('POST', '/manager/about');
    xhr.send();
}

function toggleAPI()
{
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === 4)
        {
            if (xhr.status === 200 && xhr.status < 300)
            {
                var json = JSON.parse(xhr.responseText);

                if (json.success)
                {
                    showSettings();
                }
                else
                    swal({ title: "Error!", text: json.reason, type: "error", timer: 1500, showConfirmButton: false });
            }
            else
            {
                swal("Error!", "Failed to connect!", "error");
            }
        }
        else if (xhr.readyState < 4) {
            swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });
        }
    };

    xhr.open('POST', '/manager/process/toggleapi');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send();
}

function processToggleFolderSharing(id)
{
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

    xhr.open('POST', '/manager/process/togglefoldershare');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("folderid=" + id);
}

function processToggleSharing(id)
{
    var checkBox = document.getElementById("share-checkbox-input");
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4)
        {
            swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });

            if (xhr.status === 200 && xhr.status < 300)
            {
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

    xhr.open('POST', '/manager/process/toggleshare');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("fileid=" + id);
}

function downloadShareX(apiKey)
{
    var text = `{"Name": "Vault", 
                "DestinationType": "ImageUploader, TextUploader, FileUploader",
                "RequestURL": "${location.protocol + "//" + location.hostname}/manager/share/upload",
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

function selectText()
{
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

function processShareFile(id)
{
    var isShared = document.querySelector(`[data-file-id='${id}']`).getAttribute("data-file-shared");
    var shareId = document.querySelector(`[data-file-id='${id}']`).getAttribute("data-file-share");
    
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
            <div id="share-box" class="share-box" onclick="selectText()">${location.protocol + "//" + location.hostname}/manager/share/${shareId}</div>
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
            <div id="share-box" class="share-box" onclick="selectText()">${location.protocol + "//" + location.hostname}/manager/share/folder/${shareId}</div>
            <br><br>`
                : `<label id="share-checkbox">Enable
                <input id="share-checkbox-input" type="checkbox" onclick="processToggleFolderSharing(${id})">
                <span class="checkmark"></span>
            </label>`)
    });
}

function processRenameFile(event)
{
    var id = event.target.getAttribute('data-file-id');
    var title = document.querySelector(`[data-file-id='${id}']`).getAttribute("data-file-title");

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

        xhr.onreadystatechange = function ()
        {
            if (xhr.readyState === 4)
            {
                swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });

                if (xhr.status === 200 && xhr.status < 300)
                {
                    var json = JSON.parse(xhr.responseText);

                    if (json.success)
                    {
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

        xhr.open('POST', '/manager/process/renamefile');
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send("fileid=" + id + "&newname=" + newName);
    });
}

function processRenameFolder(event)
{
    var id = event.target.getAttribute('data-folder-id');
    var title = document.querySelector(`[data-folder-id='${id}']`).getAttribute("data-folder-title");

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

        xhr.open('POST', '/manager/process/renamefolder');
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send("folderid=" + id + "&newname=" + newName);
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
	function(){
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState < 4)
                swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });
            else if (xhr.readyState === 4) {
                if (xhr.status === 200 && xhr.status < 300) {
                    var json = JSON.parse(xhr.responseText);

                    if (json.success) swal({ title: "Deleted!", text: "The folder has been deleted!", type: "success", timer: 700, showConfirmButton: false });
                    else
                        swal("Error!", json.reason, "error");
                }
                else {
                    swal("Error!", "Failed to connect!", "error");
                }
            }
        };

        xhr.open('POST', '/manager/process/deletefolder');
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send("folder=" + str);
		
		
	});
}

function processChangePassword()
{
    swal
    ({
        title: "Enter your current password...",
        text: null,
        type: "input",
        inputType: "password",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "fadein",
        inputPlaceholder: "Current Password"
    },
    function (currentPassword) 
    {
        if (currentPassword === false) return false;

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
            animation: "fadein",
            inputPlaceholder: "New Password"
        },
        function (newPassword)
        {
            if (newPassword === false) return false;

            if (newPassword === "") {
                swal.showInputError("You need to write something!");
                return false;
            }

            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4)
                {
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

            xhr.open('POST', '/manager/process/changepassword');
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send("currentPassword=" + currentPassword + "&newPassword=" + newPassword);
        });
    });
}

function processFolderColour(id, colour) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300)
            {
                var json = JSON.parse(xhr.responseText);
                if (!json.success) swal("Error!", json.reason, "error");
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
    };

    xhr.open('POST', '/manager/process/setcolour');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("folderid=" + id + "&colour=" + colour);
}

function processSortBy(sortby)
{
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });
            if (xhr.status === 200 && xhr.status < 300)
            {
                var json = JSON.parse(xhr.responseText);
                if (json.success) { swal.close(); }
                else swal("Error!", json.reason, "error");
            }
            else {
                swal("Error!", "Failed to connect!", "error");
            }
        }
    };

    xhr.open('POST', '/manager/process/sortby');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("sortby=" + sortby);
}

function processRegister(str, str2, str3, str4)
{
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === 4)
        {
            document.getElementById('txtHint').innerHTML = "Loading...<br><br>";

            if (xhr.status === 200 && xhr.status < 300)
            {
                var json = JSON.parse(xhr.responseText);

                if (json.success)
                    window.location = "/";
                else
                    document.getElementById('txtHint').innerHTML = `${json.reason}<br><br>`;
            }
            else
            {
                document.getElementById('txtHint').innerHTML = "Failed to connect!<br><br>";
            }
        }
    };

    xhr.open('POST', '/manager/register');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("email=" + str + "&password=" + str2 + "&name=" + str3 + "&invite=" + str4);
}

function processLogin(str, str2) {

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300)
            {
                var json = JSON.parse(xhr.responseText);

                if (json.success) window.location = "control";
                else document.getElementById('txtHint').innerHTML = `${json.reason}<br><br>`;
            }
            else
            {
                document.getElementById('txtHint').innerHTML = "Failed to connect!<br><br>";
            }
        }
    };

    xhr.open('POST', '/manager/login');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("email=" + str + "&password=" + str2);

}

function processMovingFileToFolder(str, str2)
{
    if (str2 === null)
    {
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

    xhr.open('POST', '/manager/process/movefile');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("file=" + str + "&folder=" + str2);
}

function processMovingFolderToFolder(str, str2)
{
    if (str === str2)
    {
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

    xhr.open('POST', '/manager/process/movefolder');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("from=" + str + "&to=" + str2);
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
	function(inputValue){
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

        xhr.open('POST', '/manager/process/newfolder');
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send("foldername=" + inputValue);
	});
}

function processMove(event)
{	
	var str = event.target.getAttribute('data-folder-id');
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300)
            {
                document.getElementById("loader-horizontal").style.display = "none";

                var json = JSON.parse(xhr.responseText);

                if (!json.success) {
                    swal("Error!", json.reason, "error");
                    return;
                }

                rendered = 0;
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

    xhr.open('POST', '/manager/process/goto');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("folderid=" + str);
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
	
	if ( res[0] !== "null" && res[0] !== "") {
		processMovingFileToFolder(res[0], event.target.getAttribute('data-folder-id'));
	}
	
	if ( res[1] !== "null" && res[1] !== "") {
        processMovingFolderToFolder(res[1], event.target.getAttribute('data-folder-id'));
	}
}

function hideFileViewer()
{
    document.getElementById("file-viewer").style.display = "none";
    document.getElementById("file-viewer").innerHTML = "";
}

function processDownload(event)
{
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === 4) {
            document.getElementById("loader-horizontal").style.display = "none";
            if (xhr.status === 200 && xhr.status < 300)
            {
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

    xhr.open('POST', '/manager/process/viewer');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("fileid=" + event.target.getAttribute('data-file-id'));
}

function processSharedViewer(fileId, folderId, shareId)
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

    xhr.open('POST', '/manager/share/viewer');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("fileId=" + fileId + "&folderId=" + folderId + "&shareId=" + shareId);
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

            <div class="grid-file-icon" style="background-image: url('${file.icon}');"></div>
            <p class="grid-text">${file.name}</p>
            <p class="grid-text-right">${file.date} (${file.size})</p>
            </div>`);
    }

    rendered += json.files.length;
}

function processSharedSortBy(folderId, shareId, value)
{
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
            onclick="processSharedSortBy('${json.sharedFolder}', '${json.shareId}', ${-json.sort})" src="/manager/images/ui/arrow.svg">

        <a class="sorting-option" onclick="processSharedSortBy('${json.sharedFolder}', '${json.shareId}', ${json.sort >= 0 ? "1" : "-1"})" 
        style="margin-right: 10px; ${Math.abs(json.sort) === 1 ? "font-weight: 600;" : ""}">Size</a>

	    <a class="sorting-option" onclick="processSharedSortBy('${json.sharedFolder}', '${json.shareId}', ${json.sort >= 0 ? "3" : "-3"})"
        style="margin-right: 36px; ${Math.abs(json.sort) === 3 ? "font-weight: 600;" : ""}">Date</a>

	    <a class="sorting-option" onclick="processSharedSortBy('${json.sharedFolder}', '${json.shareId}', ${json.sort >= 0 ? "4" : "-4"})" 
        style="margin-right: 36px; ${Math.abs(json.sort) === 4 ? "font-weight: 600;" : ""}">Type</a>
    </div>`;

    if (!json.isHome)
    {
        folderListing.insertAdjacentHTML("beforeend",
            `<div class='gridItem-folder'
                data-folder-id='${json.previous}'
                onclick='processSharedListFiles(${json.previous}, "${json.shareId}")'>

                <div class="grid-icon" style="background-image: url('/manager/images/folder-icon.png'); 
                background-size: 24px;"></div>

                <p class="grid-text">...</p>
            </div>`);
    }

    for (i in json.folders)
    {
        var folder = json.folders[i];

        folderListing.insertAdjacentHTML("beforeend",
            `<div class='gridItem-folder'
                data-folder-id='${folder.id}'
                data-folder-title='${folder.name}'
                onclick='processSharedListFiles(${folder.id}, "${json.shareId}")'>

                <div class="grid-icon" style="background-image: url('${folder.icon}'); 
                background-size: 24px;"></div>

                <p class="grid-text">${folder.name.substring(0, 13)}</p>
            </div>`);
    }

    renderSharedFiles(json);
}

function processSharedListFiles(folderId, shareId, reset = true, offset = 0) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function ()
    {
        if (xmlhttp.readyState === 4)
        {
            if (xmlhttp.status === 200 && xmlhttp.status < 300)
            {
                document.getElementById("loader-horizontal").style.display = "none";

                var json = JSON.parse(xmlhttp.responseText);

                if (!json.success) {
                    swal("Error!", json.reason, "error");
                    return;
                }

                document.getElementById("download-form").action = `/manager/share/folder/dl/${folderId}/${shareId}`;

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

    xmlhttp.open("POST", "/manager/share/list", true);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.send("offset=" + offset + "&shareId=" + shareId + "&folderId=" + folderId);
}
