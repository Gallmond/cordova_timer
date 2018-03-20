// document.addEventListener("deviceready", onDeviceReady, false);

var timer = function(_id, _timeout){
	this.id = _id;
	this.form = document.querySelector(".timer_input_form."+_id);
	this.original_timeout = _timeout;
	this.running = true;
	this.expired = false;
	this.finished_at = 0;
	this.offset = 0;
	this.last_update = new Date().valueOf();
	this.hh_left = 0;
	this.mm_left = 0;
	this.ss_left = 0;
	this.updateTimeRemaining = function(_now){

		var remains = (this.original_timeout+this.offset) - _now; // milliseconds
		this.ss_left = Math.floor((remains/1000)%60);
		this.mm_left = Math.floor(((remains/1000)/60)%60);
		this.hh_left = Math.floor((((remains/1000)/60)/60));

		this.form.elements.hours.value = this.hh_left;
		this.form.elements.minutes.value = this.mm_left;
		this.form.elements.seconds.value = this.ss_left;
	};
	this.resume = function(){
		this.running = true;
	};
	this.pause = function(){
		this.running = false;
	};
	this.toggle = function(){
		this.running = !this.running;
	};
	this.expire = function(){
		this.expired = true;

		// make red
		this.form.parentNode.style.background = "red";

		// 

	};
	this.update = function(_now){

		// how long between updates
		var delta = _now-this.last_update;
		// if not running, add this time to the offset
		if(!this.running){
			this.offset+= delta;
		}else{

			// check if timeout+offset is reached
			if(this.original_timeout+this.offset<_now){
				this.finished_at = _now;
				alert("ALARM FIRING!");
				this.pause();
				this.expire();
			}else{

				// updage hms left
				this.updateTimeRemaining(_now);
			}
		}
		this.last_update = _now;
	};
	console.log(this);
};

var timers = [];
var handy = {};
function onDeviceReady() {
	debug("device ready");


	// check vibration ready
	if(navigator.vibrate){
		debug("navigator.vibrate ready");
	}


	// get body height
	handy.bodyHeight = document.body.scrollHeight;
	debug("height: "+String(handy.bodyHeight));

	// set blocks to be n% of height
	var blockHeight = Math.floor(handy.bodyHeight*0.1);
	handy.blockHeight = blockHeight
	var allBlocks = document.getElementsByClassName("timer_bar");
	for(var i = 0; i < allBlocks.length; i++){
		allBlocks[i].style.height = String(blockHeight)+"px";
	}

	// start timer process
	startTimerUpdates();

	// spawn first timer
	spawnNewTimerBar();

}// onDeviceReady end


// this adds a new timer bar to the bottom of the list of timers
function spawnNewTimerBar(){ 
console.log("ssss");
	// <div class="timer_bar">
	// 	Timer
	// 	<form class="timer_input_form">
	// 		<input type="number" name="hours" maxlength="2" placeholder="hh" class="timer_input hours" />
	// 		<input type="number" name="minutes" maxlength="2" placeholder="mm" class="timer_input minutes" />
	// 		<input type="number" name="seconds" maxlength="2" placeholder="ss" class="timer_input seconds" />
	// 		<button name="start_button" type="submit">start</button>
	// 	</form>
	// </div>

	// associate timer id
	var timerid = randst(5);

	// create bar
	var timerBar = document.createElement("div");
	timerBar.className = "timer_bar";
	timerBar.style.height = handy.blockHeight+"px";
	timerBar.innerHTML = "TIMER";

	// create form
	var timerForm = document.createElement("form");
	timerForm.className = "timer_input_form "+timerid;
	timerForm.addEventListener("keyup", timerInputKeyup);
	timerForm.addEventListener("submit", timerFormSubmitted);

	// create button
	var submitButton = document.createElement("button");
	submitButton.type = "submit";
	submitButton.name = "start_button";
	submitButton.innerHTML = "start";

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
	timerForm.appendChild(submitButton);
	timerForm.appendChild(timerId);

	// add form to bar
	timerBar.appendChild(timerForm);

	// add bar to page
	document.getElementById("bar_container").appendChild(timerBar); 

	// move the new button to the bottom
	var newButton = document.getElementsByClassName("new_bar")[0];
	console.log(newButton);
	newButton.parentNode.appendChild(newButton);

}// spawnNewTimerBar end


