let modInfo = {
	name: "The NecromanTree",
	id: "eggbrahamtree",
	author: "eggbraham",
	pointsName: "corpses",
	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.3.0",
	name: "Terrible Teen",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

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
	if (hasUpgrade("f", 11) || hasUpgrade("a", 11)) { gain = gain.plus(1) }

	if (player.a.unlocked) gain = gain.times(tmp.a.effect)

	if (player.z.points.gt(0)) gain = gain.times(tmp.z.effect) 
	if (hasUpgrade("z", 12)) { gain = gain.times(upgradeEffect("z", 12)) }
	if (hasUpgrade("z", 21)) { gain = gain.times(upgradeEffect("z", 21)) }
	if (hasUpgrade("z", 23)) { gain = gain.times(upgradeEffect("z", 23)) }
	if (hasUpgrade("a", 14)) { gain = gain.times(upgradeEffect("a", 14)) }
	if (hasUpgrade("a", 24)) { gain = gain.times(upgradeEffect("a", 24)) }
	if (hasUpgrade("f", 24)) { gain = gain.times(upgradeEffect("f", 24)) }
	if (player.wd.bought) { gain = gain.times(tmp["wd"].effect) }
	if (player.n[11].gt(0)) { gain = gain.times(tmp["n"].pestEffect) }
	if (getBuyableAmount("s", 11)) { gain = gain.times(buyableEffect("s", 11)) }
	if (player.fl.bought) { gain = gain.times(tmp["fl"].effect) }

	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	pastMilestones: {},
	devSpeed: 1,
	bestPoints: new Decimal(0),
}}

// Display extra things at the top of the page
var displayThings = [
	"Current endgame: 15 total exterminated planets"
]

// Determines when the game "ends"
function isEndgame() {
	return player.p.total.gte(new Decimal(15))
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