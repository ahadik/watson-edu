function parse_and_ornament(string){
	var parsed_string='';
	var check_chars = ['^'];
	
	var this_char = string[0];
	string = string.slice(1);
	
	while(string.length > 0){	
		//check if the character is a check character
		console.log(string);
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

function advance_conversation(message_text){
	var message = conversation.shift();
	//if the message is coming from the user
	if (message.source == 1){
		//if the input method is microphone
		if (message.input == 0){
			appendMessage(message.chat, message.source);
		//if the input method is text
		}else if(message.input == 1){
			appendMessage(message_text, message.source);
		}
	//if the message is coming from Watson
	}else if(message.source == 0){
		appendMessage(message.chat, message.source);
	}
	
	if(message.scratch_paper != null){
		//if the graph_paper is too narrow, reset it to 50%
		if($('#workbook').width() < 100){
			$('#chat, #graph_paper').animate({'width': '50%'});
			$('#dragger').animate({'left' : '50%'});
		}
		
		if($('#problem h1').html() == ''){
			$('#problem h1').html(parse_and_ornament(message.scratch_paper));
		}
		
	}
	
	if(conversation[0].source == 0){
		setTimeout(advance_conversation, 1500);
	}
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
					'<p>'+message+'</p>'+
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
	var welcm_hdrs = $('h1,h2', $('#chat_transcript'));
	
	transcript.append(message_el).animate({scrollTop : transcript.height()}, 400);
	
	if(welcm_hdrs.css('display') != 'none'){
		welcm_hdrs.fadeOut(400, function(){
			message_el.fadeIn();
		});
	}else{
		message_el.fadeIn();
	}
}

$(document).ready(function(){
	
	var prev_dragger_pos = $('#dragger').position().left;
	var screen_width = $(document).width();
	var area;
	var span;
	
	$('#dragger').draggable({
		axis: 'x',
		drag: function(event, ui){
			var pos = $('#dragger').position().left;
			
			if ((pos < screen_width) & (pos > 0)){
				var dif = pos - prev_dragger_pos;
				$('#chat').css({'width': '+='+dif});
				$('#graph_paper').css({'width': '-='+dif});
				prev_dragger_pos = $('#dragger').position().left;
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
	
	
	
	$('textarea[name="chat_input"]').on('focus', function(e){
		$('#chat_box span').hide();
		$('#chat_box textarea').css({'width' : '100%'});
		$('footer').addClass('closed');
		$('#workspace').css({'bottom': 0});
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
	
	$('#mic').click(function(){
		if($('#mic').hasClass('listening')){
			advance_conversation();
		}
		$('#mic').toggleClass('listening');
	});
	
	$('#chat_box span').click(function(){
		$('footer').removeClass('closed');
		$('#workspace').css({'bottom' : '136px'});
	});
	
	$('#chat_transcript').css({'height': $('#chat').height()-$('#chat_box').height()-15});
	
	
		var areas = document.querySelectorAll('.expandingArea');
		var l = areas.length;while (l--) {
			makeExpandingArea(areas[l]);
		}
	
});