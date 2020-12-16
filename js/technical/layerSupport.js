var layers = {}
var altLayers = {}

const decimalZero = new Decimal(0)
const decimalOne = new Decimal(1)
const decimalNaN = new Decimal(NaN)

function layerShown(layer){
    return tmp[layer].layerShown;
}

var LAYERS = Object.keys(layers);
var ALTLAYERS = Object.keys(altLayers);

var hotkeys = {};

var maxRow = 0;

function updateHotkeys()
{
    hotkeys = {};
    for (layer in layers){
        hk = layers[layer].hotkeys
        if (hk){
            for (id in hk){
				hotkeys[hk[id].key] = hk[id]
                hotkeys[hk[id].key].layer = layer
                hotkeys[hk[id].key].id = id
                if (hk[id].unlocked === undefined)
                    hk[id].unlocked = true
            }
        }
    }
}

var ROW_LAYERS = {}
var TREE_LAYERS = {}
var OTHER_LAYERS = {}

var ALT_ROW_LAYERS = {}
var ALT_TREE_LAYERS = {}
var ALT_OTHER_LAYERS = {}

function updateLayers(){
    LAYERS = Object.keys(layers);
    ROW_LAYERS = {}
    TREE_LAYERS = {}
    OTHER_LAYERS = {}
    for (layer in layers){
        setupLayer(layer)
    }
    for (row in OTHER_LAYERS) {
        OTHER_LAYERS[row].sort((a, b) => (a.position > b.position) ? 1 : -1)
        for (layer in OTHER_LAYERS[row])
            OTHER_LAYERS[row][layer] = OTHER_LAYERS[row][layer].layer 
    }
    for (row in TREE_LAYERS) {
        TREE_LAYERS[row].sort((a, b) => (a.position > b.position) ? 1 : -1)
            for (layer in TREE_LAYERS[row])
            TREE_LAYERS[row][layer] = TREE_LAYERS[row][layer].layer
    }
    let treeLayers2 = []
    for (x = 0; x < maxRow + 1; x++) {
        if (TREE_LAYERS[x]) treeLayers2.push(TREE_LAYERS[x])
    }
    TREE_LAYERS = treeLayers2
    updateHotkeys()
}

