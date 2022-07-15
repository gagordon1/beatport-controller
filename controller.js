const puppeteer = require('puppeteer');
const vs = require('./valid_search.js');
const WAIT_TIME = 4000
const DEV = true

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function login (p, un, pw){
	console.log("logging in...")
	await p.goto("https://www.beatport.com/account/login", {waitUntil: 'load'})
	.then(() => clearCookieMenu(p))
	.then(() => p.$eval('input#username', (el,un) => {return el.value=un}, un))
	.then(() => p.$eval('input#password', (el,pw) => {return el.value=pw}, pw))

	.then(() => clearCookieMenu(p))
	.then(async () => {
		p.$eval('button.login-page-form-button', button => button.click())
		await p.waitForNavigation();
	})
	.then(() => {
		if(DEV){
			p.screenshot({path: `./screenshots/login.png`});
		}
	})
	
}

async function searchTrack(s, p){
	console.log(`searching for track: ${s.track} by ${s.artists}...`)
	let searchString = (s.track + " " + s.artists).replace(/\s/g, "+")
	let url = `https://www.beatport.com/search/tracks?q=${searchString}`
	p.goto(url)
	await p.waitForNavigation()
	.then(() => {
		if(DEV){
			p.screenshot({path: `./screenshots/screenshot_search.png`});
		}
	}
	)
}

async function addFirstResultToCart(s,p){
	await p.$$eval("a.icon.icon-ellipsis.track-ellipsis.mobile-action", elements => elements[0].click())
	.then(() =>{
		console.log("	clicking cart menu...")
		p.$eval("div.icon", icon => icon.click());
	})
	.then(() => sleep(WAIT_TIME))
	.then(()=>{
		
		if (DEV){
			p.screenshot({path: `./screenshots/cart.png`});
		}
	})
	.then(() => {
			console.log("	clicking main cart...")
			p.$$eval(`li[data-name^="cart"]`, e => {
			e[e.length-1].click() //there are two on the page for some reason - should investigate further
		})
	})
	.then(() => sleep(WAIT_TIME) )
}

async function checkIfValidResult(s, p){
	let [title, artists] = await p.$$eval("div.buk-track-meta-parent", e => {
		let title = e[0].children[0].children[0].children[0].innerText.toLowerCase() //title
		let artists = e[0].children[1].innerText.toLowerCase()//artists
		return [title, artists]
	})
	
	return vs.validSearch(s.track.toLowerCase(), s.artists.toLowerCase(), title, artists)
		
		
}

async function clearCookieMenu (p) {
	if (await p.$("button#CybotCookiebotDialogBodyButtonDecline") != null){
		await p.$eval( "button#CybotCookiebotDialogBodyButtonDecline", button => button.click() );
	}
}


module.exports = {

	/*
	logs into beatport then searches each track and adds the top result to the cart one by one
	skips if the top result is does not match the search according to a deterministic function

		username : String
		password : String
		searches : array of searches for beatport
		progress : {toProcess : int, badSearches : String[]}

		returns String[]
	**/
	addToBeatportCart : async (username, password, searches, progress) => {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		
		//login
		await login(page, username, password)
		//search a track
		var search;
		for (i = 0; i <searches.length; i++){
			search = searches[i]

			try{
				await searchTrack(search, page)
				.then(() => checkIfValidResult(search, page))
				.then((valid) => valid? addFirstResultToCart(search, page) : progress.badSearches.push(search));
				
			}catch(error){
				console.log(error)
				progress.badSearches.push(search)
			}
			progress.toProcess--;
			
		}
		console.log("finished.")
    browser.close();
	}
}