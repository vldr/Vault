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

function processListFiles()
{
	var xmlhttp;
	var timer = null;
	if (window.XMLHttpRequest)
	{
		xmlhttp=new XMLHttpRequest();
	}
	else
	{
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
		
	xmlhttp.onreadystatechange=function()
	{
		
		timer = setTimeout(function() {
			if (xmlhttp.readyState < 4) {
                document.getElementById("myfiles").innerHTML = `<br><br><br><br><center><img src="/manager/images/ui/loading.gif" style="border-radius: 20px;"></center>`;	
			}
		}, 200);
		
		
		if (xmlhttp.readyState === 4) {
			if (xmlhttp.status === 200 && xmlhttp.status < 300) {
				clearTimeout(timer);
				document.getElementById("myfiles").innerHTML = xmlhttp.responseText;
				$('.gridItem').addClass('launch');
			}
		}
	}
		
	xmlhttp.open("POST", "process/list", true);
	xmlhttp.send();
}

function processListFilesFirst()
{
	var xmlhttp;
	var timer = null;
	if (window.XMLHttpRequest)
	{
		xmlhttp=new XMLHttpRequest();
	}
	else
	{
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
		
	xmlhttp.onreadystatechange=function()
	{
		
		timer = setTimeout(function() {
			if (xmlhttp.readyState < 4) {
                document.getElementById("myfiles").innerHTML = `<br><br><br><br><center><img src="/manager/images/ui/loading.gif" style="border-radius: 20px;"></center>`;	
			}
		}, 200);
		
		
		if (xmlhttp.readyState === 4) {
			if (xmlhttp.status === 200 && xmlhttp.status < 300) {
				clearTimeout(timer);
				document.getElementById("myfiles").innerHTML = xmlhttp.responseText;
				$('.gridItem').addClass('launch');
			}
		}
	}
		
    xmlhttp.open("POST", "process/list", true);
	xmlhttp.send();
}

function processListFilesSilent()
{
	var xmlhttp;
	var timer = null;
	if (window.XMLHttpRequest)
	{
		xmlhttp=new XMLHttpRequest();
	}
	else
	{
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
		
	xmlhttp.onreadystatechange=function()
	{
		
		timer = setTimeout(function() {
			if (xmlhttp.readyState < 4) {
                document.getElementById("myfiles").innerHTML = `<br><br><br><br><center><img src="/manager/images/ui/loading.gif" style="border-radius: 20px;"></center>`;		
			}
		}, 200);
		
		
		if (xmlhttp.readyState === 4) {
			if (xmlhttp.status === 200 && xmlhttp.status < 300) {
				clearTimeout(timer);
				document.getElementById("myfiles").innerHTML = xmlhttp.responseText;
			}
		}
	}
		
    xmlhttp.open("POST", "/manager/process/list", true);
	xmlhttp.send();
}

function processDelete(str) {
	swal({
        title: "Are you sure?",
        text: "You will not be able to recover this file ever!",
        type: "warning",
        showCancelButton: true,
        dangerMode: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
	},
	function(){
		var xhr;
		if (window.XMLHttpRequest) {
			xhr = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			xhr = new ActiveXObject("Msxml2.XMLHTTP");
		} else {
			throw new Error("Ajax is not supported by this browser");
		}

		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200 && xhr.status < 300) {
					if (xhr.responseText.trim() === "0") {
						swal("Error!", "Transaction error!", "error");
					} else if (xhr.responseText.trim() === "2") {
						swal("Error!", "Failed to connect to master server.", "error");
					} else if (xhr.responseText.trim() === "1")  {
						swal({title: "Deleted!", text: "The file has been deleted!", type: "success", timer: 700, showConfirmButton: false});
					}
					
					processListFilesSilent();
				}
			}
		}

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
        + `<li class="menu-option" data-folder-id="${folderId}" onclick="processDeleteFolder(event)">Delete</li>`
        + `<li class="menu-option-color-picker">
                <div onclick="processFolderColour(${folderId}, 0)" class="color-circle orange"></div>
                <div onclick="processFolderColour(${folderId}, 1)" class="color-circle purple"></div>
                <div onclick="processFolderColour(${folderId}, 2)" class="color-circle green"></div>
                <div onclick="processFolderColour(${folderId}, 3)" class="color-circle red"></div>
                <div onclick="processFolderColour(${folderId}, 4)" class="color-circle blue"></div>
            </li>`;   
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
        + `<li class="menu-option" data-file-id="${fileId}" onclick="processShareFile(event)">Share</li>`
        + `<li class="menu-option" onclick="processDelete(${fileId})">Delete</li>`;
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
        animation: "pop",
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
                    if (xhr.responseText.trim() === "1") { processListFilesSilent(); swal.close(); }
                    else if (xhr.responseText.trim() === "0")
                        swal({ title: "Error!", text: "Error! Make sure everything is correct...", type: "error", timer: 1500, showConfirmButton: false });
                }
            }
        }

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
        animation: "pop",
        inputPlaceholder: "John's Folder"
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

                if (xhr.status === 200 && xhr.status < 300) {
                    if (xhr.responseText.trim() === "1") { processListFilesSilent(); swal.close(); }
                    else if (xhr.responseText.trim() === "0")
                        swal({ title: "Error!", text: "Error! Make sure everything is correct...", type: "error", timer: 1500, showConfirmButton: false });
                }
            }
        }

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
        showCancelButton: true,
        dangerMode: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
	},
	function(){
		var xhr;
		if (window.XMLHttpRequest) {
			xhr = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			xhr = new ActiveXObject("Msxml2.XMLHTTP");
		} else {
			throw new Error("Ajax is not supported by this browser");
		}

		xhr.onreadystatechange = function() {
			if (xhr.readyState < 4)                         // while waiting response from server
				swal({title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false});
			else if (xhr.readyState === 4) {
				if (xhr.status === 200 && xhr.status < 300) {
					if (xhr.responseText.trim() === "0") {
						swal("Error!", "Transaction error!", "error");
					} else if (xhr.responseText.trim() === "2") {
						swal("Error!", "Failed to connect to master server.", "error");
					} else if (xhr.responseText.trim() === "1")  {
						swal({title: "Deleted!", text: "The folder has been deleted!", type: "success", timer: 700, showConfirmButton: false});
					}
					
					processListFilesSilent();
					
				}
			}
		}

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
        animation: "pop",
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
            animation: "pop",
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
                if (xhr.readyState === 4) {
                    swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });
                    if (xhr.status === 200 && xhr.status < 300) {
                        if (xhr.responseText.trim() === "1")
                            swal({ title: "Success!", text: "Your password was changed!", type: "success", timer: 1500, showConfirmButton: false });
                        else if (xhr.responseText.trim() === "0")
                            swal({ title: "Error!", text: "Error! Make sure everything is correct...", type: "error", timer: 1500, showConfirmButton: false }, processChangePassword);
                    }
                }
            }

            xhr.open('POST', '/manager/process/changepassword');
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send("currentPassword=" + currentPassword + "&newPassword=" + newPassword);
        });
    });
}

