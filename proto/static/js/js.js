var active_line = 1;
var is_editing = false;
var mode = 0;

function parse_and_ornament(string){
	var parsed_string='';
	var check_chars = ['^'];
	
	var this_char = string[0];
	string = string.slice(1);
	
	while(string.length > 0){	
		//check if the character is a check character
		if(check_chars.indexOf(this_char)>-1){
			if(this_char == '^'){
				parsed_string+='<sup>';
				var test_char = string[0];
				string = string.slice(1);
				while(!isNaN(test_char)){
					parsed_string+=test_char;
					test_char = string[0];
					string = string.slice(1);
				}
				parsed_string+='</sup>';
				if(string.length == 0){
					return parsed_string;
				}else{
					parsed_string+=test_char;
				}
			}
		}else{
			parsed_string+=this_char;
		}
		this_char = string[0];
		string = string.slice(1);
	}
	return parsed_string+this_char;
}

$.fn.scrollBottom = function() { 
  return $(document).height() - this.scrollTop() - this.height(); 
};

function scroll_transcript(){
	$('#chat_transcript').scrollBottom();
}

function parse_and_split(equation){
	var equation_parts = [];
	var working_ind = 0;
	var split_symbols = ['+', '/', '*', '-', '='];
	equation_parts.push(equation[0]);
	for (var i = 1; i<equation.length; i++){
		//skip to the next index if this is a space
		if(equation[i] == ' '){continue;}
		if(split_symbols.indexOf(equation[i]) > -1){
			equation_parts.push(equation[i]);
			i++;
			equation_parts.push(equation[i]);
			working_ind+=2;
		}else{
			equation_parts[working_ind]+=equation[i];
		}
	}
	return equation_parts;
}

function advance_conversation(message_text){
	
	//sink:0 -> chat
	//sink:1 -> math
	
	var message = conversation.shift();
	//if the message is coming from the user
	if (message.source == 1){
		//if the input method is microphone
		if (message.input == 0){
			appendMessage(message.chat, message.source);
		//if the input method is text
		}else if(message.input == 1){
			appendMessage(message_text, message.source);
		}else if(message.input == 2){
			if(message_text != undefined){
				appendFormula(message_text, message.validate, message.source);
			}else{
				appendFormula(message.scratch_paper, message.validate, message.source);
			}
			
		}
	//if the message is coming from Watson
	}else if(message.source == 0){
		
		//if there's no chat source
		if(message.chat == undefined){
			if(message.video != undefined){
				append_video(message.video, message.source);
			}
		}else{
			appendMessage(message.chat, message.source);
		}
	}
	
	if(message.scratch_paper != null & message.input != 2){
		appendFormula(message.scratch_paper, message.validate, message.source);
	}
	
	if(conversation[0].source == 0){
		setTimeout(advance_conversation, 1500);
	}
	updateMessageHeight();
}

function updateMessageHeight(){
	span.textContent = area.value;
	$('#chat_transcript').css({'height': $('#chat').height()-$('#chat_box').height()-47});
}

function makeExpandingArea(container) {
	area = container.querySelector('textarea');
	span = container.querySelector('span');
	if (area.addEventListener) {
		area.addEventListener('input', function() {
			updateMessageHeight();
		}, false);
		span.textContent = area.value;
	} else if (area.attachEvent) {
		// IE8 compatibility
		area.attachEvent('onpropertychange', function() {
		 	span.innerText = area.value;
		});
		span.innerText = area.value;
	}
	// Enable extra CSS
	container.className += " active";
}

function append_video(video, user_code){
	var message_el = $(
		'<div class="message_wrapper" style="display: none;">'+
			'<div class="message">'+
				'<div class="indicator_bar"></div>'+
				'<div class="message_body">'+
					'<iframe width="100%" height="100%" src="https://www.youtube.com/embed/'+video+'" frameborder="0" allowfullscreen></iframe>'+
				'</div>'+
			'</div>'+
		'</div>'
	);
	
	if (user_code === 0){
		$(message_el).addClass('watson');
	}else if(user_code === 1){
		$(message_el).addClass('user');
	}
	
	var transcript = $('#chat_transcript');
	var welcm_hdrs = $('h1,h2,.watson_logo', $('#chat_transcript'));
	
	transcript.append(message_el).animate({scrollTop : transcript.height()}, 400);
	
	if(welcm_hdrs.css('display') != 'none'){
		welcm_hdrs.fadeOut(400, function(){
			message_el.fadeIn();
		});
	}else{
		message_el.fadeIn();
	}
}

