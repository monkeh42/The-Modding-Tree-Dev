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
    roundUpCost: true,
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
        if (player.mn.bought) { mult = mult.times(tmp["mn"].effect) }
        if (player.wd.bought) { mult = mult.times(tmp["wd"].zEffect) }
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (hasUpgrade("z", 33)) { exp = exp.plus(upgradeEffect("z", 33)) }
        return exp
    },
    effectExp() {
        let exp = new Decimal(0.65)
        if (hasUpgrade("z", 13)) { exp = exp.plus(upgradeEffect("z", 13)) }
        return exp
    },
    effectBase() {
        let eff = new Decimal(1)
        if (hasUpgrade("z", 32)) { eff = eff.plus(upgradeEffect("z", 32)) } 
        return eff
    },
    effect() {
        let eff = tmp.z.effectBase.plus(player.z.points.times(2)).pow(tmp.z.effectExp).max(1) 
        if (player.f.unlocked && player.z.points.gt(0)) eff = eff.times(tmp.f.powerEff)
        eff = softcap("zEff", eff)
        return eff
    },
    effectDescription() { return "which are boosting corpse gain by "+format(tmp.z.effect)+"x" + (softcapActive("zEff", tmp.z.effect) ? " (softcapped)" : "") },
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
        if (hasMilestone("p", 1) && layers[resettingLayer].row==2) keep.push("upgrades")
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
                let eff = new Decimal(0.15)
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
                let eff = Decimal.pow(1.5, player.z.upgrades.length).div(1.75).max(1)
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
                let eff = player.z.total.plus(1).ln().plus(1).pow(0.5).minus(1).max(1)
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
                let eff = player.a.points.plus(1).log10().div(12)
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
        auto: false,
    }},
    increaseUnlockOrder: ["f"],
    resetDescription: "Amalgamate zombies for ",
    branches: ["z"],
    color: "#C7002A",
    requires() { 
        if(player.mn.bought) { return new Decimal(10).times((player.a.unlockOrder.neq(0) && !player.a.unlocked)?100:1).times(new Decimal(1).div(tmp["mn"].effect)) }
        else { return new Decimal(10).times((player.a.unlockOrder.neq(0) && !player.a.unlocked)?100:1) }
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
        if(player.mn.bought) { mult = mult.times(new Decimal(1).div(tmp["mn"].effect)) }
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
    autoPrestige() { return player[this.layer].auto },
    resetsNothing() { return hasMilestone("p", 2) },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "a: amalgamate your zombies into abominations", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer) {
        if (resettingLayer=="n") { return }
        let keep = [];
        let keep1 = [];
        let prevAuto = player.a.auto;
        if (hasMilestone("p", 0) && resettingLayer=="p") {
            num = Math.min(3, player.p.resets)

            all = ["0", "1", "2"]

            for (i=0; i<num; i++) {
                if (hasMilestone("a", all[i])) { keep1.push(all[i]) }
            }
        }

        if (hasMilestone("p", 2) && resettingLayer=="p") keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("a", keep)
        if (hasMilestone("s", 0)) { player.a.auto = prevAuto }
        if (hasMilestone("p", 0) && resettingLayer=="p") { player.a.milestones = keep1 }
    },
    layerShown() { return player.z.unlocked },
    upCostMult: new Decimal(1),
    upgrades: {
        rows: 2,
        cols: 4,
        11: {
            title: "Militarize",
            unlocked() { return player.a.unlocked },
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
            cost() { return tmp.a.upCostMult.times(15) },
            unlocked() { return hasUpgrade("a", 14) },
            effect() {
                eff = player.a.points.pow(2).times(1.5).plus(1)
                return eff
            },
            effectDisplay() { return format(tmp.a.upgrades[21].effect)+"x" },
        },
        22: {
            title: "Spontaneous Generation",
            description: "Abominations are cheaper based on corpses.",
            cost() { return tmp.a.upCostMult.times(25) },
            unlocked() { return hasUpgrade("a", 21) },
            effect() {
                eff = player.points.plus(1).pow(2).log10().plus(1).pow(3)
                return eff
            },
            effectDisplay() { return "/" + format(tmp.a.upgrades[22].effect) },
        },
        23: {
            title: "Plague",
            description: "<h3>Disease</h3> is stronger based on your abominations.",
            cost() { return tmp.a.upCostMult.times(35) },
            unlocked() { return hasUpgrade("a", 22) },
            effect() {
                eff = player.a.points.pow(0.5).div(3).plus(1)
                return eff
            },
            effectDisplay() { return "^" + format(tmp.a.upgrades[23].effect) },
        },
        24: {
            title: "Fear",
            description: "Multiply corpse gain by your best exterminated planets^6.",
            cost() { return tmp.a.upCostMult.times(50) },
            unlocked() { return hasUpgrade("a", 23) && player.p.unlocked },
            effect() {
                eff = player.p.best.plus(1)
                effExp = new Decimal(6)
                if (player.pt.bought) { eff = eff.plus(tmp["pt"].effect) }
                return eff.pow(effExp)
            },
            effectDisplay() { return format(tmp.a.upgrades[24].effect) + "x" },
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
        auto: false,
        unlockOrder: new Decimal(0),
    }},
    increaseUnlockOrder: ["a"],
    resetDescription: "Reanimate corpses to operate ",
    branches: ["z"],
    color: "#878787",
    requires() { 
        if(player.mn.bought) { return new Decimal(200).times((player.f.unlockOrder.neq(0) && !player.f.unlocked)?5000:1).times(new Decimal(1).div(tmp["mn"].effect)) }
        else { return new Decimal(200).times((player.f.unlockOrder.neq(0) && !player.f.unlocked)?5000:1) }
    },
    resource: "death factories", // Name of prestige currency
    baseResource: "corpses", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.25, // Prestige currency exponent
    base: 5,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(player.mn.bought) { mult = mult.times(new Decimal(1).div(tmp["mn"].effect)) }
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
        eff = Decimal.pow(this.effBase(), player.f.points.max(1)).times(player.f.power.plus(1).log10()).max(1).sub(0.5)
        if(hasUpgrade("n", 12)) { eff = eff.times(player.n.points.pow(3)) }
        if (getBuyableAmount("s", 11).gt(0)) { eff = eff.times(buyableEffect("s", 11)) }
        return eff
    },
    limit() {
        lim = Decimal.pow(this.effBase().times(1.5), player.f.best)
        if (hasUpgrade("n", 11)) { lim = lim.times(upgradeEffect("n", 11)) }
        return lim.max(25)
    },
    update(diff) {
        if (player.f.unlocked && player.f.power.lt(tmp.f.limit)) player.f.power = player.f.power.plus(tmp.f.effect.times(diff))
    },
    powerExp() {
        exp = new Decimal(0.75)
        if(hasUpgrade("f", 14)) exp = exp.times(2)

        return exp
    },
    powerEff() {
        eff = player.f.power.plus(1).pow(0.5).div(3).max(1).pow(this.powerExp()).max(1)
        if (player.n["13"].gt(0)) { eff = eff.times(tmp["n"].resEffect) }
        return eff
    },
    effectDescription() { 
        return "which are manufacturing "+format(this.effect())+" armaments/sec, but with a limit of " + format(this.limit()) + " armaments" //+(tmp.nerdMode?("\n ("+format(tmp.g.effBase)+"x each)"):"") 
    },
    tabFormat: ["main-display",
		"prestige-button",
		"blank",
		["display-text",
			function() {return 'You have ' + format(player.f.power) + ' armaments, which multiplies the zombie effect by '+format(tmp.f.powerEff)+'x'}, {}],
		"blank",
		["display-text",
			function() {return 'Your best armaments is ' + formatWhole(player.f.best) + '<br>You have made a total of '+formatWhole(player.f.total)+' armaments'}, {}],
		"blank",
		"milestones", "blank", "blank", "upgrades"],
    canBuyMax() { return hasMilestone("f", 2) },
    autoPrestige() { return player[this.layer].auto },
    resetsNothing() { return hasMilestone("p", 2) },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "f", description: "f: reanimate corpses to operate death factories", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer) {
        if (resettingLayer=="s") { return }
        let keep = [];
        let keep1 = [];
        let prevAuto = player.f.auto;
        if (hasMilestone("p", 0) && resettingLayer=="p") {
            num = Math.min(3, player.p.resets)

            all = ["0", "1", "2"]

            for (i=0; i<num; i++) {
                if (hasMilestone("f", all[i])) { keep1.push(all[i]) }
            }
        }

        if (hasMilestone("p", 2) && resettingLayer=="p") keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("f", keep)
        if (hasMilestone("n1", 0)) { player.f.auto = prevAuto }
        if (hasMilestone("p", 0) && resettingLayer=="p") { player.f.milestones = keep1 }
    },
    layerShown() { return player.z.unlocked },
    upCostMult: new Decimal(1), 
    upgrades: {
        rows: 2,
        cols: 4,
        11: {
            title: "Industrialize",
            unlocked() { return player.f.unlocked },
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
                if (hasUpgrade("f", 21)) { effExp = effExp.plus(0.5) }
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
            description: "Add 0.5 to the <h3>Corpse Processing Facility</h3> exponent.",
            cost() { return tmp.f.upCostMult.times(15) },
            unlocked() { return hasUpgrade("f", 14) },
        },
        22: {
            title: "Field Stitching",
            description: "Armaments boost zombie gain.",
            cost() { return tmp.f.upCostMult.times(25) },
            unlocked() { return hasUpgrade("f", 21) },
            effect() {
                let eff = player.f.power.pow(0.25).pow(0.5).max(1)
                return eff
            },
            effectDisplay() { return format(tmp.f.upgrades[22].effect)+"x" },
        },
        23: {
            title: "Exoskeletons",
            description: "Add +0.1 to the <h3>Bigger Zombies</h3> effect.",
            cost() { return tmp.f.upCostMult.times(35) },
            unlocked() { return hasUpgrade("f", 22) },
        },
        24: {
            title: "Dread",
            description: "Multiply corpse gain by your best exterminated planets^6",
            cost() { return tmp.f.upCostMult.times(50) },
            unlocked() { return hasUpgrade("f", 23) && player.p.unlocked },
            effect() {
                eff = player.p.best.plus(1)
                effExp = new Decimal(6)
                if (player.pt.bought) { eff = eff.plus(tmp["pt"].effect) }
                return eff.pow(effExp)
            },
            effectDisplay() { return format(tmp.f.upgrades[24].effect) + "x" },
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
    resetDescription: "Shatter this world for ",
    position: 3,
    color: "#0D58C4",                       // The color for this layer, which affects many elements.
    resource: "exterminated planets",            // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).
    baseResource: "corpses",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.
    requires: new Decimal("1e100"),              // The amount of the base needed to  gain 1 of the prestige currency. Also the amount required to unlock the layer.
    type: "static",                         // Determines the formula used for calculating prestige currency.
    exponent: 2,
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
        return "" //+(tmp.nerdMode?("\n ("+format(tmp.g.effBase)+"x each)"):"") 
    },
    tabFormat: {
        "Milestones": { 
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text",
                    function() {return "Your best exterminated planets is " + formatWhole(player.p.best) + "<br>You have exterminated a total of "+formatWhole(player.p.total)+" planets, which have given you "+formatWhole(player.p.total)+" total experience points" + "<br>You have performed " + formatWhole(player.p.resets) + " exterminations"}, {}],
                "blank",
                "milestones",
            ],
            unlocked() { return true },
        },
        "Skills": {
            content: [
                "main-display",
                "blank",
                ["display-text",
                    function() {return "You have exterminated a total of "+formatWhole(player.p.total)+" planets<br>You have "+formatWhole(getExpPoints())+" experience points to spend" + "<br>You have spent "+formatWhole(player.p.spent)+" experience points"}, {}],
                "blank",
                "clickables",
                "blank",
                ["tree", function() {return ALT_TREE_LAYERS }],
            ],
            unlocked() { return player.p.total.gt(0) },
        }
    },
    canBuyMax() { return hasMilestone("p", 3) },
    hotkeys: [
        {key: "p", description: "p: shatter this world for exterminated planets", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    upCostMult: new Decimal(1), 
    layerShown() { return player.a.unlocked && player.f.unlocked },            // Returns a bool for if this layer's node should be visible in the tree.
    onPrestige(gain) { player.p.resets = player.p.resets.plus(1) },
    clickables: {
        rows: 1,
        cols: 1,
        11: {
            display() { return "Respec skills" },
            canClick() { return player.p.spent },
            onClick() { 
                player.p.spent = new Decimal(0) 
                respecSkills()
            },
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
    milestones: {
        0: {
            requirementDescription: "1 total exterminated planets",
            done() { return player.p.total.gte(1) },
            effectDescription: "For each ascension, keep one abomination and death factory milestone on reset",
        },
        1: {
            requirementDescription: "5 total exterminated planets",
            done() { return player.p.total.gte(5) },
            effectDescription: "Keep zombie upgrades on all row 3 resets",
        },
        2: {
            requirementDescription: "10 total exterminated planets",
            done() { return player.p.total.gte(10) },
            effectDescription: "Keep all previous upgrades on reset, and abominations and death factories reset nothing",
        },
        3: {
            requirementDescription: "15 total exterminated planets",
            done() { return player.p.total.gte(15) },
            effectDescription: "You can buy max exterminated planets",
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
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        power: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    resetDescription: "Transform zombies into ",
    color: "#F0E6E8",
    branches: ["a"],
    requires: new Decimal("1e150"), // Can be a function that takes requirement increases into account
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
        eff = Decimal.pow(this.effBase(), player.s.points).pow(0.9)

        return eff
    },
    update(diff) {
        if (player.s.unlocked) player.s.power = player.s.power.plus(tmp.s.effect.times(diff))
    },
    effectDescription() { 
        return "which are producing "+format(tmp.s.effect)+" mana/sec" //+(tmp.nerdMode?("\n ("+format(tmp.g.effBase)+"x each)"):"") 
    },
    tabFormat: {
        "Spells": {
            content: ["main-display",
            "prestige-button",
            "blank",
            ["display-text",
                function() {return 'You have ' + format(player.s.power) + ' mana'}, {}],
            "blank",
            "clickables",
            "blank",
            "buyables",],
        },
        "Milestones": {
            content: ["main-display",
            "prestige-button",
            "blank",
            "milestones"],
        },
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "s: transform your zombies into skeleton mages", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return player.p.unlocked },
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
            resets: new Decimal(0),
            costMult() {
                mult = tmp["s"].buyables[11].resets.plus(1)
                return mult
            },
            cost(x=getBuyableAmount(this.layer, this.id)) { return new Decimal(5).times(tmp["s"].buyables[this.id].costMult).pow(new Decimal(1.4).pow(x)) },
            display() { 
                let data = tmp[this.layer].buyables[this.id]
                return ("Cost: " + formatWhole(data.cost) + " mana \n\
                 Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n\
                 Each level gives +1% corpse gain, necropolis generation, and armaments gain. At 100 levels you can reset to add 1% to the base boost per level.\n\
                 Current bonus: +" + formatWhole(new Decimal(0.01).times(tmp["s"].buyables[11].resets.plus(1)).times(100)) + "% per level, +" + formatWhole(buyableEffect("s", 11).times(100)) + "% total")
            },
            canAfford() { return player[this.layer].power.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                if(getBuyableAmount("s", 11).lt(100)) {
                    player[this.layer].power = player[this.layer].power.sub(tmp[this.layer].buyables[this.id].cost)
                    setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                } else {
                    player[this.layer].power = player[this.layer].power.sub(tmp[this.layer].buyables[this.id].cost)
                    setBuyableAmount(this.layer, this.id, 0)
                    tmp["s"].buyables[11].resets = tmp["s"].buyables[11].resets.plus(1)
                }
            },
            effect() {
                exp = new Decimal(0.01).times(tmp["s"].buyables[11].resets.plus(1))
                eff = new Decimal(1).plus(getBuyableAmount("s", 11).times(exp))
                return eff.times(tmp["n"].puisEffect)
            },
        },
        12: {
            title: "Spell 2",
            cost(x=getBuyableAmount(this.layer, this.id)) { return new Decimal(25).pow(new Decimal(1.4).pow(x)) },
            display() { 
                let data = tmp[this.layer].buyables[this.id]
                return ("Cost: " + formatWhole(data.cost) + " mana \n\
                 Level: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n\
                 <h3>COMING SOON</h3>")
            },
            canAfford() { return false }, // return player[this.layer].power.gte(tmp[this.layer].buyables[this.id].cost) },
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
                 <h3>COMING SOON</h3>")
            },
            canAfford() { return false }, // return player[this.layer].power.gte(tmp[this.layer].buyables[this.id].cost) },
            buy() {
                player[this.layer].power = player[this.layer].power.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    milestones: {
        0: {
            requirementDescription: "1 skeleton mage",
            done() { return player.s.best.gte(1) },
            effectDescription: "Abomination autobuyer",
            toggles: [["a", "auto"]],
        }
    },
})

addLayer("g2", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},
    position: 1,
    color: "#4BDC13",                       // The color for this layer, which affects many elements.
    resource: "prestige points",            // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).
    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.
    requires: new Decimal(10),              // The amount of the base needed to  gain 1 of the prestige currency. Also the amount required to unlock the layer.
    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,
    layerShown() { return "ghost" }            // Returns a bool for if this layer's node should be visible in the tree.
})

addLayer("g6", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},
    position: 2,
    color: "#4BDC13",                       // The color for this layer, which affects many elements.
    resource: "prestige points",            // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).
    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.
    requires: new Decimal(10),              // The amount of the base needed to  gain 1 of the prestige currency. Also the amount required to unlock the layer.
    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,
    layerShown() { return "ghost" }            // Returns a bool for if this layer's node should be visible in the tree.
})

