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

	const savePath = './screenshots/demo.mp4';
	await recorder.start(savePath);

	await controller.addToBeatportCart(browser, testPage, testVariables.un, testVariables.pw, 
		testVariables.searches, progress)

	await recorder.stop()
}

test()

