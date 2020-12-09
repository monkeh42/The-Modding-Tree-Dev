addLayer("z", {
    name: "zombies", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Z", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    resetDescription: "Stitch corpses together for ",
    color: "#5E1849",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "zombies", // Name of prestige currency
    baseResource: "corpses", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("z", 22)) { mult = mult.times(upgradeEffect("z", 22)) }
        if (hasUpgrade("z", 31)) { mult = mult.times(upgradeEffect("z", 31)) }
        if (hasUpgrade("a", 11)) { mult = mult.times(upgradeEffect("a", 11)) }
        if (hasUpgrade("f", 11)) { mult = mult.times(upgradeEffect("f", 11)) }
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (hasUpgrade("z", 33)) { exp = exp.plus(upgradeEffect("z", 33)) }
        return exp
    },
    effectExp() {
        let exp = new Decimal(0.5)
        if (hasUpgrade("z", 13)) { exp = exp.plus(upgradeEffect("z", 13)) }
        return exp
    },
    effectBase() {
        let eff = new Decimal(1)
        if (hasUpgrade("z", 32)) { eff = eff.plus(upgradeEffect("z", 32)) } 
        return eff
    },
    effect() {
        let eff = tmp.z.effectBase.plus(player.z.points).pow(tmp.z.effectExp) 
        if (player.f.unlocked && player.z.points.gt(0)) eff = eff.times(tmp.f.powerEff)
        return eff
    },
    effectDescription() { return "which are boosting corpse gain by "+format(tmp.z.effect)+"x" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "z", description: "z: stitch your corpses into zombies", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return true },
    passiveGeneration() { return hasMilestone("a", 1)?0.1:0 },
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("a", 0) && resettingLayer=="a") keep.push("upgrades")
        if (hasMilestone("f", 0) && resettingLayer=="f") keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("z", keep)
    },
    upCostMult: new Decimal(1),
    upgrades: {
        rows: 3,
        cols: 3,
        11: {
            title: "Begin Harvest",
            description: "Send your zombies into the world to harvest corpses. Base 1/sec, boosted slightly by zombies.",
            cost() { return tmp.z.upCostMult.times(1) },
        },
        12: {
            title: "Disease",
            description: "Gain more corpses the more corpses you have.",
            cost() { return tmp.z.upCostMult.times(1) },
            unlocked() { return hasUpgrade("z", 11) },
            effect() { 
                let eff = player.points.plus(1).log10().pow(0.75).plus(1) 
                return eff
            },
            effectDisplay() { return format(tmp.z.upgrades[12].effect)+"x" },
        },
        13: {
            title: "Bigger Zombies",
            description: "Zombies are more effective to corpse gain.",
            cost() { return tmp.z.upCostMult.times(5) },
            unlocked() { return hasUpgrade("z", 12) },
            effect() { 
                let eff = new Decimal(0.2)
                return eff
            },
            effectDisplay() { return "+"+format(tmp.z.upgrades[13].effect)+" to effect exponent" },
        },
        21: {
            title: "Wheelbarrows",
            description: "Recover more intact corpses. Doubles corpse gain.",
            cost() { return tmp.z.upCostMult.times(15) },
            unlocked() { return player.a.unlocked || player.f.unlocked },
            effect() { 
                let eff = new Decimal(2)
                return eff
            },
        },
        22: {
            title: "Advanced Necromancy",
            description: "Learn more efficient zombie creation techniques. Doubles zombie gain.",
            cost() { return tmp.z.upCostMult.times(40) },
            unlocked () { return hasUpgrade("z", 21) },
            effect() { 
                let eff = new Decimal(2)
                return eff
            },
        },
        23: {
            title: "Zombie Training School",
            description: "Boost corpse gain based on zombie upgrades purchased.",
            cost() { return tmp.z.upCostMult.times(100) },
            unlocked () { return hasUpgrade("z", 22) },
            effect() { 
                let eff = Decimal.pow(1.5, player.z.upgrades.length)
                return eff
            },
            effectDisplay() { return format(tmp.z.upgrades[23].effect)+"x" },
        }, 
        31: {
            title: "Practice Makes Perfect",
            description: "Boost zombie gain based on total zombies made.",
            cost() { return tmp.z.upCostMult.times(500) },
            unlocked () { return player.a.unlocked && player.f.unlocked },
            effect() { 
                let eff = player.z.total.plus(1).log10().plus(1).pow(0.5).plus(1)
                return eff
            },
            effectDisplay() { return format(tmp.z.upgrades[31].effect)+"x" },
        },
        32: {
            title: "Morale Boost",
            description: "Boost zombie effectiveness based on abominations.",
            cost() { return tmp.z.upCostMult.times(1000) },
            unlocked () { return hasUpgrade("z", 31) },
            effect() { 
                let eff = player.a.points.plus(1).log10().plus(1)
                return eff
            },
            effectDisplay() { return "+"+format(tmp.z.upgrades[32].effect)+" to effect base" },
        }, 
        33: {
            title: "Zombie Fabricators",
            description: "Boost zombie gain based on death factories.",
            cost() { return tmp.z.upCostMult.times(1000) },
            unlocked () { return hasUpgrade("z", 31) },
            effect() { 
                let eff = player.a.points.plus(1).log10().div(5)
                return eff
            },
            effectDisplay() { return "+"+format(tmp.z.upgrades[33].effect)+" to gain exponent" },
        }, 
    },
    
})

