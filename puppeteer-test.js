const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
 // Config is optional

var controller = require('./controller');
var testVariables = require('./test-config.js') //hidden from github
const progress = {toProcess : 3, badSearches: []}

const test = async() => {
	const browser = await puppeteer.launch()
	const testPage = await browser.newPage()

	const recorder = new PuppeteerScreenRecorder(testPage);

	const savePath = './screenshots/demo2.mp4';
	await recorder.start(savePath);

	let loggedIn = await controller.login(testPage, testVariables.un, testVariables.pw) 

	if (loggedIn){
		await controller.addToBeatportCart(browser, testPage, testVariables.searches, progress)

	}else{
		browser.close()
	}

	

	await recorder.stop()
}

test()

