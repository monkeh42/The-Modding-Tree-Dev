addLayer("z", {
    name: "zombies", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Z", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
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
        if (hasUpgrade("a", 12)) { mult = mult.times(upgradeEffect("a", 12)) }
        if (hasUpgrade("f", 12)) { mult = mult.times(upgradeEffect("f", 12)) }
        if (hasUpgrade("f", 22)) { mult = mult.times(upgradeEffect("f", 22)) }
        if (hasUpgrade("a", 21)) { mult = mult.times(upgradeEffect("a", 21)) }
        if (player.m.bought) { mult = mult.times(2) }
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
        if (hasMilestone("p", 1) && resettingLayer=="p") keep.push("upgrades")
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
                if (hasUpgrade("a", 23)) eff = eff.pow(upgradeEffect("a", 23))
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
                if (hasUpgrade("f", 23)) eff = eff.plus(0.1)
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
                let eff = Decimal.pow(1.5, player.z.upgrades.length).div(1.75)
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
                let eff = player.z.total.plus(1).log10().plus(1).pow(0.5).minus(1).max(1)
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
                let eff = player.a.points.plus(1).log10().div(10)
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
        unlockOrder: new Decimal(0),
    }},
    increaseUnlockOrder: ["f"],
    resetDescription: "Amalgamate zombies for ",
    branches: ["z"],
    color: "#C7002A",
    requires() { 
        if(player.m.bought) { return new Decimal(10).times((player.a.unlockOrder.neq(new Decimal(0)) && !player.a.unlocked)?5000:1).times(0.5) }
        else { return new Decimal(10).times((player.a.unlockOrder.neq(new Decimal(0)) && !player.a.unlocked)?5000:1) }
    },
    resource: "abominations", // Name of prestige currency
    baseResource: "zombies", // Name of resource prestige is based on
    baseAmount() {return player.z.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.25, // Prestige currency exponent
    base: 4,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        
        if (hasUpgrade("a", 22)) { mult = mult.times(new Decimal(1).div(upgradeEffect("a", 22))) }
        if(player.m.bought) { mult = mult.times(0.5) }
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
    effectBase() {
        base = player.a.points
        if (hasUpgrade("f", 13)) { base = base.times(upgradeEffect("f", 13)) }
        return base
    },
    effectExp() {
        exp = new Decimal(0.75)
        
        return exp
    },
    effect() {
        eff = Decimal.pow(this.effectBase(), this.effectExp()).div(2)
        if (hasMilestone("f", 1)) eff = eff.times(tmp.f.powerEff.pow(0.5))
        return eff
    },
    effectDescription() { return "which are giving +"+format(tmp.a.effect)+" to base corpse gain" },
    tabFormat: ["main-display",
		"prestige-button",
		"blank",
		["display-text",
			function() {return 'Your best abominations is ' + formatWhole(player.a.best) + '<br>You have made a total of '+formatWhole(player.a.total)+" abominations"}, {}],
		"blank",
		"milestones", "blank", "blank", "upgrades"],
    canBuyMax() { return hasMilestone("a", 2) },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "a: amalgamate your zombies into abominations", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer) {
        let keep = [];
        let keep1 = [];
        if (hasMilestone("p", 0) && resettingLayer=="p") {
            num = Math.min(3, player.p.resets)

            all = ["0", "1", "2"]

            for (i=0; i<num; i++) {
                if (hasMilestone("a", all[i])) { keep1.push(all[i]) }
            }
        }

        if (hasMilestone("p", 2) && resettingLayer=="p") keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("a", keep)
        if (hasMilestone("p", 0) && resettingLayer=="p") { player.a.milestones = keep1 }
    },
    layerShown() { return player.z.unlocked },
    upCostMult: new Decimal(1),
    upgrades: {
        rows: 2,
        cols: 4,
        11: {
            title: "Militarize",
            description: "Add 1 to base corpse gain. If you already have <h3>Industrialize</h3>, this costs 0 and has no effect.",
            cost() { 
                if (hasUpgrade("f", 11)) { return new Decimal(0) }
                else { return tmp.f.upCostMult.times(1) }
            },
        },
        12: {
            title: "Recycle Leftover Parts",
            description: "Total abominations boost zombie gain.",
            cost() { return tmp.a.upCostMult.times(2) },
            effect() {
                eff = player.a.total.sqrt().plus(1)
                return eff
            },
            effectDisplay() { return format(tmp.a.upgrades[12].effect)+"x" },
        },
        13: {
            title: "Part Time Job",
            description: "Abominations boost armament production.",
            cost() { return tmp.a.upCostMult.times(4) },
            unlocked() { return hasUpgrade("a", 12) && player.f.unlocked },
            effect() {
                eff = player.a.points.plus(2).log10().sqrt().div(3)
                return eff
            },
            effectDisplay() { return "+"+format(tmp.a.upgrades[13].effect)+" to base production" },
        },
        14: {
            title: "Necro-Steroids",
            description: "Abominations^4 multiply corpse gain.",
            cost() { return tmp.a.upCostMult.times(8) },
            unlocked() { return hasUpgrade("a", 13) },
            effect() {
                eff = player.a.points.pow(4).max(1)
                return eff
            },
            effectDisplay() { return format(tmp.a.upgrades[14].effect)+"x" },
        },
        21: {
            title: "Regeneration",
            description: "Abominations boost zombie gain.",
            cost() { return tmp.f.upCostMult.times(15) },
            unlocked() { return hasUpgrade("f", 14) },
            effect() {
                eff = player.a.points.pow(2).times(1.5)
                return eff
            },
            effectDisplay() { return format(tmp.a.upgrades[21].effect)+"x" },
        },
        22: {
            title: "Spontaneous Generation",
            description: "Abominations are cheaper based on corpses.",
            cost() { return tmp.f.upCostMult.times(30) },
            unlocked() { return hasUpgrade("f", 21) },
            effect() {
                eff = player.points.plus(1).log10().plus(1).pow(2)
                return eff
            },
            effectDisplay() { return "/" + format(tmp.a.upgrades[22].effect) },
        },
        23: {
            title: "Plague",
            description: "<h3>Disease</h3> is stronger based on your abominations.",
            cost() { return tmp.f.upCostMult.times(35) },
            unlocked() { return hasUpgrade("f", 22) },
            effect() {
                eff = player.a.points.pow(0.5).div(3).plus(1)
                return eff
            },
            effectDisplay() { return "^" + format(tmp.a.upgrades[23].effect) },
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

addLayer("g5", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},
    position: 1,
    color: "#4BDC13",                       // The color for this layer, which affects many elements.
    resource: "prestige points",            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).
    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.
    requires: new Decimal(10),              // The amount of the base needed to  gain 1 of the prestige currency. Also the amount required to unlock the layer.
    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,
    layerShown() { return "ghost" }            // Returns a bool for if this layer's node should be visible in the tree.
})