function processFolderColour(id, colour) {
    var xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
    } else {
        throw new Error("Ajax is not supported by this browser");
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300) {
                if (xhr.responseText.trim() === "1") { processListFilesSilent(); }
                else if (xhr.responseText.trim() === "0")
                    swal({ title: "Error!", text: "Something went wrong! Error!", type: "error", timer: 1000, showConfirmButton: false });
            }
        }
    }

    xhr.open('POST', '/manager/process/setcolour');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("folderid=" + id + "&colour=" + colour);
}

function processSortBy(sortby) {
    var xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
    } else {
        throw new Error("Ajax is not supported by this browser");
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4)
        {
            swal({ title: "", html: true, text: "<center><div class=\"loader\"></div></center><br><br>", showConfirmButton: false });
            if (xhr.status === 200 && xhr.status < 300) {
                if (xhr.responseText.trim() === "1") { processListFilesSilent(); swal.close(); }
                else if (xhr.responseText.trim() === "0")
                    swal({ title: "Error!", text: "Something went wrong! Error!", type: "error", timer: 1000, showConfirmButton: false });
            }
        }
    }

    xhr.open('POST', '/manager/process/sortby');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("sortby=" + sortby);
}

function processRegister(str, str2, str3, str4)
{
    var xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
    } else {
        throw new Error("Ajax is not supported by this browser");
    }

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            document.getElementById('txtHint').innerHTML = "Loading...<br><br>";
            if (xhr.status === 200 && xhr.status < 300) {
                if (xhr.responseText.trim() === "1")
					window.location = "/";
                else if (xhr.responseText.trim() === "2")
                    document.getElementById('txtHint').innerHTML = "EMail already exists...<br><br>";
                else if (xhr.responseText.trim() === "3")
                    document.getElementById('txtHint').innerHTML = "Error!<br><br>";
                else if (xhr.responseText.trim() === "4")
                    document.getElementById('txtHint').innerHTML = "Password is too short!<br><br>";
                else if (xhr.responseText.trim() === "5")
                    document.getElementById('txtHint').innerHTML = "You're missing some information.<br><br>";
                else if (xhr.responseText.trim() === "6")
                    document.getElementById('txtHint').innerHTML = "Name is too short!<br><br>";
            }
        }
    }

    xhr.open('POST', '/manager/register');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("email=" + str + "&password=" + str2 + "&name=" + str3 + "&invite=" + str4);
}

