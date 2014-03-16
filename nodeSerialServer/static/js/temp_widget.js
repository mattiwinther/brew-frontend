var json = [{"colorName": "red",
        "hexValue": "#f00" 
}, {
    "colorName": "green",
        "hexValue": "#0f0"
}, { "colorName": "blue",
        "hexValue": "#00f"
}, { "colorName": "cyan",
        "hexValue": "#0ff"
}, { "colorName": "magenta",
        "hexValue": "#f0f"
}, { "colorName": "yellow",
        "hexValue": "#ff0"
}, { "colorName": "black",
        "hexValue": "#000"
}];

function show(json) {
    var content = '<table id = "myTable" border = 1>';
    var counter;
    for (counter = 0; counter < json.length; counter++) {
        content += '<tr id =' + counter + ' class="edit_tr"><td class = "edit_td"><input type="text" value="' + json[counter].colorName + '" class="editbox"  id = "first_input_' + counter + '" /></td>'
        '</tr>';
    }
    content += '</table>';
    //$('body').append(content);
	document.write(content);
}

/*
$(document).on("click", ".edit_td", function () {
    $(".text").show().next("span").hide();
    $(this).find(".text").hide().next("span").show().find("input:text").focus();
});
*/

/*
$(document).on("focusout", function (event) {
    var $target = $(event.target);
    if ($target.closest("table").length == 0) {
        var $input = $("input:text:visible");
        var value = $input.val();
        $input.closest("td").find(".text").text(value).show();
        $input.parent().hide();
    }
});
*/


$(document).on("keyup", "input:text", function (e) {
    if (e.which === 13) {
        /*
		var value = $(this).val();
        $(this).closest("td").find(".text").html(value).show();
        $(this).parent().hide();
        return false;
		*/
		alert($(this).val());
    }
});

/*
socket.on('serialEvent', function (data) {
	$("#textDisplay").append(JSON.stringify(data));
	$("#textDisplay").append("\n");
	
	var psconsole = $('#textDisplay');
	psconsole.scrollTop(psconsole[0].scrollHeight - psconsole.height());
});
*/

$.widget("wde.sensorlist", {
	_create: function() {
	var mydiv = this.element;
		
		socket.on('serialEvent', function (data) {
			if (data.t == "da") {
				mydiv.text("PID DATA ARRAY OK");

				var content = '<table id="'+ mydiv.attr('id') +'_table" border="1">';
				
				content += '<tr>';
				content += '<td>Id</td>';
				content += '<td>Name</td>';
				content += '<td>Temp</td>';
				content += '<td>Address</td>';
				content += '</tr>';
				
				var counter;
				for (counter = 0; counter < data.v.length; counter++) {
					content += '<tr>';
					content += '<td>' + data.v[counter].id + '</td>';
					content += '<td><input type="text" value="' + data.v[counter].name + '" /></td>';
					content += '<td>' + data.v[counter].temp + '</td>';
					content += '<td>' + data.v[counter].address + '</td>';
					content += '</tr>';
				}
				content += '</table>';

				mydiv.html(content);
			};
			
		});

	}
});