function setupLayer(layer){
    layers[layer].layer = layer
    if (layers[layer].upgrades){
        for (thing in layers[layer].upgrades){
            if (!isNaN(thing)){
                layers[layer].upgrades[thing].id = thing
                layers[layer].upgrades[thing].layer = layer
                if (layers[layer].upgrades[thing].unlocked === undefined)
                    layers[layer].upgrades[thing].unlocked = true
            }
        }
    }
    if (layers[layer].milestones){
        for (thing in layers[layer].milestones){
            if (!isNaN(thing)){
                layers[layer].milestones[thing].id = thing
                layers[layer].milestones[thing].layer = layer
                if (layers[layer].milestones[thing].unlocked === undefined)
                    layers[layer].milestones[thing].unlocked = true
            }
        }
    }
    if (layers[layer].achievements){
        for (thing in layers[layer].achievements){
            if (!isNaN(thing)){
                layers[layer].achievements[thing].id = thing
                layers[layer].achievements[thing].layer = layer
                if (layers[layer].achievements[thing].unlocked === undefined)
                    layers[layer].achievements[thing].unlocked = true
            }
        }
    }
    if (layers[layer].challenges){
        for (thing in layers[layer].challenges){
            if (!isNaN(thing)){
                layers[layer].challenges[thing].id = thing
                layers[layer].challenges[thing].layer = layer
                if (layers[layer].challenges[thing].unlocked === undefined)
                    layers[layer].challenges[thing].unlocked = true
                if (layers[layer].challenges[thing].completionLimit === undefined)
                    layers[layer].challenges[thing].completionLimit = 1

            }
        }
    }
    if (layers[layer].buyables){
        layers[layer].buyables.layer = layer
        for (thing in layers[layer].buyables){
            if (!isNaN(thing)){
                layers[layer].buyables[thing].id = thing
                layers[layer].buyables[thing].layer = layer
                if (layers[layer].buyables[thing].unlocked === undefined)
                    layers[layer].buyables[thing].unlocked = true
            }
        }  
    }

    if (layers[layer].clickables){
        layers[layer].clickables.layer = layer
        for (thing in layers[layer].clickables){
            if (!isNaN(thing)){
                layers[layer].clickables[thing].id = thing
                layers[layer].clickables[thing].layer = layer
                if (layers[layer].clickables[thing].unlocked === undefined)
                    layers[layer].clickables[thing].unlocked = true
            }
        }  
    }

    if (layers[layer].bars){
        layers[layer].bars.layer = layer
        for (thing in layers[layer].bars){
            layers[layer].bars[thing].id = thing
            layers[layer].bars[thing].layer = layer
            if (layers[layer].bars[thing].unlocked === undefined)
                layers[layer].bars[thing].unlocked = true
        }  
    }

    if (layers[layer].infoboxes){
        for (thing in layers[layer].infoboxes){
            layers[layer].infoboxes[thing].id = thing
            layers[layer].infoboxes[thing].layer = layer
            if (layers[layer].infoboxes[thing].unlocked === undefined)
                layers[layer].infoboxes[thing].unlocked = true
        }  
    }
    
    if (layers[layer].startData) {
        data = layers[layer].startData()
        if (data.best !== undefined && data.showBest === undefined) layers[layer].showBest = true
        if (data.total !== undefined && data.showTotal === undefined) layers[layer].showTotal = true
    }

    if(!layers[layer].componentStyles) layers[layer].componentStyles = {}
    if(layers[layer].symbol === undefined) layers[layer].symbol = layer.charAt(0).toUpperCase() + layer.slice(1)
    if(layers[layer].unlockOrder === undefined) layers[layer].unlockOrder = new Decimal(0)
    if(layers[layer].gainMult === undefined) layers[layer].gainMult = new Decimal(1)
    if(layers[layer].gainExp === undefined) layers[layer].gainExp = new Decimal(1)
    if(layers[layer].type === undefined) layers[layer].type = "none"
    if(layers[layer].base === undefined || layers[layer].base <= 1) layers[layer].base = 2
    // if(layers[layer].softcap === undefined) layers[layer].softcap = new Decimal("e1e7")
    // if(layers[layer].softcapPower === undefined) layers[layer].softcapPower = new Decimal("0.5")
    if(layers[layer].displayRow === undefined) layers[layer].displayRow = layers[layer].row
    if(layers[layer].altResource === undefined) layers[layer].altResource = "none"
    if(layers[layer].name === undefined) layers[layer].name = layer
    if(layers[layer].layerShown === undefined) layers[layer].layerShown = true

    let row = layers[layer].row

    let displayRow = layers[layer].displayRow

    if(!ROW_LAYERS[row]) ROW_LAYERS[row] = {}
    if(!TREE_LAYERS[displayRow] && !isNaN(displayRow)) TREE_LAYERS[displayRow] = []
    if(!OTHER_LAYERS[displayRow] && isNaN(displayRow)) OTHER_LAYERS[displayRow] = []

    ROW_LAYERS[row][layer]=layer;
    let position = (layers[layer].position !== undefined ? layers[layer].position : layer)
    
    if (!isNaN(displayRow)) TREE_LAYERS[displayRow].push({layer: layer, position: position})
    else OTHER_LAYERS[displayRow].push({layer: layer, position: position})

    if (maxRow < layers[layer].displayRow) maxRow = layers[layer].displayRow
    
}

function updateAltLayers(){
    ALTLAYERS = Object.keys(altLayers);
    ALT_ROW_LAYERS = {}
    ALT_TREE_LAYERS = {}
    ALT_OTHER_LAYERS = {}
    for (layer in altLayers){
        setupAltLayer(layer)
    }
    for (row in ALT_OTHER_LAYERS) {
        ALT_OTHER_LAYERS[row].sort((a, b) => (a.position > b.position) ? 1 : -1)
        for (layer in ALT_OTHER_LAYERS[row])
            ALT_OTHER_LAYERS[row][layer] = ALT_OTHER_LAYERS[row][layer].layer 
    }
    for (row in ALT_TREE_LAYERS) {
        ALT_TREE_LAYERS[row].sort((a, b) => (a.position > b.position) ? 1 : -1)
            for (layer in ALT_TREE_LAYERS[row])
            ALT_TREE_LAYERS[row][layer] = ALT_TREE_LAYERS[row][layer].layer
    }
    let treeLayers2 = []
    for (x = 0; x < maxRow + 1; x++) {
        if (ALT_TREE_LAYERS[x]) treeLayers2.push(ALT_TREE_LAYERS[x])
    }
    ALT_TREE_LAYERS = treeLayers2
    updateHotkeys()
}

