addAltNode("mn", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1),             // "points" is the internal name for the main resource of the layer.
        cost: new Decimal(1),
        bought: false,
    }}, 
    color: "#0D58C4",
    fullName: "Master Necromancer",
    fullDesc: function() { return `x${formatWhole(this.effect())} to all previous prestige gains.` },
    effectDesc: function() {
        return ""
    },
    branches: [],
    researchNeeded: [],
    researchCompleted: function() { return true },
    symbol: "MN",
    row: 0,
    position: 0,
    effect() {
        eff = new Decimal(2)
        if (hasUpgrade("n", 14)) {eff = eff.times(2)}
        return eff
    },
    layerShown() { return true },
    canClick: function() { return (getExpPoints().gte(player[this.layer].cost) && !player[this.layer].bought && prereqsPurchased(this.layer) && this.researchCompleted()) },
    onClick() { 
        if (this.canClick) {
            player.p.spent = player.p.spent.plus(player[this.layer].cost)
            player[this.layer].bought = true
        }
    },
    tooltip() { 
        return `${this.fullName}\n\n${this.fullDesc()}\n\n${(this.effectDesc() != "") ? "Currently: " + this.effectDesc() + "\n\n" : ""}${getUnmetReqs(this.layer)}`
    },
    tooltipLocked() { 
        return `${this.fullName}\n\n${this.fullDesc()}\n\n${(this.effectDesc() != "") ? "Currently: " + this.effectDesc() + "\n\n" : ""}${getUnmetReqs(this.layer)}`
    },
}) 

addAltNode("pt", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1),             // "points" is the internal name for the main resource of the layer.
        cost: new Decimal(2),
        bought: false,
    }}, 
    color: "#0D58C4",
    fullName: "Primal Terror",
    fullDesc: function() { return `Add ${formatWhole(this.effect())} to the Fear and Dread exponents.` },
    effectDesc: function() {
        return ""
    },
    researchNeeded: [],
    researchCompleted: function() { return true },
    symbol: "PT",
    branches: ["mn"],
    row: 1,
    position: 0,
    effect() {
        eff = new Decimal(4)
        return eff
    },
    layerShown() { return true },
    canClick: function() { return (getExpPoints().gte(player[this.layer].cost) && !player[this.layer].bought && prereqsPurchased(this.layer) && this.researchCompleted()) },
    onClick() { 
        if (this.canClick) {
            player.p.spent = player.p.spent.plus(player[this.layer].cost)
            player[this.layer].bought = true
        }
    },
    tooltip() { 
        return `${this.fullName}\n\n${this.fullDesc()}\n\n${(this.effectDesc() != "") ? "Currently: " + this.effectDesc() + "\n\n" : ""}${getUnmetReqs(this.layer)}`
    },
    tooltipLocked() { 
        return `${this.fullName}\n\n${this.fullDesc()}\n\n${(this.effectDesc() != "") ? "Currently: " + this.effectDesc() + "\n\n" : ""}${getUnmetReqs(this.layer)}`
    },
}) 

addAltNode("g4", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1),             // "points" is the internal name for the main resource of the layer.
        cost: new Decimal(1),
        bought: false,
    }}, 
    color: "#0D58C4",
    symbol: "g4",
    row: 2,
    position: 1,
    effect() {
        eff = new Decimal(2)
        return eff
    },
    layerShown() { return "ghost" },
    canClick() { return false }, //(player.p.total.minus(player.p.spent)).gte(player.m.cost) },
    onClick() { 
        
    },
    tooltip() { return "Coming soon" },
    tooltipLocked() { return "Coming soon" },
}) 