addLayer("f", {
    name: "death factory", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        power: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        unlockOrder: new Decimal(0),
    }},
    increaseUnlockOrder: ["a"],
    resetDescription: "Reanimate corpses to operate ",
    branches: ["z"],
    color: "#878787",
    requires() { 
        if(player.m.bought) { return new Decimal(200).times((player.f.unlockOrder.neq(new Decimal(0)) && !player.f.unlocked)?5000:1).times(0.5) }
        else { return new Decimal(200).times((player.f.unlockOrder.neq(new Decimal(0)) && !player.f.unlocked)?5000:1) }
    },
    resource: "death factories", // Name of prestige currency
    baseResource: "corpses", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.25, // Prestige currency exponent
    base: 5,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(player.m.bought) { mult = mult.times(0.5) }
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effBase() {
        base = new Decimal(2)
        if(hasUpgrade("a", 13)) base = base.plus(upgradeEffect("a", 13))

        return base
    },
    effect() {
        eff = Decimal.pow(this.effBase(), player.f.points).sub(1).max(0)

        return eff
    },
    limit() {
        lim = Decimal.pow(this.effBase().times(1.2), player.f.best)
        return lim
    },
    update(diff) {
        if (player.f.unlocked && player.f.power.lt(this.limit())) player.f.power = player.f.power.plus(tmp.f.effect.times(diff))
    },
    powerExp() {
        exp = new Decimal(1)
        if(hasUpgrade("f", 14)) exp = new Decimal(2)

        return exp
    },
    powerEff() {
        return player.f.power.plus(1).pow(0.5).div(3).max(1).pow(this.powerExp())
    },
    effectDescription() { 
        return "which are manufacturing "+format(tmp.f.effect)+" armaments/sec, but with a limit of " + format(this.limit()) + " armaments" //+(tmp.nerdMode?("\n ("+format(tmp.g.effBase)+"x each)"):"") 
    },
    tabFormat: ["main-display",
		"prestige-button",
		"blank",
		["display-text",
			function() {return 'You have ' + format(player.f.power) + ' armaments, which multiplies the zombie effect by '+format(tmp.f.powerEff)+'x'}, {}],
		"blank",
		["display-text",
			function() {return 'Your best armaments is ' + formatWhole(player.f.best) + '<br>You have made a total of '+formatWhole(player.f.total)+" armaments"}, {}],
		"blank",
		"milestones", "blank", "blank", "upgrades"],
    canBuyMax() { return hasMilestone("f", 2) },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "f", description: "f: reanimate corpses to operate death factories", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer) {
        let keep = [];
        let keep1 = [];
        if (hasMilestone("p", 0) && resettingLayer=="p") {
            num = Math.min(3, player.p.resets)

            all = ["0", "1", "2"]

            for (i=0; i<num; i++) {
                if (hasMilestone("f", all[i])) { keep1.push(all[i]) }
            }
        }

        if (hasMilestone("p", 2) && resettingLayer=="p") keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("f", keep)
        if (hasMilestone("p", 0) && resettingLayer=="p") { player.f.milestones = keep1 }
    },
    layerShown() { return player.z.unlocked },
    upCostMult: new Decimal(1), 
    upgrades: {
        rows: 2,
        cols: 4,
        11: {
            title: "Industrialize",
            description: "Add 1 to base corpse gain. If you already have <h3>Militarize</h3>, this costs 0 and has no effect.",
            cost() { 
                if (hasUpgrade("a", 11)) { return new Decimal(0) }
                else { return tmp.f.upCostMult.times(1) }
            },
        },
        12: {
            title: "Corpse Processing Facility",
            description: "Death factories boost zombie gain.",
            cost() { return tmp.f.upCostMult.times(2) },
            effect() {
                eff = player.f.points
                effExp = new Decimal(0.5)
                if (hasUpgrade("f", 21)) { effExp = effExp.plus(0.2) }
                eff = eff.plus(1).pow(effExp)
                return eff
            },
            effectDisplay() { return format(tmp.f.upgrades[12].effect)+"x" },
        },
        13: {
            title: "Zombie Processing Facility",
            description: "Death factories boost abomination effect base.",
            cost() { return tmp.f.upCostMult.times(4) },
            unlocked() { return hasUpgrade("f", 12) && player.a.unlocked },
            effect() {
                let eff = player.f.total.plus(1).log10().plus(1)
                return eff
            },
            effectDisplay() { return format(tmp.f.upgrades[13].effect)+"x" },
        },
        14: {
            title: "Adamantium Armaments",
            description: "Square the armament effect.",
            cost() { return tmp.f.upCostMult.times(8) },
            unlocked() { return hasUpgrade("f", 13) },
        },
        21: {
            title: "Assembly Lines",
            description: "Add 0.2 to the <h3>Corpse Processing Facility</h3> exponent.",
            cost() { return tmp.f.upCostMult.times(15) },
            unlocked() { return hasUpgrade("f", 14) },
        },
        22: {
            title: "Field Stitching",
            description: "Armaments boost zombie gain.",
            cost() { return tmp.f.upCostMult.times(30) },
            unlocked() { return hasUpgrade("f", 21) },
            effect() {
                let eff = player.f.power.pow(0.25).pow(0.5)
                return eff
            },
            effectDisplay() { return format(tmp.f.upgrades[22].effect)+"x" },
        },
        23: {
            title: "Exoskeletons",
            description: "Add 0.1 to the <h3>Bigger Zombies</h3> effect.",
            cost() { return tmp.f.upCostMult.times(35) },
            unlocked() { return hasUpgrade("f", 22) },
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
            effectDescription() { return "Armaments also affect abominations with reduced effect<br>(before the <h3>Adamantium Armaments</h3> effect)<br>Currently: " + format(tmp.f.powerEff.pow(0.5)) + "x" },
        },
        2: {
            requirementDescription: "15 death factories",
            done() { return player.f.best.gte(15) },
            effectDescription: "You can buy max death factories",
        },
    },
})

