$.widget("wde.pid_control", {
	options: {
		id: 0,
		name: "___",
		setpoint: 67,
		kp: 64,
		ki: 65,
		kd: 66
	},

	_create: function() {
		var mydiv = this.element;
		var _id = this.options.id;
		var _setpoint = this.options.setpoint;
		var _name = this.options.name;
		
		mydiv.addClass('pid-widget');
		
		
		var content = '<div style="float: left; width: 220px;">'
		
		content += '<div>';
		content += '<input type="button" value="" class="icon-equal" style="float: left;" />';
		content += '<input type="button" value="" id="pid-widget_'+ _id +'_showstats" class="icon-stats" style="float: right;" />';
		content += '<div style="text-align: center; margin-bottom: 5px; font-size: 1.5em; font-weight: bold;">'+ _name +'</div>';
		content += '</div>';
		//mydiv.append(content);
			
			
		content += '<div class="_dial">';
		content += '<input type="text" value="15" id="pid-widget_'+ _id +'_dial" />';
		content += '</div>';
		//mydiv.append(content);

		content += '<div class="hr"></div>';
		content += '<div class="data_left"><span>TEMPERATURE</span><br /><span id="pid-widget_'+ _id +'_pv">69.5 &deg;C</span></div>';
		content += '<div class="data_right"><span>SETPOINT</span><br /><span id="pid-widget_'+ _id +'_sp">77.0 &deg;C</span></div>';
		content += '<div class="vr"></div>';
		content += '<div class="clear-both"></div>';
		//mydiv.append(content);
		
		content += '<div class="hr"></div>';
		content += '<div class="data_left"><span>OUTPUT</span><br /><span id="pid-widget_'+ _id +'_out">69.5 &deg;C</span></div>';
		content += '<div class="data_right"><span></span><br /><span></span></div>';
		content += '<div class="vr"></div>';
		content += '<div class="clear-both"></div>';
		
		content += '</div>';
		content += '<div id="pid-widget_'+ _id +'_stats" style="float: left; display: none; width: 618px;">STATS</div>';
		mydiv.append(content);
		

		$("#pid-widget_"+ _id +"_dial").knob({
			step: 0.1,
			angleArc: 300,
			angleOffset: 210,
			fgColor: '#75c53c',
			format: function(v) { return v.toFixed(1) /*+ '°C';*/ },
			release: function(v) {
					//console.log(parseInt(v*100));
					var strCMD = String.fromCharCode(65) + String.fromCharCode(_setpoint) + parseInt(v*100) + String.fromCharCode(13);
					//console.log(strCMD);
					socket.emit('sendcmd', strCMD);
			
			}
		});			
		
		$('#pid-widget_'+ _id +'_showstats').on('click', function() {
			$('#pid-widget_'+ _id +'_stats').toggle(399);
		});
		
		socket.on('serialEvent', function (data) {
		// {"t":"pid","id":"1","sp":"    0.00","pv":"  968.00","out":"    0.00"}
		
			if (data.t == "pid" && data.id == _id) {
				// set corresponding divs
				var pv = (0.01*parseFloat(data.pv)).toFixed(1);
				$('#pid-widget_'+ _id +'_pv').html(pv + '&deg;C');
				
				var sp = (0.01*parseFloat(data.sp)).toFixed(1);
				$('#pid-widget_'+ _id +'_sp').html(sp + '&deg;C');
				
				var out = parseInt(data.out);
				$('#pid-widget_'+ _id +'_out').html(out + '%');
				
				
				/*
				if (!($("#pid-widget_"+ _id +"_dial").val() == sp)) {
					$("#pid-widget_"+ _id +"_dial").val(sp).trigger('change');
				};
				*/
			}
		});
	
	}
});