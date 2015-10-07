$(document).ready(function(){
	
	var prev_dragger_pos = $('#dragger').position().left;
	var area;
	var span;
	
	$('#dragger').draggable({
		axis: 'x',
		drag: function(event, ui){
			var dif = $('#dragger').position().left - prev_dragger_pos;
			$('#chat').css({'width': '+='+dif});
			$('#graph_paper').css({'width': '-='+dif});
			prev_dragger_pos = $('#dragger').position().left;
		},
		stop: function(event, ui){
			var dif = $('#dragger').position().left - prev_dragger_pos;
			$('#chat').css({'width': '+='+dif});
			$('#graph_paper').css({'width': '-='+dif});
			
			prev_dragger_pos = $('#dragger').position().left;
			
		}	
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
		
		$('h1:visible,h2:visible', $('#chat_transcript')).fadeOut(400, function(){
			var transcript = $('#chat_transcript');
			transcript.append(message_el).animate({scrollTop : transcript.height()}, 400);
			message_el.fadeIn();
		});
	}
	
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