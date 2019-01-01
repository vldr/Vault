var fadeOutTimer;
var rendered = 0;

const connection = new signalR.HubConnectionBuilder().withUrl("/manager/notifications").configureLogging(signalR.LogLevel.Information).build();

connection.on("UpdateListing", () => { processListFiles(); });

connection.start().catch(function (err)
{
    return console.error(err.toString());
});

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

function enableDarkMode()
{
    if (document.cookie.indexOf(".vault.nightmode") !== -1) document.cookie = ".vault.nightmode=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    else createCookie(".vault.nightmode", "1");

    document.location.reload(true);
}

function renderFiles(json)
{
    var elem = document.getElementById('file-listing');

    if (json.files.length > 0)
        elem.style.display = "block";

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
    fileListingElem.innerHTML = "";
    fileListingElem.style.display = "none";

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
    var loadingTimer;

    xmlhttp.onreadystatechange = function ()
    {
        loadingTimer = setTimeout(function ()
        {
            if (xmlhttp.readyState < 4)
            {
                swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });
            }
        }, 200);

        if (xmlhttp.readyState === 4)
        {
            if (xmlhttp.status === 200 && xmlhttp.status < 300)
            {
                clearTimeout(loadingTimer);

                var json = JSON.parse(xmlhttp.responseText);

                if (!json.success) {
                    swal("Error!", json.reason, "error");
                    return;
                }

                if (json.isHome && json.total === 0 && json.folders.length === 0)
                {
                    document.getElementById("file-listing").innerHTML = "";
                    document.getElementById("file-listing").style.display = "none";
                    document.getElementById("folder-listing").innerHTML = `<center>
                        <img style="max-width:100%;max-height:100%;" src="/manager/images/ui/wind.png" />
                    </center>`;

                    return;
                }

                if (reset)
                {
                    rendered = 0;
                    renderListings(json);
                }
                else renderFiles(json);

                if ((json.total - rendered) > 0)
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

    menuOptions.innerHTML = `<li class="menu-option" data-file-id="${fileId}" onclick="processDownload(event)">Download</li>`
        + `<li class="menu-option" data-file-id="${fileId}" onclick="processRenameFile(event)">Rename</li>`
        + `<li class="menu-option" onclick="processShareFile(${fileId})">Share</li>`
        + `<li class="menu-option" onclick="processDelete(${fileId})">Delete</li>`;
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
    
    if (checkBox.checked === true)
        xhr.send("fileid=" + id + "&option=1");
    else
        xhr.send("fileid=" + id + "&option=0");

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
                        //processListFiles();
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
                        //processListFiles();
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

                    //processListFiles();

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

function processSortBy(sortby) {
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
    if (event.target.getAttribute('data-delete') === "1")
        return;

	var str = event.target.getAttribute('data-folder-id');
    var xhr = new XMLHttpRequest();
	
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300)
            {
                var json = JSON.parse(xhr.responseText);

                if (!json.success)
                {
                    swal("Error!", json.reason, "error");
                    return;
                }

                rendered = 0;
                renderListings(json);

                if ((json.total - rendered) > 0) {
                    window.onscroll = function (ev) {
                        if ((window.innerHeight + window.pageYOffset) >= (document.body.offsetHeight * 0.8)) {
                            processListFiles(false, rendered);
                            window.onscroll = null;
                        }
                    };
                }
            }
            else
            {
				swal("Error!", "Failed to connect!", "error");
			}
        } 
    }

    xhr.open('POST', '/manager/process/goto');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("folderid=" + str);

}

function viewImageShared(id)
{
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === 4)
        {
            if (xhr.status === 200 && xhr.status < 300)
            {
                window.URL = window.URL || window.webkitURL;

                var blob = new Blob([xhr.response], { type: "octet/stream" });
                var blobObj = window.webkitURL.createObjectURL(blob);
                var shareBox = document.getElementById("share-box");

                shareBox.innerHTML = `<img src="${blobObj}" class="image-preview" />`;
            }
            else
            {
                swal("Error!", "Failed to connect!", "error");
            }
        }
    }

    xhr.open('POST', `/manager/share/${id}`);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("x-preview", "true");
    xhr.responseType = 'arraybuffer';
    xhr.overrideMimeType("text/plain; charset=x-user-defined");
    xhr.send();
}

function viewImage(event)
{
    if (event.target.getAttribute('data-delete') === "1")
        return;

	var xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
    } else {
        throw new Error("Ajax is not supported by this browser");
    }
	
	var captionText = document.getElementById("captionTag");
	var modal = document.getElementById('myModal');
	var modalImg = document.getElementById("imgObject");
	var modelLoading = document.getElementById("modelLoading");
	
	modal.style.display = "block";
	modelLoading.style.display = "block";
	modalImg.style.display = "none";
	captionText.style.display = "none";

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300) {
				window.URL = window.URL || window.webkitURL;
				
				var blob = new Blob([xhr.response], {type: "octet/stream"});
				var blobObj = window.webkitURL.createObjectURL(blob);
				
				modelLoading.style.display = "none";
				captionText.style.display = "block";
				modalImg.style.display = "block";
				modalImg.src = window.URL.createObjectURL(blob);
                captionText.innerHTML = "<h1 style='word-wrap: break-word;color:white;font-size:50px;'>" + xhr.getResponseHeader("x-filename").substring(0, 24)
                    + (xhr.getResponseHeader("x-filename").length > 24 ? "..." : "") + "</h1>" +
                    `<a id="dl-img" href="/manager/process/download/${event.target.getAttribute('data-file-id')}" class="btn black">Download</a><br><br>` + 
							"<br>";
				
				var dl = document.getElementById("dl-img");
                dl.download = xhr.getResponseHeader("x-filename");
            }
			else {
				swal("Error!", "Failed to connect!", "error");
			}
        } 
    }
	
	document.getElementById("progressbar").value = 0;	
	
	var started_at = new Date();
	xhr.onprogress = function(evt) {
        if (evt.lengthComputable) {
			var percentComplete = (evt.loaded / evt.total) * 100;  
			if (percentComplete !== 0){
				document.getElementById("progressbar").value = percentComplete;		
			}
		} 
	}
	
    xhr.open('GET', "/manager/process/download/" + event.target.getAttribute('data-file-id'));
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("x-preview", "true");
	xhr.responseType = 'arraybuffer';
	xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
    xhr.send();
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

function processDownload(event)
{
    if (event.target.getAttribute('data-delete') === "1")
        return;

    window.location.href = "/manager/process/download/" + event.target.getAttribute('data-file-id');
}