addLayer("a", {
    name: "abominations", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        // unlockOrder: new Decimal(0),
    }},
    increaseUnlockOrder: ["f"],
    resetDescription: "Amalgamate zombies for ",
    branches: ["z"],
    color: "#C7002A",
    requires() { return new Decimal(10).times((tmp["a"].unlockOrder && !player.a.unlocked)?100:1) }, // Can be a function that takes requirement increases into account
    resource: "abominations", // Name of prestige currency
    baseResource: "zombies", // Name of resource prestige is based on
    baseAmount() {return player.z.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.25, // Prestige currency exponent
    base: 4,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("f", 12)) { mult = mult.times(upgradeEffect("f", 12)) }
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    /* scThresh() {
        thr = new Decimal(25)
        return thr
    },
    scExp() {
        exp = new Decimal(0.5)
        return exp
    }, */
    effectExp() {
        exp = new Decimal(0.75)
        
        return exp
    },
    effect() {
        eff = player.a.points
        // if (eff.gt(this.scThresh)) eff = eff.minus(this.scThresh).pow(this.scExp).plus(this.scThresh)
        eff = eff.pow(this.effectExp())
        if (hasMilestone("f", 1)) eff = eff.times(tmp.f.powerEff.pow(0.5))
        return eff
    },
    effectDescription() { return "which are giving +"+format(tmp.a.effect)+" to base corpse gain" },
    canBuyMax() { return hasMilestone("a", 2) },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "a: amalgamate your zombies into abominations", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return player.z.unlocked },
    upCostMult: new Decimal(1),
    upgrades: {
        rows: 2,
        cols: 4,
        11: {
            title: "Recycle Leftover Parts",
            description: "Total abominations boost zombie gain.",
            cost() { return tmp.a.upCostMult.times(2) },
            effect() {
                eff = player.a.best.sqrt().plus(2)
                return eff
            },
            effectDisplay() { return format(tmp.a.upgrades[11].effect)+"x" },
        },
        12: {
            title: "Part Time Job",
            description: "Abominations boost armament production.",
            cost() { return tmp.a.upCostMult.times(4) },
            effect() {
                eff = player.a.points.plus(2).log10().sqrt().div(3)
                return eff
            },
            effectDisplay() { return "+"+format(tmp.a.upgrades[12].effect)+" to base production" },
        },
    }, 
    milestones: {
        0: {
            requirementDescription: "5 abominations",
            done() { return player.a.best.gte(5) },
            effectDescription: "Keep zombie upgrades on reset",
        },
        1: {
            requirementDescription: "10 abominations",
            done() { return player.a.best.gte(10) },
            effectDescription: "Gain 10% of zombie gain per second",
        },
        2: {
            requirementDescription: "15 abominations",
            done() { return player.a.best.gte(15) },
            effectDescription: "You can buy max abominations",
        },
    },
})