addLayer("g7", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},
    position: 5,
    color: "#4BDC13",                       // The color for this layer, which affects many elements.
    resource: "prestige points",            // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).
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
    position: 6, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        power: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        11: new Decimal(0),
        "11best": new Decimal(0),
        "11total": new Decimal(0),
        12: new Decimal(0),
        "12total": new Decimal(0),
        "12best": new Decimal(0),
        13: new Decimal(0),
        "13total": new Decimal(0),
        "13best": new Decimal(0),
        resTime: new Decimal(0),
    }},
    row:2,
    resetDescription() { return `Annihilate ${formatWhole(tmp[this.layer].getResetGain)} planets to form ` },
    color: "#000000",
    branches: ["f"],
    requires: new Decimal(1e200), // Can be a function that takes requirement increases into account
    resource: "necropoli", // Name of prestige currency
    baseResource: "corpses", // Name of resource prestige is based on
    altBaseResource: "planets",
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base: 10,
    exponent: 2, // Prestige currency exponent
    hotkeys: [
        {key: "n", description: "n: annihilate planets to form necropoli", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    pestLimit() {
        return new Decimal(12).pow(player.n.points).times(tmp["n"].pestEffect.sqrt())
    },
    puisLimit() {
        return new Decimal(12).pow(player.n.points).times(tmp["n"].puisEffect.times(2))
    },
    pestEffect() {
        eff = player.n["11"]
        eff = eff.pow(10).plus(1).log10()
        return eff.max(1)
    },
    puisEffect() {
        eff = player.n["12"]
        eff = eff.plus(1).log10().plus(1).log10().plus(1)
        return eff
    },
    resEffect() {
        eff = new Decimal(player.n.resTime).plus(1)
        eff = eff.log10().times(2)
        return eff
    },
    layerShown() { return player.p.unlocked },
    canBuyMax() { return true },
    upCostMult: new Decimal(1),
    getResetGain() {
        if (tmp[this.layer].baseAmount.lt(getNextAt("n", false, "static"))) { return new Decimal(0) }
        var gainOnR = getResetGain("n", "static")
        return gainOnR.min(player.p.points)
    },
    getNextAt() {
        return getNextAt(this.layer, true, "static")
    },
    canReset() {
        let gainOnR = getResetGain(this.layer, false, "static")
        return (gainOnR.gte(1))
    },
    prestigeButtonText() {
        return `${tmp[this.layer].resetDescription}+<b>${formatWhole(tmp[this.layer].resetGain)}</b> ${tmp[this.layer].resource}<br><br>Next at: ${formatWhole(getNextAt("n", true, "static")) + " " + tmp[this.layer].baseResource} and ${formatWhole(tmp[this.layer].getResetGain.plus(1)) + " " + (tmp[this.layer].altBaseResource)}`
    },
    tooltipLocked() {
        return `Reach ${format(tmp[this.layer].requires)} ${tmp[this.layer].baseResource} and 1 ${tmp[this.layer].altResource} to unlock (You have ${format(tmp[this.layer].baseAmount)} ${tmp[this.layer].baseResource})`
    },
    onPrestige(gain) {
        player.p.points = player.p.points.minus(gain).max(0)
    },
    update(diff) {
        
        if (player.n.unlocked) {
            for (thing in layers["n"].clickables) { 
                if (!isNaN(thing)){
                    getActivityGain(thing, diff)
                }
            }
        }
    },
    prestigeNotify() {
        return tmp["n"].canReset
    },
    componentStyles: {
        "clickable"() { return {"color": "rgba(216, 216, 216, 0.75)"} },
        "prestige-button"() { return {"color": "rgba(216, 216, 216, 0.75)"} },
        "upgrade"() { return {"color": "rgba(216, 216, 216, 0.75)"} },
        "tab-button"() { return {
            "background-color": "transparent",
            "color": "#dfdfdf",
            "font-size": "20px",
            "cursor": "pointer",
            "padding": "5px 5px",
            "margin": "5px",
            "border-radius": "10px",
            "border": "2px solid #dfdfdf",
        } },
    },
    nodeStyle: {
        "color": "rgba(216, 216, 216, 0.75)",
    },
    tabFormat: {
        "Accursed Rites": {
            content: 
            ["main-display",
            "prestige-button",
            "blank",
            ["resource-display"],
            "blank",
            "clickables",
            "blank",
            ["display-text",
                function() {
                    return "You have " + format(player["n"]["11"]) + " pestilence and are gaining " + format(clickableEffect("n", 11).times(getClickableState("n", 11))) + "/s, capped at " + format(tmp["n"].pestLimit) + "<br>" + 
                    "Your pestilence is boosting your corpse gain by " + format(tmp["n"].pestEffect) + "x and pestilence cap by the sqrt of the corpse boost, " + format(tmp["n"].pestEffect.sqrt()) + "x<br><br>" +
                    "You have " + format(player["n"]["12"]) + " puissance and are gaining " + format(clickableEffect("n", 12).times(getClickableState("n", 12))) + "/s, capped at " + format(tmp["n"].puisLimit) + "<br>" + 
                    "Your puissance is boosting your spell power by " + format(tmp["n"].puisEffect) + "x and puissance cap by the spell boost doubled, " + format(tmp["n"].puisEffect.times(2)) + "x<br><br>" +
                    "You have " + format(player.n["13"]) + " research and are gaining " + format(clickableEffect("n", 13).times(getClickableState("n", 13))) + "/s<br>" +
                    "You have produced " + format(player.n["13total"]) + " total research<br>" +
                    "You have spent " + format(player.n["resTime"]) + " seconds researching<br>While researching, your total research time is boosting the armament effect by " + format(tmp["n"].resEffect) + "x"
                }, 
            {}], "blank",
            "upgrades"]},
        
        "Unlocks": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text",
                    function() {return "You have produced " + format(player.n["13total"]) + " total research<br>" +"You have " + format(player.n["resTime"]) + " seconds of research"}, {}],
                "blank",
                ["microtabs", "milestone-tabs", {}]
            ],
            //style: {"width": "454px"},
        }
    },
    microtabs: {
        "milestone-tabs": {
            "Total Research": {
                content: [],
                embedLayer: "n1",
            },
            "Research Time": {
                content: [],
                embedLayer: "n2",
            }
        },
    },
    clickables: {
        rows: 1,
        cols: 3,
        11: {
            title: "Sow Pestilence",
            power: "pestilence",
            display() {return "Generates pestilence based on your necropoli, which boosts corpse gain."},
            canClick() { return (player.n.unlocked && player.n.points.gt(0)) },
            onClick() { 
                if (getClickableState("n", 11)) { 
                    setClickableState("n", 11, 0)
                    return
                }
                
                for (thing in layers["n"].clickables) {
                    if (!isNaN(thing)){
                        if (thing == 11) { setClickableState("n", thing, 1) }
                        else { setClickableState("n", thing, 0) }
                    }
                }   
            },
            effect() {
                eff = player.n.points
                eff = eff.pow(0.5).max(1).plus(player.n["11"].log10().div(2))
                if (player.pp.bought) { eff = eff.times(tmp["pp"].ptEffect) }
                return eff
            },
        },
        12: {
            title: "Ritual Chanting",
            power: "puissance",
            display() {return "Generates puissance based on your necropoli, which boosts spell power."},
            canClick() { return (player.n.unlocked && player.n.points.gt(0)) },
            onClick() { 
                if (getClickableState("n", 12)) { 
                    setClickableState("n", 12, 0)
                    return
                }
                
                for (thing in layers["n"].clickables) {
                    if (!isNaN(thing)){
                        if (thing == 12) { setClickableState("n", thing, 1) }
                        else { setClickableState("n", thing, 0) }
                    }
                }   
            },
            effect() {
                eff = player.n.points
                eff = eff.pow(0.5).max(1)
                if (player.pp.bought) { eff = eff.times(tmp["pp"].psEffect) }
                return eff
            },
        },
        13: {
            title: "Infernal Research",
            power: "research",
            display() {return "Generates research based on your necropoli, which unlocks new skills."},
            canClick() { return (player.n.unlocked && player.n.points.gt(0)) },
            onClick() { 
                if (getClickableState("n", 13)) { 
                    setClickableState("n", 13, 0)
                    return
                }
                
                for (thing in layers["n"].clickables) {
                    if (!isNaN(thing)){
                        if (thing == 13) { setClickableState("n", thing, 1) }
                        else { setClickableState("n", thing, 0) }
                    }
                }   
            },
            effect() {
                eff = player.n.points
                eff = eff.pow(0.5).max(1)
                return eff
            },
        },
    },
    upgrades: {
        rows: 1,
        cols: 5,
        11: {
            title: "Galactic Weapons Lockers",
            description: "Each necropolis multiplies the armament limit by 1.1.",
            canAfford() { return player.n.unlocked && player.n["13"].gte(this.cost) },
            pay() { if (player.n["13"].gte(this.cost)) { player.n["13"] = player.n["13"].minus(this.cost) } },
            cost: new Decimal(25),
            currencyDisplayName: "research",
            effect() {
                exp = new Decimal(1.2)
                eff = new Decimal(1).times(exp.pow(player.n.points))
                return eff
            },
            effectDisplay() { return format(upgradeEffect("n", 11)) + "x" },
        },
        12: {
            title: "Spoils of War",
            description: "Boost armament generation based on necropoli.",
            canAfford() { return player.n.unlocked && player.n["13"].gte(this.cost) },
            pay() { if (player.n["13"].gte(this.cost)) { player.n["13"] = player.n["13"].minus(this.cost) } },
            cost: new Decimal(250),
            currencyDisplayName: "research",
            effectDisplay() { return format(player.n.points.pow(3)) + "x" },
        },
    }
    
})

