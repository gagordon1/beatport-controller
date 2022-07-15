

const sigPrefixLength = 5 // matching prefixes of length sigPrefixLength or 
							//greater can be trusted to be a match
function matchingPrefixes(t1, t2){
	const smaller = t1.length > t2.length? t2 : t1;
	const larger = t1.length > t2.length? t1 : t2;
	if (smaller.length > sigPrefixLength){
		return smaller.slice(0, sigPrefixLength) === larger.slice(0,sigPrefixLength)
	}else{
		return false // not enough data to compare
	}

}

/**
 * Given two arrays of artists, determine if they sufficiently match
 */
const matchingArtists = (arr1, arr2) => {
	return arr1.some(a=> arr2.some(a2 => a2.includes(a))) || arr2.some(a=> arr1.some(a2 => a2.includes(a)))
}

/**
 * Checks if one track includes another and vice versa
 * Next, checks if the first half of the smaller string === the longer's prefix 
 * of the same length
 * If both fail, return false
 */
const matchingTracks = (t1, t2) => {
	if (t1.includes(t2) || t2.includes(t1)){return true}
	else if (matchingPrefixes(t1, t2)){return true}
	else{return false}
}





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

		if ([t1, a1, t2, a2].some(s => s.length === 0)){return false} // make sure they are all non empty

		let arr1 = a1.split(", ")
		let arr2 = a2.split(", ")
		let track1 = t1.replace(/[^\x00-\x7F]/g, "") //strip to ascii only
		let track2 = t2.replace(/[^\x00-\x7F]/g, "")
		
		if (matchingArtists(arr1, arr2)){
			if (matchingTracks(track1,track2)){
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