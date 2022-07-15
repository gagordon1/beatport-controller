


module.exports = {


	/**
	 * Returns true if a track and artist match another track and artist closely enough
	 * to be a match (all inputs must be lowercase)
	 * t1 : String 
	 * a1 : String
	 * t2 : String
	 * a2 : String
	 * 
	 * returns boolean
	 */
	validSearch : (t1, a1, t2, a2) => {

		let arr1 = a1.split(", ")
		let arr2 = a2.split(", ")
		let track1 = t1.replace(/[^\x00-\x7F]/g, "") //strip to ascii only
		let track2 = t2.replace(/[^\x00-\x7F]/g, "")
		
		if (arr1.some(a=> arr2.some(a2 => a2.includes(a))) || arr2.some(a=> arr1.some(a2 => a2.includes(a)))){
			if (track1.includes(track2) || track2.includes(track1)){
				return true
			}//potentially add more cases here (some tracks have like (feat., remix, vip etc.))
		}
		
		console.log(" ")
		console.log(["Track and Artists did not match."])
		console.log(arr1, arr2)
		console.log(track1, track2)
		console.log(" ")
		return false


	}





}