addLayer("p", {
    name: "exterminated planets", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
        total: new Decimal(0),
        resets: new Decimal(0),
        spent: new Decimal(0),
    }},
    branches: ["a", "f"],
    resetDescription: "Ascend to a new world for ",
    position: 0,
    color: "#0D58C4",                       // The color for this layer, which affects many elements.
    resource: "exterminated planets",            // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).
    baseResource: "corpses",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.
    requires: new Decimal("1e100"),              // The amount of the base needed to  gain 1 of the prestige currency. Also the amount required to unlock the layer.
    type: "static",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,
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

        return base
    },
    effect() {
        eff = Decimal.pow(this.effBase(), player.f.points).sub(1).max(0)

        return eff
    },
    effectDescription() { 
        return "which have given you "+formatWhole(player.p.total)+" total experience points" //+(tmp.nerdMode?("\n ("+format(tmp.g.effBase)+"x each)"):"") 
    },
    tabFormat: {
        "Milestones": { 
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text",
                    function() {return 'You have exterminated a total of '+formatWhole(player.p.total)+" planets" + '<br>You have ascended '+formatWhole(player.p.resets)+" times"}, {}],
                "blank",
                "milestones",
            ],
            unlocked() { return true },
        },
        "Skills": {
            content: [
                "main-display",
                ["display-text",
                    function() {return 'You have  '+formatWhole(player.p.total.minus(player.p.spent))+" experience points to spend" + "<br>You have spent "+formatWhole(player.p.spent)+" experience points"}, {}],
                ["tree", function() {return ALT_TREE_LAYERS }],
            ],
            unlocked() { return player.p.total.gt(0) },
        }
    },
    canBuyMax() { return false },
    hotkeys: [
        {key: "p", description: "p: ascend to a new world for exterminated planets", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upCostMult: new Decimal(1), 
    layerShown() { return player.a.unlocked && player.f.unlocked },            // Returns a bool for if this layer's node should be visible in the tree.
    onPrestige(gain) { player.p.resets = player.p.resets.plus(1) },
    milestones: {
        0: {
            requirementDescription: "1 total exterminated planets",
            done() { return player.p.total.gte(1) },
            effectDescription: "For each ascension, keep one abomination and death factory milestone on reset",
        },
        1: {
            requirementDescription: "10 total exterminated planets",
            done() { return player.p.total.gte(10) },
            effectDescription: "Keep zombie upgrades on reset",
        },
        2: {
            requirementDescription: "20 total exterminated planets",
            done() { return player.p.total.gte(20) },
            effectDescription: "Keep abomination and death factory upgrades on reset",
        },
    },
})

