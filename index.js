const express = require('express')
const app = express()

const SECONDS_IN_A_DAY = 86400
const DEVELOPMENT = true;
const port = 8080
const DEVELOPMENT_FRONTEND = "http://localhost:3000"
const PRODUCTION_FRONTEND = ""
const controller = require("./controller.js")
const { v4: uuidv4 } = require('uuid');

const STATUS_TIMEOUT = 1000 * 1000 //milliseconds in 1000 seconds
const CLEANUP_INTERVAL =   60 * 1000 // milliseconds in a day

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
		const statusId = uuidv4()
		status[statusId] = {badSearches : [], toProcess : searches.length, started : new Date().getTime()}
		controller.addToBeatportCart(username, password, searches, status[statusId])
		res.send(JSON.stringify({statusId : statusId, status : status[statusId]}))
  		
	}catch(error){
		res.status(500).send(error)
	}

	
})

app.listen(port, () => {
  console.log(`Beatport controller listening on port ${port}`)
})