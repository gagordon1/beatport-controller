 const express = require('express')
const puppeteer = require('puppeteer');

const app = express()
const controller = require("./controller.js")
const { v4: uuidv4 } = require('uuid');

//Setting
const DEVELOPMENT = false;
const port = 8080
const DEVELOPMENT_FRONTEND = "http://localhost:3000"
const PRODUCTION_FRONTEND = "http://dj-assistant-frontend.herokuapp.com"

const SECONDS_IN_A_DAY = 86400
const STATUS_TIMEOUT = 5000 * 1000 //milliseconds in 5000 seconds
const CLEANUP_INTERVAL =   SECONDS_IN_A_DAY * 1000 // milliseconds in a day

const status = {}

function cleanUpStatus(){
	const ids = Object.keys(status);
	ids.forEach(id =>{
		let progress = status[id]
		if (new Date().getTime() - progress.started > STATUS_TIMEOUT){
			delete progress[id]
		}
	})
}

setInterval(() => {console.log(status); console.log("cleaning up..."); cleanUpStatus()} , CLEANUP_INTERVAL)

app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', DEVELOPMENT? DEVELOPMENT_FRONTEND : PRODUCTION_FRONTEND);
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  next();
});

app.get('/', (req, res) => {

  	res.send('Beatport cart server!')
})


/*
Gets the status of a job specified by the id
**/
app.get('/status/:id', (req, res) => {
	try{
		if (status[req.params.id].toProcess === 0){
			res.send(JSON.stringify({status : status[req.params.id]}))
			delete status[req.params.id]
		}else{
			res.send(JSON.stringify({status : status[req.params.id]}))
		}
	}catch(error){
		res.status(500).send("Internal server error")
	}
	
})


/*
Starts adding to cart process and responds letting the client know where to find updates

searches : String separated by %20
username : String
password : String 
**/
app.post('/addToCart', async (req, res) => {

	try{
		const searches = req.body.searches
		const username = req.body.username;
		const password = req.body.password;
		console.log(searches)
		const browser = await puppeteer.launch();
		const page = await browser.newPage();

		//login
		if (!(await controller.login(page, username, password))){
			console.log("invalid log in ")
			browser.close()
			res.status(400).send("Invalid login.")
			return
		}else{
			console.log("logged in successfully.")
			//search a track
			const statusId = uuidv4()
			status[statusId] = {badSearches : [], toProcess : searches.length, started : new Date().getTime()}
			controller.addToBeatportCart(browser, page, searches, status[statusId])
			res.send(JSON.stringify({statusId : statusId, status : status[statusId]}))
		}
		
		
  		
	}catch(error){
		res.status(500).send("Internal server error.")
	}

	
})

app.listen(port, () => {
  console.log(`Beatport controller listening on port ${port}`)
})