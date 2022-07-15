var controller = require('./controller');
var testVariables = require('./test-config.js') //hidden from github
const progress = {toProcess : 3, badSearches: []}
controller.addToBeatportCart(testVariables.un, testVariables.pw, 
	testVariables.searches, progress)