function processLogin(str, str2) {

    var xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
    } else {
        throw new Error("Ajax is not supported by this browser");
    }

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300) {
                if (xhr.responseText.trim() === "1")
                {		
					document.getElementById("txtHint").style.color = "#000";
					document.getElementById('txtHint').innerHTML = "Logged in, successfully.<br><br>";
					
					window.location.href = "control";
                }
                else if (xhr.responseText.trim() === "3")
                {
                    document.getElementById('txtHint').innerHTML = "Incorrect credentials.<br><br>";
                }

            }
        }
    }

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

    var xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
    } else {
        throw new Error("Ajax is not supported by this browser");
    }

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300) {
                if (xhr.responseText.trim() === "0") {
                    swal("Error!", "Transaction error! Moving a file...", "error");
                } else if (xhr.responseText.trim() === "2") {
					swal("Error!", "Failed to connect to master server.", "error");
				}
				
				processListFilesSilent();
            }
        }
    }

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

    var xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
    } else {
        throw new Error("Ajax is not supported by this browser");
    }

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300) {
                if (xhr.responseText.trim() === "0") {
                    swal("Error!", "Transaction error! Moving a folder...", "error");
                } else if (xhr.responseText.trim() === "2") {
					swal("Error!", "Failed to connect to master server.", "error");
				}
				
				processListFilesSilent();
            }
        }
    }

    xhr.open('POST', '/manager/process/movefolder');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("from=" + str + "&to=" + str2);
}

function processFolderCreate() {
	
	swal
	({
		title: "What would like to name it?",
		text: null,
		type: "input",
		showCancelButton: true,
		closeOnConfirm: false,
		animation: "pop",
		inputPlaceholder: "Documents, Applications, et al."
	},
	function(inputValue){
		if (inputValue === false) return false;
		if (inputValue === "") {
			swal.showInputError("You need to write something!");
            return false;
		}
		
		var xhr;
		if (window.XMLHttpRequest) {
			xhr = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			xhr = new ActiveXObject("Msxml2.XMLHTTP");
		} else {
			throw new Error("Ajax is not supported by this browser");
		}

		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200 && xhr.status < 300) {
					
					if (xhr.responseText.trim() === "0") {
						swal("Error!", "Transaction error!", "error");
					} else if (xhr.responseText.trim() === "2") {
						swal("Error!", "Failed to connect to master server.", "error");
					} else if (xhr.responseText.trim() === "1") {
						swal.close();
					}
					
					processListFilesSilent();
				}
			}
		}

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

    var xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
    } else {
        throw new Error("Ajax is not supported by this browser");
    }
	
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.status < 300) {
				$('.gridItem').addClass('hidden');
				setTimeout(function(){ processListFiles(); }, 100);
            }
			else {
				swal("Error!", "Failed to connect!", "error");
			}
        } 
    }

    xhr.open('POST', '/manager/process/goto');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("folderid=" + str);

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
							'<a id="dl-img" href="' + blobObj + '" class="btn black">Download</a><br><br>' + 
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

function highLight(event) {
    event.preventDefault();
	document.body.style.transition = "box-shadow 0.3s ease-in-out";
	document.body.style.boxShadow = 'inset 0px 0px 49px 1px rgba(156,156,156,1)';
}

function deLight(event) {
    event.preventDefault();
	document.body.style.boxShadow = 'none';
}

function processDownload(event)
{
    if (event.target.getAttribute('data-delete') === "1")
        return;

    window.location.href = "/manager/process/download/" + event.target.getAttribute('data-file-id');
}