addLayer("f", {
    name: "death factory", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        power: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        // unlockOrder: new Decimal(0),
    }},
    increaseUnlockOrder: ["a"],
    resetDescription: "Reanimate corpses to operate ",
    branches: ["z"],
    color: "#C7002A",
    requires() { return new Decimal(200).times((tmp["f"].unlockOrder && !player.f.unlocked)?5000:1) }, // Can be a function that takes requirement increases into account
    resource: "death factories", // Name of prestige currency
    baseResource: "corpses", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.25, // Prestige currency exponent
    base: 5,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effBase() {
        base = new Decimal(2)
        if(hasUpgrade("a", 12)) base = base.plus(upgradeEffect("a", 12))

        return base
    },
    effect() {
        eff = Decimal.pow(this.effBase(), player.f.points).sub(1).max(0)

        return eff
    },
    update(diff) {
        if (player.f.unlocked) player.f.power = player.f.power.plus(tmp.f.effect.times(diff))
    },
    powerExp() {
        exp = new Decimal(0.25)

        return exp
    },
    powerEff() {
        return player.f.power.plus(1).pow(this.powerExp()).div(2)
    },
    effectDescription() { 
        return "which are manufacturing "+format(tmp.f.effect)+" armaments/sec" //+(tmp.nerdMode?("\n ("+format(tmp.g.effBase)+"x each)"):"") 
    },
    tabFormat: ["main-display",
		"prestige-button",
		"blank",
		["display-text",
			function() {return 'You have ' + format(player.f.power) + ' armaments, which multiplies the zombie effect by '+format(tmp.f.powerEff)+'x'}, {}],
		"blank",
		["display-text",
			function() {return 'Your best armaments is ' + formatWhole(player.f.best) + '<br>You have made a total of '+formatWhole(player.f.total)+" armaments."}, {}],
		"blank",
		"milestones", "blank", "blank", "upgrades"],
    canBuyMax() { return hasMilestone("f", 2) },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "f", description: "f: reanimate corpses to operate death factories", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return player.z.unlocked },
    upCostMult: new Decimal(1), 
    upgrades: {
        rows: 2,
        cols: 4,
        11: {
            title: "Corpse Processing Facility",
            description: "Death factories boost zombie gain.",
            cost() { return tmp.f.upCostMult.times(2) },
            effect() {
                eff = player.f.points.plus(1).pow(1/3)
                return eff
            },
            effectDisplay() { return format(tmp.f.upgrades[11].effect)+"x" },
        },
        12: {
            title: "Zombie Processing Facility",
            description: "Death factories boost abomination gain.",
            cost() { return tmp.f.upCostMult.times(4) },
            effect() {
                let eff = player.f.total.plus(1).log10().plus(1)
                return eff
            },
            effectDisplay() { return format(tmp.f.upgrades[12].effect)+"x" },
        },
    }, 
    milestones: {
        0: {
            requirementDescription: "5 death factories",
            done() { return player.f.best.gte(5) },
            effectDescription: "Keep zombie upgrades on reset",
        },
        1: {
            requirementDescription: "10 death factories",
            done() { return player.f.best.gte(10) },
            effectDescription: "Armaments also affect abominations with reduced effect",
        },
        2: {
            requirementDescription: "15 death factories",
            done() { return player.f.best.gte(15) },
            effectDescription: "You can buy max death factories",
        },
    },
})