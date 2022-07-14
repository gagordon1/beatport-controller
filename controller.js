const puppeteer = require('puppeteer');
const WAIT_TIME = 3000
const DEV = true

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function login (p, un, pw){
	console.log("logging in...")
	await p.goto("https://www.beatport.com/account/login", {waitUntil: 'load'});
	await clearCookieMenu(p)
	await p.$eval('input#username', (el,un) => {return el.value=un}, un);
	await p.$eval('input#password', (el,pw) => {return el.value=pw}, pw);

	await clearCookieMenu(p)
	await p.$eval('button.login-page-form-button', button => button.click())
	
	await p.waitForNavigation()
	if(DEV){
		await p.screenshot({path: `login.png`});
	}
	return
}

async function searchTrack(s, p){
	console.log(`searching for track: ${s.track} by ${s.artists}...`)
	let searchString = (s.track + " " + s.artists).replace(/\s/g, "+")
	let url = `https://www.beatport.com/search/tracks?q=${searchString}`
	await p.goto(url,{waitUntil: 'load'});

	if(DEV){
		await p.screenshot({path: `screenshot${s.track}.png`});
	}
	await sleep(WAIT_TIME)
	return
}

async function addFirstResultToCart(s,p){
	await p.$$eval("a.icon.icon-ellipsis.track-ellipsis.mobile-action", elements => elements[0].click())

	console.log("	clicking cart menu...")
	await p.$eval("div.icon", icon => icon.click());

	await sleep(WAIT_TIME)
	console.log("	clicking main cart...")
	if (DEV){
		await p.screenshot({path: `cart-${s.track}.png`});
	}
	

	await p.$$eval(`li[data-name^="cart"]`, e => {
		e[e.length-1].click() //there are two on the page for some reason - should investigate further
	})
	await sleep(WAIT_TIME)
	return
}

async function clearCookieMenu (p) {
	if (await p.$("button#CybotCookiebotDialogBodyButtonDecline") != null){
		await p.$eval( "button#CybotCookiebotDialogBodyButtonDecline", button => button.click() );
	}
}


module.exports = {

	/*
	logs into beatport then searches each track and adds it to the cart one by one
	returns list of searches that failed (if empty all were successful)

		username : String
		password : String
		searches : array of searches for beatport
		progress : {toProcess : int}

		returns String[]
	**/
	addToBeatportCart : async (username, password, searches, progress) => {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();

		const badSearches = [];
		
		//login
		
		await login(page, username, password)
		await clearCookieMenu(page)
		//search a track
		var search;
		for (i = 0; i <searches.length; i++){
			search = searches[i]

			try{
				await searchTrack(search, page)
				await addFirstResultToCart(search, page)
				
			}catch(error){
				console.log(error)
				badSearches.push(search)
				progress.badSearches = badSearches
			}
			progress.toProcess--;
			
		}
    	browser.close();
		return badSearches
	}
}