addLayer("w", {
    name: "witch doctors", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "W", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        power: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    row: 3,
    resetDescription: "Sacrifice corpses to recruit ",
    color: "#8EA018",
    branches: ["p"],
    requires: new Decimal("1e100"), // Can be a function that takes requirement increases into account
    resource: "witch doctors", // Name of prestige currency
    baseResource: "corpses", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent
    hotkeys: [
        {key: "w", description: "w: sacrifice corpses to recruit witch doctors", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return "ghost" },
    upCostMult: new Decimal(1),
})

addLayer("s", {
    name: "skeleton mages", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        power: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    resetDescription: "Transform zombies into ",
    color: "#F0E6E8",
    branches: ["p"],
    requires: new Decimal("1e100"), // Can be a function that takes requirement increases into account
    resource: "skeleton mages", // Name of prestige currency
    baseResource: "zombies", // Name of resource prestige is based on
    baseAmount() {return player.z.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    effBase() {
        base = new Decimal(2)

        return base
    },
    effect() {
        eff = Decimal.pow(this.effBase(), player.s.points).sub(1).max(0).div(2.5)

        return eff
    },
    update(diff) {
        if (player.s.unlocked) player.s.power = player.s.power.plus(tmp.s.effect.times(diff))
    },
    effectDescription() { 
        return "which are producing "+format(tmp.s.effect)+" mana/sec" //+(tmp.nerdMode?("\n ("+format(tmp.g.effBase)+"x each)"):"") 
    },
    tabFormat: ["main-display",
		"prestige-button",
		"blank",
		["display-text",
			function() {return 'You have ' + format(player.s.power) + ' mana'}, {}],
        "blank",
        "clickables",
        "blank",
		"buyables", "blank", "blank", "upgrades"],
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "s: transform your zombies into skeleton mages", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return false }, //return player.p.unlocked },
    upCostMult: new Decimal(1),
    clickables: {
        rows: 1,
        cols: 1,
        11: {
            display() { return "Respec spells" },
            canClick() { return player[this.layer].spentOnBuyables },
            onClick() { respecBuyables(this.layer) },
            style: {
                "height": "40px",
	            "width": "90px",
	            "border-radius": "50%",
	            "border": "2px solid",
	            "border-color": "rgba(0, 0, 0, 0.125)",
	            "font-size": "10px",
            }
        },
    },
    buyables: {
        rows: 1,
        cols: 3,
        11: {
            title: "Spell 1",
            cost(x=getBuyableAmount(this.layer, this.id)) { return new Decimal(5).pow(new Decimal(1.4).pow(x)) },
            display() { 
                let data = tmp[this.layer].buyables[this.id]
                return ("Cost: " + formatWhole(data.cost) + " mana \n\
                 Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n\
                 Effect info here")
            },
            canAfford() { return player[this.layer].power.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].power = player[this.layer].power.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            title: "Spell 2",
            cost(x=getBuyableAmount(this.layer, this.id)) { return new Decimal(25).pow(new Decimal(1.4).pow(x)) },
            display() { 
                let data = tmp[this.layer].buyables[this.id]
                return ("Cost: " + formatWhole(data.cost) + " mana \n\
                 Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n\
                 Effect info here")
            },
            canAfford() { return player[this.layer].power.gte(this.cost) },
            buy() {
                player[this.layer].power = player[this.layer].power.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        13: {
            title: "Spell 3",
            cost(x=getBuyableAmount(this.layer, this.id)) { return new Decimal(100).pow(new Decimal(1.4).pow(x)) },
            display() { 
                let data = tmp[this.layer].buyables[this.id]
                return ("Cost: " + formatWhole(data.cost) + " mana \n\
                 Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n\
                 Effect info here")
            },
            canAfford() { return player[this.layer].power.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].power = player[this.layer].power.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("g2", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},
    position: 2,
    color: "#4BDC13",                       // The color for this layer, which affects many elements.
    resource: "prestige points",            // The name of this layer's main prestige resource.
    row: 3,                                 // The row this layer is on (0 is the first row).
    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.
    requires: new Decimal(10),              // The amount of the base needed to  gain 1 of the prestige currency. Also the amount required to unlock the layer.
    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,
    layerShown() { return "ghost" }            // Returns a bool for if this layer's node should be visible in the tree.
})

addLayer("n", {
    name: "necropoli", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "N", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        power: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    row: 3,
    resetDescription: "Annihilate planets to form ",
    color: "#000000",
    branches: ["p"],
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "necropoli", // Name of prestige currency
    baseResource: "planets", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    altRequires: new Decimal("1e200"),
    altResource: "corpses",
    altBaseAmount() {return player.points},
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base: 5,
    exponent: 0.1, // Prestige currency exponent
    altBase: 5,
    altExp: 0.5,
    hotkeys: [
        {key: "n", description: "n: annihilate planets to form necropoli", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return false }, //return player.p.unlocked },
    canBuyMax() { return false },
    upCostMult: new Decimal(1),
    roundUpCost() { return true },
    roundUpAltCost() { return false },
    getResetGain() {
        return getResetGain(this.layer, useType = "static")
    },
    getNextAt(canMax=false) {
        return getNextAt(this.layer, canMax=false, useType = "static")
    },
    prestigeNotify() { return true },
    prestigeButtonText() {
        return `${tmp[this.layer].resetDescription !== undefined ? tmp[this.layer].resetDescription : "Reset for "}+<b>${formatWhole(tmp[this.layer].resetGain)}</b> ${tmp[this.layer].resource}<br><br>Req: ${formatWhole(tmp[this.layer].baseAmount)} / ${(tmp[this.layer].roundUpCost ? formatWhole(tmp[this.layer].nextAt) : format(tmp[this.layer].nextAt))} ${ tmp[this.layer].baseResource }<br>and ${formatWhole(tmp[this.layer].altBaseAmount)} / ${(tmp[this.layer].roundUpAltCost ? formatWhole(tmp[this.layer].altNextAt) : format(tmp[this.layer].altNextAt))} ${tmp[this.layer].altResource}`
    },
    tooltipLocked() {
        return `Reach ${tmp[this.layer].requires} ${tmp[this.layer].baseResource} and ${tmp[this.layer].altRequires} ${tmp[this.layer].altResource} to unlock (You have ${tmp[this.layer].baseAmount} ${tmp[this.layer].baseResource} and ${tmp[this.layer].altBaseAmount} ${tmp[this.layer].altResource})`
    },
    componentStyles: {
        "prestige-button"() { return {'color': 'rgba(255, 255, 255, 0.5)'} }
    },
    nodeStyle: {
        "color": "rgba(255, 255, 255, 0.5)",
    },
})

addLayer("g3", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},
    position: 4,
    color: "#4BDC13",                       // The color for this layer, which affects many elements.
    resource: "prestige points",            // The name of this layer's main prestige resource.
    row: 3,                                 // The row this layer is on (0 is the first row).
    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.
    requires: new Decimal(10),              // The amount of the base needed to  gain 1 of the prestige currency. Also the amount required to unlock the layer.
    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,
    layerShown() { return "ghost" }            // Returns a bool for if this layer's node should be visible in the tree.
})

addAltNode("m", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1),             // "points" is the internal name for the main resource of the layer.
        cost: new Decimal(1),
        bought: false,
    }}, 
    color: "#0D58C4",
    symbol: "M",
    row: 0,
    position: 0,
    effect() {
        eff = new Decimal(2)
        return eff
    },
    layerShown() { return true },
    canClick() { return (player.p.total.minus(player.p.spent).gte(player.m.cost) && !player.m.bought) },
    onClick() { 
        if (player.p.total.minus(player.p.spent).gte(player.m.cost)) {
            player.p.spent = player.p.spent.plus(player.m.cost)
            player.m.bought = true
        }
    },
    tooltip() { return "Master Necromancer:\nx" + formatWhole(this.effect()) + " to all previous prestige gains.\nCost: " + formatWhole(player.m.cost) + " experience points" },
    tooltipLocked() { return "Master Necromancer:\nx" + formatWhole(this.effect()) + " to all previous prestige gains.\nCost: " + formatWhole(player.m.cost) + " experience points" },
}) 

