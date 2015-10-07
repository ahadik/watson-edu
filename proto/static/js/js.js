$(document).ready(function(){
	
	var prev_dragger_pos = $('#dragger').position().left;
	
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
	
	function makeExpandingArea(container) {
		var area = container.querySelector('textarea');
		var span = container.querySelector('span');
		if (area.addEventListener) {
			area.addEventListener('input', function() {
				span.textContent = area.value;
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
		}var areas = document.querySelectorAll('.expandingArea');
		var l = areas.length;while (l--) {
			makeExpandingArea(areas[l]);
		}
	
});