function appendFormula(formula, validate, user_code){
	
	if($('td.selected').length>0){
		
		var selects = $('td.selected');
		
		selects.each(function(){
			$(this).toggleClass('selected');
		});
		
		selects.each(function(){
			$(this).html(formula);
		});
		
		active_line++;
		setTimeout(function(){
			advance_conversation();
		}, 1000);
		return;
	}
	
	if(formula == '\n'){
		advance_conversation();
		return;
	}
	
	
	//if the graph_paper is too narrow, reset it to 50%
	if($('#workbook').width() < 100){
		$('#chat, #graph_paper').animate({'width': '50%'});
		$('#dragger').animate({'left' : '50%'});
		$('#workspace_slider .slider').css({"width" : "50%"});
	}
	
	if($('#problem h1').html() == ''){
		$('#problem h1').html(parse_and_ornament(formula));
	}
	
	var valid_class;
	
	if(validate){
		valid_class = 'valid';
	}else if(validate == false){
		valid_class = 'invalid';
	}
	
	var graph_parts = parse_and_split(formula);
	var working_line = $($('#grid tr')[active_line]);
	var center_col = Math.floor($('#grid tr:first-child td').length/2);
	var equal_cell = $($('td', working_line)[center_col]);
	var equal_ind = graph_parts.indexOf('=');
	equal_cell.html('=');
	var working_cell = equal_cell;
	for(var i = equal_ind-1; i>-1; i--){
		working_cell.prev().html(parse_and_ornament(graph_parts[i])).addClass(valid_class);
		working_cell = working_cell.prev();
	}
	
	working_cell = equal_cell;
	
	
	for(var i = equal_ind+1; i<graph_parts.length; i++){
		
		working_cell.next().html(graph_parts[i]);
		working_cell = working_cell.next().addClass(valid_class);
	}
	
	active_line++;
	
	scroll_transcript();
	
}

function appendMessage(message, user_code){
	
	if(message == '\n'){
		advance_conversation();
		return;
	}
	
	/*
		USER_CODE: 0 => WATSON
		USER_CODE: 1 => USER
	*/
	var message_el = $(
		'<div class="message_wrapper" style="display: none;">'+
			'<div class="message">'+
				'<div class="indicator_bar"></div>'+
				'<div class="message_body">'+
					'<p>'+parse_and_ornament(message)+'</p>'+
				'</div>'+
			'</div>'+
		'</div>'
	);
	
	if (user_code === 0){
		$(message_el).addClass('watson');
	}else if(user_code === 1){
		$(message_el).addClass('user');
	}
	
	var transcript = $('#chat_transcript');
	var welcm_hdrs = $('h1,h2,.watson_logo', $('#chat_transcript'));
	
	transcript.append(message_el).animate({scrollTop : transcript.height()}, 400);
	
	if(welcm_hdrs.css('display') != 'none'){
		welcm_hdrs.fadeOut(400, function(){
			message_el.fadeIn();
		});
	}else{
		message_el.fadeIn();
	}
}

function set_grid(){
	var max_grid_width = $(window).width();
	var max_grid_height = $('#grid').height();
	var num_cols = Math.ceil(max_grid_width/32);
	var num_rows = Math.ceil(max_grid_height/32)*2;
	
	$('#grid table').css({'width' : max_grid_width});
	
	var row = $('<tr></tr>');
	
	for(var i = 0; i<num_cols; i++){
		row.append('<td width="32" height="32"></td>');
	}
	 $('#grid table').append(row);
	 
	 for(var i=0; i<num_rows-1; i++){
		 $('#grid table').append(row.clone());
	 }
}

function reset_scroll(){
	window.scrollTo(0,0);
}

function td_long_touch(cell){
	$(cell).attr('contenteditable', true);
}