addAltNode("q", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1),             // "points" is the internal name for the main resource of the layer.
        cost: new Decimal(1),
        bought: false,
    }}, 
    color: "#0D58C4",
    symbol: "Q",
    branches: ["m"],
    row: 1,
    position: 0,
    effect() {
        eff = new Decimal(2)
        return eff
    },
    layerShown() { return true },
    canClick() { return (player.p.total.minus(player.p.spent)).gte(player.q.cost) && !player.q.bought && player.m.bought }, //(player.p.total.minus(player.p.spent)).gte(player.m.cost) },
    onClick() { 
        /* player.p.spent = player.p.spent.plus(player.m.cost)
        this.style = {
            "background-color": "#77bf5f;",
            "cursor": "default;"   
        }
        player.m.bought = true */
    },
    tooltip() { return "Coming soon" },
    tooltipLocked() { return "Coming soon" },
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
    row: 1,
    position: 1,
    effect() {
        eff = new Decimal(2)
        return eff
    },
    layerShown() { return "ghost" },
    canClick() { return true }, //(player.p.total.minus(player.p.spent)).gte(player.m.cost) },
    onClick() { 
        /* player.p.spent = player.p.spent.plus(player.m.cost)
        this.style = {
            "background-color": "#77bf5f;",
            "cursor": "default;"   
        }
        player.m.bought = true */
    },
    tooltip() { return "Coming soon" },
    tooltipLocked() { return "Coming soon" },
}) 

addAltNode("r", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1),             // "points" is the internal name for the main resource of the layer.
        cost: new Decimal(1),
        bought: false,
    }}, 
    color: "#0D58C4",
    symbol: "R",
    branches: ["q"],
    row: 1,
    position: 2,
    effect() {
        eff = new Decimal(2)
        return eff
    },
    layerShown() { return true },
    canClick() { return (player.p.total.minus(player.p.spent)).gte(player.r.cost) && !player.r.bought && player.m.bought }, //(player.p.total.minus(player.p.spent)).gte(player.m.cost) },
    onClick() { 
        /* player.p.spent = player.p.spent.plus(player.m.cost)
        this.style = {
            "background-color": "#77bf5f;",
            "cursor": "default;"   
        }
        player.m.bought = true */
    },
    tooltip() { return "Coming soon" },
    tooltipLocked() { return "Coming soon" },
}) 