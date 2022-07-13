const puppeteer = require('puppeteer');

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const WAIT_TIME = 1500

module.exports = {

	/*
	logs into beatport then searches each track and adds it to the cart one by one
	returns list of searches that failed (if empty all were successful)

		username : String
		password : String
		searches : array of searches for beatport

		returns String[]
	**/
	addToBeatportCart : async (un, pw, searches) => {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();

		const badSearches = [];

		const clearCookieMenu = async (p) => {
			if (await p.$("button#CybotCookiebotDialogBodyButtonDecline") != null){
				await p.$eval( "button#CybotCookiebotDialogBodyButtonDecline", button => button.click() );
			}
		}
		//login
		console.log("logging in...")
		await page.goto("https://www.beatport.com/account/login");
		await page.$eval('input#username', (el,un) => {return el.value=un}, un);
		await page.$eval('input#password', (el,pw) => {return el.value=pw}, pw);
		await page.screenshot({path: 'screenshot2.png'});
		await page.$eval('button.login-page-form-button', button => button.click())
		await page.waitForNavigation()

		await clearCookieMenu(page)
		//search a track
		var search;
		for (i = 0; i <searches.length; i++){
			search = searches[i]
			try{
				
				console.log(`searching for track: ${search}...`)
				await page.goto('https://www.beatport.com/search/tracks?q='+search,{waitUntil: 'load', timeout: 0});

				
				await page.screenshot({path: `screenshot${search}.png`});
				await page.$$eval("a.icon.icon-ellipsis.track-ellipsis.mobile-action", elements => elements[0].click())

				// await page.screenshot({path: 'screenshot5.png'});

				console.log("clicking cart menu...")
				await page.$eval("div.icon", icon => icon.click());

				await sleep(WAIT_TIME)
				console.log("trying to click main cart...")
				// await page.screenshot({path: 'screenshot6.png'});

				await page.$$eval(`li[data-name^="cart"]`, e => {
					e[e.length-1].click() //there are two on the page for some reason - should investigate further
				})
				await sleep(WAIT_TIME)

				await clearCookieMenu(page)
				await page.screenshot({path: 'screenshot7.png'});
			}catch(error){
				console.log(error)
				badSearches.push(search)
			}

			
		}
		
    	browser.close();
		return badSearches
	}
}