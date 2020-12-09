let modInfo = {
	name: "The NecromanTree",
	id: "eggbrahamtree",
	author: "eggbraham",
	pointsName: "corpses",
	discordName: "",
	discordLink: "",
	changelogLink: "https://github.com/Acamaeda/The-Modding-Tree/blob/master/changelog.md",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "Nefarious Newborn",
}

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasUpgrade("z", 11)
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints()) { return new Decimal(0) }

	let gain = new Decimal(1)

	if (player.a.unlocked) gain = gain.plus(tmp.a.effect)

	gain = gain.times(tmp.z.effect) 
	if (hasUpgrade("z", 12)) { gain = gain.times(upgradeEffect("z", 12)) }
	if (hasUpgrade("z", 21)) { gain = gain.times(upgradeEffect("z", 21)) }
	if (hasUpgrade("z", 23)) { gain = gain.times(upgradeEffect("z", 23)) }

	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}