addAltNode("wd", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1),             // "points" is the internal name for the main resource of the layer.
        cost: new Decimal(3),
        bought: false,
    }}, 
    color: "#0D58C4",
    fullName: "Wisdom & Dishonor",
    fullDesc: function() { return `Unspent experience points boost corpse gain, and sqrt of spent experience points boosts zombie gain.` },
    effectDesc: function() {
        return `${format(this.cEffect())}x to corpse gain and ${format(this.zEffect())}x to zombie gain.`
    },
    researchNeeded: ["n2", 0],
    researchCompleted: function() { return hasMilestone(this.researchNeeded[0], this.researchNeeded[1]) },
    symbol: "WD",
    branches: ["pt"],
    row: 2,
    position: 0,
    
    effExp() {
        exp = new Decimal(2)
        return exp
    },
    effect() {
        eff = new Decimal(10)
        return eff
    },
    cEffect() {
        return this.effect().times(getExpPoints()).pow(this.effExp()).max(1)
    },
    zEffect() {
        return this.effect().times(player.p.spent.sqrt()).pow(this.effExp()).max(1)
    },
    layerShown() { return true },
    canClick: function() { return (getExpPoints().gte(player[this.layer].cost) && !player[this.layer].bought && prereqsPurchased(this.layer) && this.researchCompleted()) },
    onClick() { 
        if (this.canClick) {
            player.p.spent = player.p.spent.plus(player[this.layer].cost)
            player[this.layer].bought = true
        }
    },
    tooltip() { 
        return `${this.fullName}\n\n${this.fullDesc()}\n\n${(this.effectDesc() != "") ? "Currently: " + this.effectDesc() + "\n\n" : ""}${getUnmetReqs(this.layer)}`
    },
    tooltipLocked() { 
        return `${this.fullName}\n\n${this.fullDesc()}\n\n${(this.effectDesc() != "") ? "Currently: " + this.effectDesc() + "\n\n" : ""}${getUnmetReqs(this.layer)}`
    },
}) 


addAltNode("pp", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1),             // "points" is the internal name for the main resource of the layer.
        cost: new Decimal(3),
        bought: false,
    }}, 
    color: "#0D58C4",
    fullName: "Putrid Pathfinders",
    fullDesc: function() { return `Pestilence and puissance boost each others' gains.` },
    effectDesc: function() {
        return `${format(tmp["pp"].ptEffect)}x to pestilence and ${format(tmp["pp"].psEffect)}x to puissance.`
    },
    researchNeeded: ["n2", 0],
    researchCompleted: function() { return hasMilestone(this.researchNeeded[0], this.researchNeeded[1]) },
    symbol: "PP",
    branches: ["pt"],
    row: 2,
    position: 2,
    effect() {
        eff = new Decimal(10)
        return eff
    },
    ptEffect() {
        eff = player["n"]["12"]
        eff = eff.sqrt().times(player["n"]["12"].min(tmp["pp"].effect)).div(3).max(1)
        if (player.pd.bought) { eff = eff.times(tmp["pd"].effect) }
        return eff
    },
    psEffect() {
        eff = player["n"]["11"]
        eff = eff.sqrt().times(player["n"]["11"].min(tmp["pp"].effect)).div(3).max(1)
        if (player.pd.bought) { eff = eff.times(tmp["pd"].effect) }
        return eff
    },
    layerShown() { return true },
    canClick: function() { return (getExpPoints().gte(player[this.layer].cost) && !player[this.layer].bought && prereqsPurchased(this.layer) && this.researchCompleted()) },
    onClick: function() { 
        if (this.canClick) {
            player.p.spent = player.p.spent.plus(player[this.layer].cost)
            player[this.layer].bought = true
        }
    },
    tooltip() { 
        return `${this.fullName}\n\n${this.fullDesc()}\n\n${(this.effectDesc() != "") ? "Currently: " + this.effectDesc() + "\n\n" : ""}${getUnmetReqs(this.layer)}`
    },
    tooltipLocked() { 
        return `${this.fullName}\n\n${this.fullDesc()}\n\n${(this.effectDesc() != "") ? "Currently: " + this.effectDesc() + "\n\n" : ""}${getUnmetReqs(this.layer)}`
    },
}) 

addAltNode("fl", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1),             // "points" is the internal name for the main resource of the layer.
        cost: new Decimal(6),
        bought: false,
    }}, 
    color: "#0D58C4",
    fullName: "Feedback Loop",
    fullDesc: function() { return `Unspent mana boosts corpse gain.` },
    effectDesc: function() {
        return `${format(tmp[this.layer].effect)}x`
    },
    researchNeeded: ["n1", 2],
    researchCompleted: function() { return hasMilestone(this.researchNeeded[0], this.researchNeeded[1]) },
    symbol: "FL",
    branches: ["wd"],
    row: 3,
    position: 0,
    effExp() {
        exp = new Decimal(8)
        return exp
    },
    effect() {
        eff = player.s.power
        eff = eff.log10().pow(tmp[this.layer].effExp.pow(0.9))
        return eff.max(1)
    },
    layerShown() { return true },
    canClick: function() { return (getExpPoints().gte(player[this.layer].cost) && !player[this.layer].bought && prereqsPurchased(this.layer) && this.researchCompleted()) },
    onClick() { 
        if (this.canClick) {
            player.p.spent = player.p.spent.plus(player[this.layer].cost)
            player[this.layer].bought = true
        }
    },
    tooltip() { 
        return `${this.fullName}\n\n${this.fullDesc()}\n\n${(this.effectDesc() != "") ? "Currently: " + this.effectDesc() + "\n\n" : ""}${getUnmetReqs(this.layer)}`
    },
    tooltipLocked() { 
        return `${this.fullName}\n\n${this.fullDesc()}\n\n${(this.effectDesc() != "") ? "Currently: " + this.effectDesc() + "\n\n" : ""}${getUnmetReqs(this.layer)}`
    },
}) 