addLayer("n1", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},
    position: 1,
    color: "#4BDC13",                       // The color for this layer, which affects many elements.
    resource: "prestige points",            // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).
    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.
    requires: new Decimal(10),              // The amount of the base needed to  gain 1 of the prestige currency. Also the amount required to unlock the layer.
    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,
    layerShown() { return false },
    tabFormat: ["milestones"],           // Returns a bool for if this layer's node should be visible in the tree.
    milestones: {
        0: {
            requirementDescription: "500 total research",
            effectDescription: "Death factory autobuyer",
            done() { return player.n["13total"].gte(500) },
            toggles: [["f", "auto"]],
            style() { return {'width': '100%'} },
        },
    },
})

addLayer("n2", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},
    position: 1,
    color: "#4BDC13",                       // The color for this layer, which affects many elements.
    resource: "prestige points",            // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).
    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.
    requires: new Decimal(10),              // The amount of the base needed to  gain 1 of the prestige currency. Also the amount required to unlock the layer.
    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,
    layerShown() { return false },
    tabFormat: ["milestones"],          // Returns a bool for if this layer's node should be visible in the tree.
    milestones: {
        0: {
            requirementDescription: "500 seconds of research",
            effectDescription: "Unlock the third row of skills",
            done() { return player.n["resTime"].gte(500) },
            style() { return {'width': '100%'} },
        },
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
    row: 2,                                 // The row this layer is on (0 is the first row).
    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.
    requires: new Decimal(10),              // The amount of the base needed to  gain 1 of the prestige currency. Also the amount required to unlock the layer.
    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,
    layerShown() { return "ghost" }            // Returns a bool for if this layer's node should be visible in the tree.
})

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
    researchCompleted: true,
    symbol: "MN",
    row: 0,
    position: 0,
    effect() {
        eff = new Decimal(2)
        return eff
    },
    layerShown() { return true },
    canClick: function() { return (getExpPoints().gte(player[this.layer].cost) && !player[this.layer].bought && prereqsPurchased(this.layer) && this.researchCompleted) },
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

