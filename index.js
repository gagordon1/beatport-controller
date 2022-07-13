const express = require('express')
const app = express()


const DEVELOPMENT = true;
const port = 8080
const DEVELOPMENT_FRONTEND = "http://localhost:3000"
const PRODUCTION_FRONTEND = ""
const controller = require("./controller.js")

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

app.post('/addToCart', async (req, res) => {

	try{
		const searches = req.body.searches.split("%20");
		const username = req.body.username;
		const password = req.body.password;
		const result = await controller.addToBeatportCart(username, password, searches)

		res.send(JSON.stringify({badSearches : result}))
  		
	}catch(error){
		res.status(400).send(error)
	}

	
})

app.listen(port, () => {
  console.log(`Beatport controller listening on port ${port}`)
})