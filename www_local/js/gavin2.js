var timers = [];
var handy = {};

var timer = function(_id, _form){

	this.id = _id;
	this.form = _form;

	this.shouldDelete = false;

	this.hh_initial = false;
	this.mm_initial = false;
	this.ss_initial = false;
	this.hh_remaining = false;
	this.mm_remaining = false;
	this.ss_remaining = false;

	this.original_timeout = 0;
	this.offset = 0;

	this.started = false;
	this.running = false;
	this.expired = false;
	this.expired_at = false;
	
	this.soundAlarm = function(_now){

		this.stopTimer();
		alert("ALARM SOUNDING");
	
	};

	this.updateTimeRemaining = function(_now){

		var remains = (this.original_timeout+this.offset) - _now; // milliseconds
		this.ss_left = Math.floor((remains/1000)%60);
		this.mm_left = Math.floor(((remains/1000)/60)%60);
		this.hh_left = Math.floor((((remains/1000)/60)/60));

		this.form.elements.hours.value = this.hh_left;
		this.form.elements.minutes.value = this.mm_left;
		this.form.elements.seconds.value = this.ss_left;
	};

	this.startTimer = function(){

		// get inputs
		this.hh_initial = this.form.elements.hours.value;
		this.mm_initial = this.form.elements.minutes.value;
		this.ss_initial = this.form.elements.seconds.value;

		// disable inputs
		this.form.elements.hours.disabled = true;
		this.form.elements.minutes.disabled = true;
		this.form.elements.seconds.disabled = true;

		// set current
		this.hh_remaining = this.hh_initial;
		this.mm_remaining = this.mm_initial;
		this.ss_remaining = this.ss_initial;

		// if all zero, set to one second
		if(this.hh_remaining==0 && this.mm_remaining==0 && this.ss_remaining==0){
			this.ss_remaining = 1;
		}

		// calc timeout
		var m_hours = 1000*60*60*this.hh_initial;
		var m_minutes = 1000*60*this.mm_initial;
		var m_seconds = 1000*this.ss_initial;
		var milliseconds_delta = m_hours+m_minutes+m_seconds;

		// make a new timestamp equal to now + the above
		var now = new Date().valueOf(); // js millisecond timestamp
		this.original_timeout = now+milliseconds_delta;

		var dd = new Date(this.original_timeout);
		var ddn = new Date(now);

		// hide start button
		this.form.elements.start_button.style.display = "none";

		// show pause and stop buttons
		this.form.elements.pause_button.style.display = "";
		this.form.elements.stop_button.style.display = "";

		// start
		this.form.parentNode.style.background = "green";
		this.started = true;
		this.running = true;
	};

	this.togglePauseTimer = function(){
		this.running = !this.running;
		// set bar to orange if paused, green if running
		if(this.running && !this.expired){
			this.form.parentNode.style.background = "green";
			this.form.elements.pause_button.innerHTML = "pause";
		}else if(!this.running && !this.expired){
			this.form.parentNode.style.background = "orange";
			this.form.elements.pause_button.innerHTML = "unpause";

		}
	};

	this.stopTimer = function(){

		// stop running
		this.offset = 0;
		this.started = false;
		this.running = false;
		this.expired = false;
		this.expired_at = false;

		// re-enable inputs
		this.form.elements.hours.disabled = false;
		this.form.elements.minutes.disabled = false;
		this.form.elements.seconds.disabled = false;

		// set red
		this.form.parentNode.style.background = "red";

		// hide pause and stop buttons
		this.form.elements.pause_button.style.display = "none"; 
		this.form.elements.pause_button.innerHTML = "pause"; 
		this.form.elements.stop_button.style.display = "none"; 

		// show start button
		this.form.elements.start_button.style.display = ""; 

	};

	this.delTimer = function(){
		// delete holder
		this.form.parentNode.parentNode.removeChild(this.form.parentNode);
		// mark for deletion
		this.shouldDelete = true;
	};

	this.update = function(_now){
		// how long between updates
		if(!this.last_update){
			this.last_update = _now;
		}
		var delta = _now-this.last_update;
		// if not running, add this time to the offset
		if(!this.running && this.started){
			this.offset+= delta;
		}else if(this.running && this.started){

			// check if timeout+offset is reached
			if(this.original_timeout+this.offset<_now){

				// sound alarm
				this.soundAlarm(_now);

			}else{

				// updage hms left
				this.updateTimeRemaining(_now);
			}
		}
		this.last_update = _now;
	};
}


function onDeviceReady() {
	debug("device ready");


	// check vibration ready
	if(navigator.vibrate){
		debug("navigator.vibrate ready");
	}

	// get body height
	handy.bodyHeight = document.body.scrollHeight;

	// set height
	handy.blockHeight = Math.floor(handy.bodyHeight*0.1);

	// start timer process
	startTimerUpdates();

	// spawn first timer
	newTimer();

	// assign new timer button
	document.getElementById("new_timer_button").addEventListener("click", newTimer);

}// onDeviceReady end
onDeviceReady();