function setupAltLayer(layer){
    altLayers[layer].layer = layer
    if (altLayers[layer].upgrades){
        for (thing in altLayers[layer].upgrades){
            if (!isNaN(thing)){
                altLayers[layer].upgrades[thing].id = thing
                altLayers[layer].upgrades[thing].layer = layer
                if (altLayers[layer].upgrades[thing].unlocked === undefined)
                    altLayers[layer].upgrades[thing].unlocked = true
            }
        }
    }
    if (altLayers[layer].milestones){
        for (thing in altLayers[layer].milestones){
            if (!isNaN(thing)){
                altLayers[layer].milestones[thing].id = thing
                altLayers[layer].milestones[thing].layer = layer
                if (altLayers[layer].milestones[thing].unlocked === undefined)
                    altLayers[layer].milestones[thing].unlocked = true
            }
        }
    }
    if (altLayers[layer].achievements){
        for (thing in altLayers[layer].achievements){
            if (!isNaN(thing)){
                altLayers[layer].achievements[thing].id = thing
                altLayers[layer].achievements[thing].layer = layer
                if (altLayers[layer].achievements[thing].unlocked === undefined)
                    altLayers[layer].achievements[thing].unlocked = true
            }
        }
    }
    if (altLayers[layer].challenges){
        for (thing in altLayers[layer].challenges){
            if (!isNaN(thing)){
                altLayers[layer].challenges[thing].id = thing
                altLayers[layer].challenges[thing].layer = layer
                if (altLayers[layer].challenges[thing].unlocked === undefined)
                    altLayers[layer].challenges[thing].unlocked = true
                if (altLayers[layer].challenges[thing].completionLimit === undefined)
                    altLayers[layer].challenges[thing].completionLimit = 1

            }
        }
    }
    if (altLayers[layer].buyables){
        altLayers[layer].buyables.layer = layer
        for (thing in altLayers[layer].buyables){
            if (!isNaN(thing)){
                altLayers[layer].buyables[thing].id = thing
                altLayers[layer].buyables[thing].layer = layer
                if (altLayers[layer].buyables[thing].unlocked === undefined)
                    altLayers[layer].buyables[thing].unlocked = true
            }
        }  
    }

    if (altLayers[layer].clickables){
        altLayers[layer].clickables.layer = layer
        for (thing in altLayers[layer].clickables){
            if (!isNaN(thing)){
                altLayers[layer].clickables[thing].id = thing
                altLayers[layer].clickables[thing].layer = layer
                if (altLayers[layer].clickables[thing].unlocked === undefined)
                    altLayers[layer].clickables[thing].unlocked = true
            }
        }  
    }

    if (altLayers[layer].bars){
        altLayers[layer].bars.layer = layer
        for (thing in altLayers[layer].bars){
            altLayers[layer].bars[thing].id = thing
            altLayers[layer].bars[thing].layer = layer
            if (altLayers[layer].bars[thing].unlocked === undefined)
                altLayers[layer].bars[thing].unlocked = true
        }  
    }

    if (altLayers[layer].infoboxes){
        for (thing in altLayers[layer].infoboxes){
            altLayers[layer].infoboxes[thing].id = thing
            altLayers[layer].infoboxes[thing].layer = layer
            if (altLayers[layer].infoboxes[thing].unlocked === undefined)
                altLayers[layer].infoboxes[thing].unlocked = true
        }  
    }
    
    if (altLayers[layer].startData) {
        data = altLayers[layer].startData()
        if (data.best !== undefined && data.showBest === undefined) altLayers[layer].showBest = true
        if (data.total !== undefined && data.showTotal === undefined) altLayers[layer].showTotal = true
    }

    if(!altLayers[layer].componentStyles) altLayers[layer].componentStyles = {}
    if(altLayers[layer].symbol === undefined) altLayers[layer].symbol = layer.charAt(0).toUpperCase() + layer.slice(1)
    if(altLayers[layer].unlockOrder === undefined) altLayers[layer].unlockOrder = new Decimal(0)
    if(altLayers[layer].gainMult === undefined) altLayers[layer].gainMult = new Decimal(1)
    if(altLayers[layer].gainExp === undefined) altLayers[layer].gainExp = new Decimal(1)
    if(altLayers[layer].type === undefined) altLayers[layer].type = "none"
    if(altLayers[layer].base === undefined || altLayers[layer].base <= 1) altLayers[layer].base = 2
    // if(altLayers[layer].softcap === undefined) altLayers[layer].softcap = new Decimal("e1e7")
    // if(altLayers[layer].softcapPower === undefined) altLayers[layer].softcapPower = new Decimal("0.5")
    if(altLayers[layer].displayRow === undefined) altLayers[layer].displayRow = altLayers[layer].row
    if(altLayers[layer].altResource === undefined) altLayers[layer].altResource = "none"
    if(altLayers[layer].name === undefined) altLayers[layer].name = layer
    if(altLayers[layer].layerShown === undefined) altLayers[layer].layerShown = true

    let row = altLayers[layer].row

    let displayRow = altLayers[layer].displayRow

    if(!ALT_ROW_LAYERS[row]) ALT_ROW_LAYERS[row] = {}
    if(!ALT_TREE_LAYERS[displayRow] && !isNaN(displayRow)) ALT_TREE_LAYERS[displayRow] = []
    if(!ALT_OTHER_LAYERS[displayRow] && isNaN(displayRow)) ALT_OTHER_LAYERS[displayRow] = []

    ALT_ROW_LAYERS[row][layer]=layer;
    let position = (altLayers[layer].position !== undefined ? altLayers[layer].position : layer)
    
    if (!isNaN(displayRow)) ALT_TREE_LAYERS[displayRow].push({layer: layer, position: position})
    else ALT_OTHER_LAYERS[displayRow].push({layer: layer, position: position})

    if (maxRow < altLayers[layer].displayRow) maxRow = altLayers[layer].displayRow
    
}