$(document).ready(function(){
	
	var prev_dragger_pos = $('#dragger').position().left;
	var screen_width = $(document).width();
	var area;
	var span;
	
	set_grid();
	
	$('#dragger').draggable({
		axis: 'x',
		drag: function(event, ui){
			var pos = $('#dragger').position().left+15;
			
			if ((pos < screen_width) & (pos > 0)){
				var dif = pos - prev_dragger_pos;

				$('#chat').css({'width' : pos+'px'});
				$('#graph_paper').css({'width' : screen_width-pos+'px'})

				prev_dragger_pos = $('#dragger').position().left;
				
				var grid_width = $('#grid table').width();
				var graph_width = $('#graph_paper').width();
				var graph_diff = graph_width-grid_width;
				$('#grid table').css({'left' : (graph_diff/2)+'px'});
				if(mode == 1){
					$('#workspace_slider .slider').css({"width" : $('#graph_paper').width(), "left" : $('#chat').width()});
				}else{
					$('#workspace_slider .slider').css({"width" : $('#chat').width(), "left" : "0"});
				}
				
			}
		},
		stop: function(event, ui){
			var dif = $('#dragger').position().left - prev_dragger_pos;
			$('#chat').css({'width': '+='+dif});
			$('#graph_paper').css({'width': '-='+dif});
			
			prev_dragger_pos = $('#dragger').position().left;
			
		},
		scroll: false
	});
	
	$('#chat').click(function(){
		if(mode != 0){
			mode = 0;
			$('#math_box').fadeOut();
			$('#chat_box').fadeIn();
			$('#workspace_slider .slider').css({"left" : 0, "width" : $('#chat').width()});
		}
		$('#chat_transcript').css({'height': $('#chat').height()-$('#chat_box').height()-15});
	});
	
	$('#graph_paper').click(function(){
		if(mode != 1){
			mode = 1;
			$('#math_box').fadeIn();
			$('#chat_box').fadeOut();
			$('#workspace_slider .slider').css({"left" : $('#chat').width(), "width" : $('#graph_paper').width()});
		}
	});

	$('textarea').on('focus', function(e){
		is_editing = true;
		$('#chat_box textarea').css({'width' : '100%'});
		$('footer').addClass('closed');
		$('#workspace').css({'bottom': 0});
		$('main').css({'height' : $('main').height()-372});
		$('#chat_transcript').css({'height' : $('#chat_transcript').height()-250});
		setTimeout(scroll_transcript, 1000);
		window.scrollTo(0,0);
		$('main').animate({'scrollTop' : 0})
		
	});
	
	
	$('textarea').on('blur', function(e){
		$('html').css({'height' : '100%'});
		$('#chat_transcript').css({'height': $('#chat').height()-$('#chat_box').height()-15});
		setTimeout(function(){
			is_editing = false;
		}, 1000);
		
	});
	
	$('textarea[name="math_input"]').on('keyup', function(e){
		e = e || event;
		if (e.keyCode === 13){
			var math_text = $('textarea[name="math_input"]').val();
			advance_conversation(math_text);
			$('textarea[name="math_input"]').val('');
			updateMessageHeight();
		}
		return true;
	});
	
	
	$('textarea[name="chat_input"]').on('keyup', function(e){
		e = e || event;
		if (e.keyCode === 13){
			var message_text = $('textarea[name="chat_input"]').val();
			advance_conversation(message_text);
			$('textarea[name="chat_input"]').val('');
			updateMessageHeight();
		}
		return true;
	});
	
	$('td').on('blur', function(){
		var par = $(this).parent();
		$('.invalid', par).removeClass('invalid').addClass('valid');
		$(this).addClass('valid').removeClass('invalid');
		setTimeout(function(){
			is_editing = false;
		}, 1000);
	});
		
	$('td').click(function(){
		if(mode == 1){
			if($(this).html()!=''){
				$(this).attr('contenteditable', true).focus();
				is_editing = true;
			}else{
				if(!is_editing){
					$(this).toggleClass('selected');
				}
				/*
				else{
					advance_conversation();
				}
				*/
			}
		}
		
	});
	
	$('#mic').click(function(){
		
		if($('#mic').hasClass('listening')){
			advance_conversation();
		}
		$('#mic').toggleClass('listening');
	});
	
	$('textarea').blur(function(){
		$('main').css({'height' : '+=372'});
	});
	
	$('#chat_box span').click(function(){
		//$('main').css({'height' : '-=382'});
		//setTimeout(reset_scroll, 2000);
		$('main').animate({scrollTop : 0});
		$('footer').removeClass('closed');
		$('#workspace').css({'bottom' : '136px'});
	});
	
	$('#chat_transcript').css({'height': $('#chat').height()-$('#chat_box').height()-15});
	
	
		var areas = document.querySelectorAll('.expandingArea');
		var l = areas.length;while (l--) {
			makeExpandingArea(areas[l]);
		}
	
});