addAltNode( "h1", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1),             // "points" is the internal name for the main resource of the layer.
        cost: new Decimal(1),
        bought: false,
    }}, 
    color: "#0D58C4",
    symbol: "h1",
    row: 3,
    position: 1,
    canClick() { return false },
    layerShown() { return "ghost" },
})

addAltNode("pd", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1),             // "points" is the internal name for the main resource of the layer.
        cost: new Decimal(12),
        bought: false,
    }}, 
    color: "#0D58C4",
    fullName: "Putrid Dishonor",
    fullDesc: function() { return `Multiply the effects of both second row skills by ${formatWhole(tmp[this.layer].effect)}.` },
    effectDesc: function() {
        return ""
    },
    researchNeeded: ["n1", 2],
    researchCompleted: function() { return hasMilestone(this.researchNeeded[0], this.researchNeeded[1]) },
    symbol: "PD",
    branches: ["wd", "pp"],
    row: 3,
    position: 2,
    effect() {
        eff = new Decimal(100)
        return eff
    },
    layerShown() { return true },
    canClick: function() { return (getExpPoints().gte(player[this.layer].cost) && !player[this.layer].bought && prereqsPurchased(this.layer) && this.researchCompleted()) },
    onClick() { 
        if (this.canClick) {
            player.p.spent = player.p.spent.plus(player[this.layer].cost)
            player[this.layer].bought = true
        }
    },
    tooltip() { 
        return `${this.fullName}\n\n${this.fullDesc()}\n\n${(this.effectDesc() != "") ? "Currently: " + this.effectDesc() + "\n\n" : ""}${getUnmetReqs(this.layer)}`
    },
    tooltipLocked() { 
        return `${this.fullName}\n\n${this.fullDesc()}\n\n${(this.effectDesc() != "") ? "Currently: " + this.effectDesc() + "\n\n" : ""}${getUnmetReqs(this.layer)}`
    },
}) 

addAltNode( "h2", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1),             // "points" is the internal name for the main resource of the layer.
        cost: new Decimal(1),
        bought: false,
    }}, 
    color: "#0D58C4",
    symbol: "h2",
    row: 3,
    position: 3,
    canClick() { return false },
    layerShown() { return "ghost" },
})

addAltNode("fc", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1),             // "points" is the internal name for the main resource of the layer.
        cost: new Decimal(8),
        bought: false,
    }}, 
    color: "#0D58C4",
    fullName: "First Class",
    fullDesc: function() { return `The puissance effect also affects research gain.` },
    effectDesc: function() {
        return `${format(tmp[this.layer].effect)}x`
    },
    researchNeeded: ["n1", 2],
    researchCompleted: function() { return hasMilestone(this.researchNeeded[0], this.researchNeeded[1]) },
    symbol: "FC",
    branches: ["pp"],
    row: 3,
    position: 4,
    effect() {
        eff = tmp["n"].puisEffect
        return eff
    },
    layerShown() { return true },
    canClick: function() { return (getExpPoints().gte(player[this.layer].cost) && !player[this.layer].bought && prereqsPurchased(this.layer) && this.researchCompleted()) },
    onClick() { 
        if (this.canClick) {
            player.p.spent = player.p.spent.plus(player[this.layer].cost)
            player[this.layer].bought = true
        }
    },
    tooltip() { 
        return `${this.fullName}\n\n${this.fullDesc()}\n\n${(this.effectDesc() != "") ? "Currently: " + this.effectDesc() + "\n\n" : ""}${getUnmetReqs(this.layer)}`
    },
    tooltipLocked() { 
        return `${this.fullName}\n\n${this.fullDesc()}\n\n${(this.effectDesc() != "") ? "Currently: " + this.effectDesc() + "\n\n" : ""}${getUnmetReqs(this.layer)}`
    },
}) 