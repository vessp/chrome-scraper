//open in chrome: chrome-extension://gjppdcpkcnkiogfdabchoaiclmaibbgi/popup.html

var jHero = {};


document.addEventListener('DOMContentLoaded', function() {
	//fires when the popup is loaded
		
		chrome.tabs.getSelected(null, function(tab) {
		  // Send a request to the content script.
		  chrome.tabs.sendRequest(tab.id, {action: "getDOM"}, function(response) {
			console.log(response.dom);
		  });
		});
	
  
  $("#scrape").click(function(){
	  chrome.tabs.getSelected(null, function(tab) {
			
		  jHero['name'] = "Sven";
		  var roles = [];
		  var roleEles = $("tr:contains(Role:)").find("a");
		  roleEles.each(function(i, ele)
		  {
			roles.push($(ele).attr("title"));
		  });
		  
		  jHero['roles'] = roles;
		  trace(jHero);
		  
		  chrome.tabs.update({
			 url: "http://dota2.gamepedia.com/Drow"
		});
	  });
  })
  

}, false);

function trace(msg)
{
	/*
	var millis = Date.now();
	var seconds = (millis / 1000) % 60;
	var minutes = ((millis / (1000*60)) % 60);
	var hours   = ((millis / (1000*60*60)) % 24);
	msg = hours + ":" + minutes;
	*/
	console.log(msg)
}