/* addAltNode("g8", {
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
        
    },
    tooltip() { return "Coming soon" },
    tooltipLocked() { return "Coming soon" },
}) */

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
    researchCompleted: true,
    symbol: "PT",
    branches: ["mn"],
    row: 1,
    position: 0,
    effect() {
        eff = new Decimal(4)
        return eff
    },
    layerShown() { return true },
    canClick: function() { return (getExpPoints().gte(player[this.layer].cost) && !player[this.layer].bought && prereqsPurchased(this.layer) && this.researchCompleted) },
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

/addAltNode("g4", {
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
    canClick() { return true }, //(player.p.total.minus(player.p.spent)).gte(player.m.cost) },
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
    canClick: function() { return (getExpPoints().gte(player[this.layer].cost) && !player[this.layer].bought && prereqsPurchased(this.layer) && this.researchCompleted) },
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
        return eff
    },
    psEffect() {
        eff = player["n"]["11"]
        eff = eff.sqrt().times(player["n"]["11"].min(tmp["pp"].effect)).div(3).max(1)
        return eff
    },
    layerShown() { return true },
    canClick: function() { return (getExpPoints().gte(player[this.layer].cost) && !player[this.layer].bought && prereqsPurchased(this.layer) && this.researchCompleted) },
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

addNode( "plus", {
    name: "addspeed",
    symbol: "+",
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1), 
        bought: false,
    }},  
    layerShown() { return true },
    notify: false,
    prestigeNotify: false,
    row: "side",
    position: 0,
    color: "#ffffff",
    canClick() { return true },
    onClick: function() { player["devSpeed"] += 1 },
    tooltip() { return "+1 dev speed" },
    tooltipLocked() { return "locked" },
})

addNode( "minus", {
    name: "subspeed",
    symbol: "-",
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
        points: new Decimal(1),
        bought: false,          
    }}, 
    layerShown() { return true },
    notify: false,
    prestigeNotify: false,
    row: "side",
    position: 1,
    color: "#ffffff",
    canClick() { return (player["devSpeed"] > 1) },
    onClick: function() { player["devSpeed"] -= 1 },
    tooltip() { return "-1 dev speed"},
    tooltipLocked() { return "-1 dev speed\nalready at 0" },
})