function timerFormSubmitted(e){
	debug("form submitted");
	e.preventDefault();
	var target = e.srcElement || e.target; // target is the form here

	// get elements of form
	var hours = parseInt((target.elements.hours.value==""?0:target.elements.hours.value));
	var minutes = parseInt((target.elements.minutes.value==""?0:target.elements.minutes.value));
	var seconds = parseInt((target.elements.seconds.value==""?0:target.elements.seconds.value));
	var start_button = target.elements.start_button;
	var timerid = target.elements.timerid.value;

	// remove start button
	start_button.parentNode.removeChild(start_button);

	// what is this in milliseconds
	var m_hours = 1000*60*60*hours;
	var m_minutes = 1000*60*minutes;
	var m_seconds = 1000*seconds;
	var milliseconds_delta = m_hours+m_minutes+m_seconds;

	// make a new timestamp equal to now + the above
	var now = new Date().valueOf(); // js millisecond timestamp
	var later = now+milliseconds_delta;
	
	// spawn new timer obj and add it to the array
	var newTimer = new timer(timerid, later);
	timers.push(newTimer);

	// add a pause button
	var pauseButton = document.createElement("button");
	pauseButton.innerHTML = "pause/resume";
	pauseButton.className = "pause_resume_button";
	pauseButton.value = newTimer.id;
	pauseButton.type = "button"; // otherwise submit by default
	pauseButton.onclick = function(e){
		var thisButton = e.srcElement || e.target
		this.timerid = newTimer.id
		console.log("pauseButton.onClick clicked");
		console.log("newTimer.id", newTimer.id);
		console.log("this.timerid", this.timerid);
		// find and toggle this timer
		var currentStatus = 0;
		for(var i = 0; i < timers.length; i++){
			if(timers[i].id == this.timerid){
				timers[i].toggle();
				currentStatus = timers[i].running;
			}
		}
		// set containing bar colour
		if(currentStatus){ // running = green
			thisButton.parentNode.parentNode.style.background = "green";
		}else{ // not running = orange
			thisButton.parentNode.parentNode.style.background = "orange";
		}
	}
	// add it to the form 
	target.appendChild(pauseButton);

	// add a stop button
	var stopButton = document.createElement("button");
	stopButton.innerHTML = "stop";
	stopButton.value = newTimer.id;
	stopButton.type = "button";
	stopButton.onclick = function(e){
		var thisButton = e.srcElement || e.target
		var thisForm = thisButton.parentNode;
		this.timerid = newTimer.id;
		console.log("stopButton.onClick clicked");
		console.log("newTimer.id", newTimer.id);
		console.log("this.timerid", this.timerid);
		// find and stop timer (resets without starting)
		for(var i = 0; i < timers.length; i++){
			if(timers[i].id == this.timerid){
				// delete timer
				timers.splice(i,1);

				// return start button
				var submitButton = document.createElement("button");
				submitButton.type = "submit";
				submitButton.name = "start_button";
				submitButton.innerHTML = "start";
				thisForm.appendChild(submitButton);

				// remove stop button
				thisForm.removeChild(thisButton);

				// remove start/pause button
				var pauseButton = thisForm.getElementsByClassName("pause_resume_button")[0];
				thisForm.removeChild(pauseButton);

				// change bar colour
				thisForm.parentNode.style.background = "red";
			}
		}
	}
	// add it to the form 
	target.appendChild(stopButton);


	// set parent green
	target.parentNode.style.background = "green";

	return false;
}


// logic for input onkeyup
function timerInputKeyup(e){
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
		debug("t: "+String(t));
		if(t) target.value = target.value.substring(target.value.length-2,target.value.length);
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
}// timerInputKeyup end


// this is where the loop for the timer updates happens
function startTimerUpdates(){
	var pid = setInterval(
		function(){
			var now = new Date().valueOf();
			for(var i = 0; i < timers.length; i++){
				// check timers
				timers[i].update(now);

				// kill expired
				if(timers[i].expired){
					timers.splice(i,1);
				}				

			}
		},
		500
	);
	console.log("interval pid:", pid);
}// startTimerUpdates end


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
// HELPERS END

onDeviceReady();