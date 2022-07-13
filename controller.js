const puppeteer = require('puppeteer');

module.exports = {

	/*
	logs into beatport then searches each track and adds it to the cart one by one
	returns true if successful or a list of searches it failed on otherwise

		username : String
		password : String
		searches : array of searches for beatport

		returns true | String[]
	**/
	addToBeatportCart : async (username, password, searches) => {
		const browser = await puppeteer.launch()
		console.log(username)

		return true
	}
}