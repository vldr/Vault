function updateList()
{
	var xmlhttp;
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
		if (xmlhttp.readyState === 4) {
			if (xmlhttp.status == 200 && xmlhttp.status < 300) {
				document.getElementById("myfiles").innerHTML=xmlhttp.responseText;
			}
		}
	}
		
	xmlhttp.open("GET","Process/process_filelist.php",true);
	xmlhttp.send();
}

$(document).ready(function() {
    $('#output').show();

    var options = {
        target: '#output',
        beforeSubmit: beforeSubmit,
        success: afterSuccess,
        uploadProgress: OnProgress,
        resetForm: true
    };

    $('#uploadForm').submit(function() {
        $(this).ajaxSubmit(options);

        return false;
    });

    function afterSuccess() {
        $('#submit-btn').show();
		$('#ok').fadeTo( "slow", 1 );
        $('#output').delay(1000).fadeOut();
		updateList();
    }

    function beforeSubmit() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {

            if (!$('#FileInput').val()) {
                $("#output").html("Please select a file.");
                return false
            }

            var fsize = $('#FileInput')[0].files[0].size;
            var ftype = $('#FileInput')[0].files[0].type;

            $('#submit-btn').hide();
        } else {
            $("#output").html("Please upgrade your browser, because your current browser lacks some new features we need! ");
            return false;
        }
    }

    function OnProgress(event, position, total, percentComplete) {
        $('#output').show();
        $('#output').html("" + percentComplete + '%');
    }
	
    function bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Bytes';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

});