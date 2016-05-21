
var tab = null;
var dom = null;
var heroes = null;

loadHeroes();

// When the browser-action button is clicked...
chrome.browserAction.onClicked.addListener(function (_tab)
{
	tab = _tab; 
	requestDom();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, _tab) {
    console.log("tab change: " + _tab.id + ", " + _tab.url);
	if(tab == null)
		return; //no selected tab yet
	
	if(tab.id == _tab.id)
	{
		tab = _tab;
		requestDom();
	}
});

function requestDom()
{
	chrome.tabs.sendMessage(tab.id, {text: 'report_back'},
		function(domContent)
		{
			dom = $(domContent);
			if(dom == null || dom.length == 0)
			{
				console.log("-------------dom not loaded correctly: " + domContent);
				return;
			}
			
			onNewPageLoaded();
		});
}

function onNewPageLoaded()
{
	var urlRoot = "http://dota2.gamepedia.com/";
	if(tab.url.startsWith(urlRoot))
	{
		var path = tab.url.substr(urlRoot.length);
		if(path == "Table_of_hero_attributes")
		{
			scrapeHeroTable();
		}
		else
		{
			scrapeHeroPage();
		}
	}
}

function scrapeHeroTable()
{
	console.log("scraping hero table..");
	heroes = [];
	var trEles = dom.find("table.wikitable tbody").find("tr");
	trEles.each(function(i, tr){
		var hero = {};
		var a = $($(tr).find("a").get(0));
		hero.name = a.attr("title");
		hero.url = resolveUrl(tab, a.attr("href"));
		//console.log(heroName + " " + resolveUrl(tab, a.attr("href")));
		heroes.push(hero);
		
		if(i == trEles.length-1)
		{
			//onComplete
			//console.log(heroes);
			saveHeroes(function()
			{
				scrapeNextHero();
			});
		}
			
	});
}

function scrapeNextHero()
{
	for(var i=0; i<heroes.length; i++)
	{
		if(heroes[i].roles == undefined)
		{
			navigateTo(heroes[i].url);
			return;
		}
	}
	
	console.log("all heroes scraped!");
	console.log(JSON.stringify(heroes));
}

function scrapeHeroPage()
{
	console.log("scraping hero page..");
	
	var hero = getHeroFromUrl(tab.url);
	var roles = [];
	
	var roleEles = getElementWithText("Role:").parent().find("a");
	roleEles.each(function(i, ele)
	{
		roles.push($(ele).attr("title"));
		
		if(i == roleEles.length-1)
		{
			hero.roles = roles;
			console.log(hero.name + " --> roles found: " + roles);
			saveHeroes(function()
			{
				scrapeNextHero();
			})
		}
	});
}


function getHeroFromUrl(url)
{
	if(heroes == undefined || heroes == null)
	{
		console.log("heroes=" + heroes);
		return;
	}
	for(var i=0; i<heroes.length; i++)
	{
		if(heroes[i].url == url)
			return heroes[i];
	}
	return null;
}

function saveHeroes(callback)
{
	chrome.storage.sync.set({heroes: heroes},
		function()
		{
			console.log("heroes saved, size=" + heroes.length);
			callback.apply(this);
		});
}

function loadHeroes()
{
	chrome.storage.sync.get(
	{
		heroes: null
	},
	function(items)
	{
		heroes = items.heroes;
		if(heroes === undefined || heroes == null)
			console.log("no heroes data found");
		else
			console.log("heroes loaded, size=" + heroes.length);
	});
}

function navigateTo(url)
{
	chrome.tabs.update(tab.id, {
		url: url
	});
}

function getElementWithText(text)
{
	return dom.find(":contains("+text+")")
            .filter(function(){ return $(this).children().length === 0;})
            .parent();
}

function resolveUrl(tab, pagePath)
{
	var getLocation = function(href) {
		var l = document.createElement("a");
		l.href = href;
		return l;
	};
	var l = getLocation(tab.url);
	return tab.url.replace(l.pathname, pagePath);
}


//query tab
//chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {tab=tabs[0];

