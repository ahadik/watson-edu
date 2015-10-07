$(document).ready(function(){
	
	var prev_dragger_pos = $('#dragger').position().left;
	var screen_width = $(document).width();
	var area;
	var span;
	
	$('#dragger').draggable({
		axis: 'x',
		drag: function(event, ui){
			
			
			var pos = $('#dragger').position().left;
			console.log(screen_width);
			console.log(pos);
			
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
	
	$('textarea[name="chat_input"]').on('focus', function(e){
		$('#input_ui').addClass('closed');
		$('#workspace').css({'bottom': 0});
	});
	
	$('textarea[name="chat_input"]').on('keyup', function(e){
		e = e || event;
		if (e.keyCode === 13){
			var message_text = $('textarea[name="chat_input"]').val();
			appendMessage(message_text, 1);
			$('textarea[name="chat_input"]').val('');
			updateMessageHeight();
		}
		return true;
	});
	
	$('#chat_transcript').css({'height': $('#chat').height()-$('#chat_box').height()-15});
	
	
		var areas = document.querySelectorAll('.expandingArea');
		var l = areas.length;while (l--) {
			makeExpandingArea(areas[l]);
		}
	
});