function newTimer(){

	// associate timer id
	var timerid = randst(5);

	// create bar
	var timerBar = document.createElement("div");
	timerBar.className = "timer_bar";
	timerBar.style.height = handy.blockHeight+"px";
	// timerBar.innerHTML = "";

	// create form
	var timerForm = document.createElement("form");
	timerForm.className = "timer_input_form "+timerid;
	timerForm.addEventListener("keyup", function(e){
		var target = e.srcElement || e.target;
		var maxLength = parseInt(target.attributes["maxlength"].value, 10);
		var myLength = target.value.length;
		if (myLength >= maxLength) {
			var next = target;
			var t = false;
			while (next = next.nextElementSibling) {
				t = true;
				if (next == null)                        
					break;
				if (next.tagName.toLowerCase() === "input") {
					next.focus();
					break;
				}
			}
			// don't last input shouldn't overflow
			if(t){
				target.value = target.value.substring(target.value.length-2,target.value.length);	
			}
		}
		// Move to previous field if empty (user pressed backspace)
		else if (myLength === 0) {
			var previous = target;
			while (previous = previous.previousElementSibling) {
				if (previous == null)
					break;
				if (previous.tagName.toLowerCase() === "input") {
					previous.focus();
					break;
				}
			}
		}
	});// keyup end

	// create timer
	var newTimer = new timer(timerid, timerForm);
	timers.push(newTimer);

	// create start button
	var startButton = document.createElement("button");
	startButton.type = "button";
	startButton.name = "start_button";
	startButton.innerHTML = "start";
	startButton.addEventListener("click", function(e){
		var thisButton = e.srcElement || e.target;
		var thisForm = thisButton.parentNode;
		var thisTimerID = thisForm.elements.timerid.value;
		getTimer(thisTimerID).startTimer();
	});

	// create hidden pause button
	var pauseButton = document.createElement("button");
	pauseButton.type = "button";
	pauseButton.name = "pause_button";
	pauseButton.innerHTML = "pause";
	pauseButton.style.display = "none";
	pauseButton.addEventListener("click", function(e){
		var thisButton = e.srcElement || e.target;
		var thisForm = thisButton.parentNode;
		var thisTimerID = thisForm.elements.timerid.value;
		getTimer(thisTimerID).togglePauseTimer();
	});

	// create hidden stop button
	var stopButton = document.createElement("button");
	stopButton.type = "button";
	stopButton.name = "stop_button";
	stopButton.innerHTML = "stop";
	stopButton.style.display = "none";
	stopButton.addEventListener("click", function(e){
		var thisButton = e.srcElement || e.target;
		var thisForm = thisButton.parentNode;
		var thisTimerID = thisForm.elements.timerid.value;
		getTimer(thisTimerID).stopTimer();
	});

	// create delete button
	var deleteButton = document.createElement("button");
	deleteButton.type = "button";
	deleteButton.name = "delete_button";
	deleteButton.innerHTML = "DEL";
	deleteButton.style.float = "right";
	deleteButton.style.margin = "0px 20px 0px 0px";
	deleteButton.addEventListener("click", function(e){
		var thisButton = e.srcElement || e.target;
		var thisForm = thisButton.parentNode;
		var thisTimerID = thisForm.elements.timerid.value;
		getTimer(thisTimerID).delTimer();
	});

	// create inputs
	var timerId = document.createElement("input");
	timerId.type = "hidden";
	timerId.value = timerid;
	timerId.name = "timerid";
	timerId.className = "timerid";

	var hourInput = document.createElement("input");
	hourInput.type = "number";
	hourInput.name = "hours";
	hourInput.setAttribute("maxlength","2");
	hourInput.placeholder = "hh";
	hourInput.className = "timer_input hours";

	var minuteInput = document.createElement("input");
	minuteInput.type = "number";
	minuteInput.name = "minutes";
	minuteInput.setAttribute("maxlength","2");
	minuteInput.placeholder = "mm";
	minuteInput.className = "timer_input minutes";

	var secondInput = document.createElement("input");
	secondInput.type = "number";
	secondInput.name = "seconds";
	secondInput.setAttribute("maxlength","2");
	secondInput.placeholder = "ss";
	secondInput.className = "timer_input seconds";

	// add inputs to form
	timerForm.appendChild(hourInput);
	timerForm.appendChild(minuteInput);
	timerForm.appendChild(secondInput);
	timerForm.appendChild(startButton);
	timerForm.appendChild(pauseButton);
	timerForm.appendChild(stopButton);
	timerForm.appendChild(deleteButton);
	timerForm.appendChild(timerId);

	// add form to bar
	timerBar.appendChild(timerForm);

	// add bar to page
	document.getElementById("bar_container").appendChild(timerBar); 

	// move new button to bottom
	var newButtonBar = document.getElementById("new_timer_button").parentNode;
	newButtonBar.parentNode.appendChild(newButtonBar);

};


function startTimerUpdates(){
	var pid = setInterval(
		function(){
			var now = new Date().valueOf();
			for(var i = 0; i < timers.length; i++){
				// check timers
				timers[i].update(now);

				// kill expired
				if(timers[i].shouldDelete){
					timers.splice(i,1);
				}				

			}
		},
		500
	);
};

// HELPERS START
function debug(_str){
	document.getElementById("debug_info").innerHTML += "<br />"+_str;
}
function randst(_len) {
	var t = "";
	var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	for (var i = 0; i < _len; i++){
		t += c.charAt(Math.floor(Math.random() * c.length));	
	}
	return t;
}
function getTimer(_id){
	for (var i = 0; i < timers.length; i++){
		if(timers[i].id == _id){
			return timers[i];
		}
	}
	return false;
}