function addLayer(layerName, layerData, tabLayers = null){ // Call this to add layers from a different file!
    layers[layerName] = layerData
    layers[layerName].isLayer = true
    if (tabLayers !== null)
    {
        let format = {}
        for (id in tabLayers) {
            layer = tabLayers[id]
            format[(layers[layer].name ? layers[layer].name : layer)] = {
                embedLayer: layer,
                buttonStyle() {
                    if (!tmp[this.embedLayer].nodeStyle) return {'border-color': tmp[this.embedLayer].color}
                    else {
                        style = tmp[this.embedLayer].nodeStyle
                        if (style['border-color'] === undefined) style['border-color'] = tmp[this.embedLayer].color
                        return style
                    } 
                },
                unlocked() {return tmp[this.embedLayer].layerShown},
            }       
        }
        layers[layerName].tabFormat = format
    }
}

function addNode(layerName, layerData){ // Does the same thing, but for non-layer nodes
    layers[layerName] = layerData
    layers[layerName].isLayer = false
}

function addAltNode(layerName, layerData){
    altLayers[layerName] = layerData
    altLayers[layerName].isLayer = false
}

// If data is a function, return the result of calling it. Otherwise, return the data.
function readData(data, args=null){
	if ((!!data && data.constructor && data.call && data.apply))
		return data(args);
	else
		return data;
}

function someLayerUnlocked(row){
    for (layer in ROW_LAYERS[row])
        if (player[layer].unlocked)
            return true
    return false
}


// This isn't worth making a .ts file over
const UP = 0
const DOWN = 1
const LEFT = 2
const RIGHT = 3


addLayer("info-tab", {
    tabFormat: ["info-tab"],
    row: "otherside"
})

addLayer("options-tab", {
    tabFormat: ["options-tab"],
    row: "otherside"
})

addLayer("changelog-tab", {
    tabFormat() {return ([["raw-html", modInfo.changelog]])},
    row: "otherside"
})