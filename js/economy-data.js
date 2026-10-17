/**
 * VALORANT PROTOCOL // TACTICAL ECONOMY DATABASE
 * Complete weapon catalog, shields, ability costs, and competitive economy thresholds.
 */

window.VALORANT_ECONOMY_DATA = {
  constants: {
    START_CREDS: 800,
    MAX_CREDS: 9000,
    WIN_REWARD: 3000,
    LOSS_STREAK_REWARDS: [1900, 2400, 2900], // 0 losses (1st loss), 1 loss (2nd), 2+ losses (3rd+)
    SPIKE_PLANT_BONUS: 300,
    KILL_BONUS: 200,
    FULL_BUY_MIN_CREDS: 3900, // Rifle (2900) + Heavy Shield (1000)
    SEMI_BUY_MIN_CREDS: 2450, // Spectre/Bulldog (1600-2050) + Light Shield (400)
    HARD_SAVE_CEILING: 1200,  // Max spend allowed while saving for next round
    OVERTIME_CREDS: 5000,     // Fixed credit grant for every Overtime round
    HALFTIME_ROUND: 12,       // Switch sides after round 12
    REGULATION_ROUNDS: 24,    // Standard match regulation limit
    MATCH_WIN_SCORE: 13       // First to 13 wins regulation
  },

  weapons: [
    // SIDEARMS
    {
      id: "classic",
      name: "Classic",
      category: "sidearm",
      categoryLabel: "SIDEARMS",
      cost: 0,
      fireRate: "6.75 rds/sec",
      magazine: "12 / 36",
      wallPen: "Medium",
      headDmg: "78 (0-30m)",
      bodyDmg: "26 (0-30m)",
      icon: "https://media.valorant-api.com/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8/displayicon.png",
      desc: "Standard issue semi-automatic sidearm. Free primary fire with alternate 3-round burst."
    },
    {
      id: "shorty",
      name: "Shorty",
      category: "sidearm",
      categoryLabel: "SIDEARMS",
      cost: 300,
      fireRate: "3.33 rds/sec",
      magazine: "2 / 10",
      wallPen: "Low",
      headDmg: "24 / pellet",
      bodyDmg: "12 / pellet",
      icon: "https://media.valorant-api.com/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda/displayicon.png",
      desc: "Pocket double-barrel shotgun. Devastating at point-blank cubby ambushes and Viper smokes."
    },
    {
      id: "frenzy",
      name: "Frenzy",
      category: "sidearm",
      categoryLabel: "SIDEARMS",
      cost: 450,
      fireRate: "10 rds/sec",
      magazine: "13 / 39",
      wallPen: "Low",
      headDmg: "78 (0-20m)",
      bodyDmg: "26 (0-20m)",
      icon: "https://media.valorant-api.com/weapons/44d4e95c-4157-0037-81b2-17841bf2e8e3/displayicon.png",
      desc: "Fully automatic machine pistol. High run-and-gun potential for aggressive site entries."
    },
    {
      id: "ghost",
      name: "Ghost",
      category: "sidearm",
      categoryLabel: "SIDEARMS",
      cost: 500,
      fireRate: "6.75 rds/sec",
      magazine: "15 / 45",
      wallPen: "Medium",
      headDmg: "105 (0-30m)",
      bodyDmg: "30 (0-30m)",
      icon: "https://media.valorant-api.com/weapons/1baa85b4-4c70-1284-64bb-6481dfc3bb4e/displayicon.png",
      desc: "Silenced precision pistol. 1-taps unshielded opponents on pistol rounds at any range."
    },
    {
      id: "bandit",
      name: "Bandit",
      category: "sidearm",
      categoryLabel: "SIDEARMS",
      cost: 600,
      fireRate: "5.5 rds/sec",
      magazine: "10 / 30",
      wallPen: "Medium",
      headDmg: "130 (0-20m)",
      bodyDmg: "42 (0-20m)",
      icon: "https://media.valorant-api.com/weapons/410b2e0b-4ceb-1321-1727-20858f7f3477/displayicon.png",
      desc: "Tactical compact hand cannon. High mid-range stopping power bridge between Ghost and Sheriff."
    },
    {
      id: "sheriff",
      name: "Sheriff",
      category: "sidearm",
      categoryLabel: "SIDEARMS",
      cost: 800,
      fireRate: "4 rds/sec",
      magazine: "6 / 24",
      wallPen: "High",
      headDmg: "159 (0-30m)",
      bodyDmg: "55 (0-30m)",
      icon: "https://media.valorant-api.com/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702/displayicon.png",
      desc: "High-impact magnum revolver. 1-shot headshot kill on fully shielded enemies up to 30 meters."
    },

    // SMGS & SHOTGUNS
    {
      id: "stinger",
      name: "Stinger",
      category: "smg",
      categoryLabel: "SMGS & SHOTGUNS",
      cost: 1100,
      fireRate: "16 rds/sec",
      magazine: "20 / 60",
      wallPen: "Low",
      headDmg: "67 (0-15m)",
      bodyDmg: "27 (0-15m)",
      icon: "https://media.valorant-api.com/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941/displayicon.png",
      desc: "Extreme fire rate SMG. Melts close-range targets instantly during eco rounds."
    },
    {
      id: "spectre",
      name: "Spectre",
      category: "smg",
      categoryLabel: "SMGS & SHOTGUNS",
      cost: 1600,
      fireRate: "13.33 rds/sec",
      magazine: "30 / 90",
      wallPen: "Medium",
      headDmg: "78 (0-15m)",
      bodyDmg: "26 (0-15m)",
      icon: "https://media.valorant-api.com/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7/displayicon.png",
      desc: "Silenced submachine gun. The gold standard for second-round conversions and anti-eco rounds."
    },
    {
      id: "bucky",
      name: "Bucky",
      category: "shotgun",
      categoryLabel: "SMGS & SHOTGUNS",
      cost: 850,
      fireRate: "1.1 rds/sec",
      magazine: "5 / 10",
      wallPen: "Low",
      headDmg: "40 / pellet",
      bodyDmg: "20 / pellet",
      icon: "https://media.valorant-api.com/weapons/910be174-449b-c412-ab22-d0873436b21b/displayicon.png",
      desc: "Heavy pump-action shotgun with alternate air-burst canister fire."
    },
    {
      id: "judge",
      name: "Judge",
      category: "shotgun",
      categoryLabel: "SMGS & SHOTGUNS",
      cost: 1850,
      fireRate: "3.5 rds/sec",
      magazine: "7 / 21",
      wallPen: "Medium",
      headDmg: "34 / pellet",
      bodyDmg: "17 / pellet",
      icon: "https://media.valorant-api.com/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794/displayicon.png",
      desc: "Rapid-fire automatic drum shotgun. Dominates choke holds, smoke spam, and site retakes."
    },

    // RIFLES
    {
      id: "bulldog",
      name: "Bulldog",
      category: "rifle",
      categoryLabel: "RIFLES",
      cost: 2050,
      fireRate: "10 rds/sec",
      magazine: "24 / 72",
      wallPen: "Medium",
      headDmg: "115 (0-50m)",
      bodyDmg: "35 (0-50m)",
      icon: "https://media.valorant-api.com/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7/displayicon.png",
      desc: "Bullpup rifle with automatic hip-fire and a lethal 3-round burst when ADS zoomed."
    },
    {
      id: "guardian",
      name: "Guardian",
      category: "rifle",
      categoryLabel: "RIFLES",
      cost: 2250,
      fireRate: "5.25 rds/sec",
      magazine: "12 / 36",
      wallPen: "High",
      headDmg: "195 (0-50m)",
      bodyDmg: "65 (0-50m)",
      icon: "https://media.valorant-api.com/weapons/4ade7faa-4cf1-8376-95ef-39884480959b/displayicon.png",
      desc: "Designated marksman rifle. Guaranteed 1-shot headshot kill at any distance with high wall penetration."
    },
    {
      id: "phantom",
      name: "Phantom",
      category: "rifle",
      categoryLabel: "RIFLES",
      cost: 2900,
      fireRate: "11 rds/sec",
      magazine: "30 / 90",
      wallPen: "Medium",
      headDmg: "156 (0-15m) / 140 (15-30m)",
      bodyDmg: "39 (0-15m) / 35 (15-30m)",
      icon: "https://media.valorant-api.com/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a/displayicon.png",
      desc: "Silenced primary rifle. No bullet tracers through smokes, tight spray recoil, and 1-tap headshot within 15m."
    },
    {
      id: "vandal",
      name: "Vandal",
      category: "rifle",
      categoryLabel: "RIFLES",
      cost: 2900,
      fireRate: "9.75 rds/sec",
      magazine: "25 / 75",
      wallPen: "Medium",
      headDmg: "160 (0-50m)",
      bodyDmg: "40 (0-50m)",
      icon: "https://media.valorant-api.com/weapons/9c82e19d-4575-0200-1a81-3eacf00cf872/displayicon.png",
      desc: "Unforgiving precision rifle. Guaranteed 1-shot headshot elimination at any range with zero damage dropoff."
    },
    {
      id: "warden",
      name: "Warden",
      category: "rifle",
      categoryLabel: "RIFLES",
      cost: 2900,
      fireRate: "6.5 rds/sec",
      magazine: "18 / 36",
      wallPen: "Medium",
      headDmg: "200 (Flat all ranges)",
      bodyDmg: "50 (Flat all ranges)",
      icon: "https://media.valorant-api.com/weapons/8db0a1bf-4a50-832a-4566-faaaa6d250ca/displayicon.png",
      desc: "Heavy battle rifle with built-in 2x ADS scope. Devastating 200 flat headshot kill at any range with an 18-round precision magazine."
    },

    // SNIPERS & HEAVY
    {
      id: "marshal",
      name: "Marshal",
      category: "sniper",
      categoryLabel: "SNIPERS & HEAVY",
      cost: 950,
      fireRate: "1.5 rds/sec",
      magazine: "5 / 15",
      wallPen: "Medium",
      headDmg: "202 (0-50m)",
      bodyDmg: "101 (0-50m)",
      icon: "https://media.valorant-api.com/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b/displayicon.png",
      desc: "Light sniper rifle. 1-shot body elimination against enemies with no armor or on eco rounds."
    },
    {
      id: "outlaw",
      name: "Outlaw",
      category: "sniper",
      categoryLabel: "SNIPERS & HEAVY",
      cost: 2400,
      fireRate: "2.75 rds/sec",
      magazine: "2 / 10",
      wallPen: "High",
      headDmg: "238 (0-50m)",
      bodyDmg: "140 (0-50m)",
      icon: "https://media.valorant-api.com/weapons/5f0aaf7a-4289-3998-d5ff-eb9a5cf7ef5c/displayicon.png",
      desc: "Break-action double sniper. 140 body damage instantly punishes enemies buying light shields."
    },
    {
      id: "operator",
      name: "Operator",
      category: "sniper",
      categoryLabel: "SNIPERS & HEAVY",
      cost: 4700,
      fireRate: "0.6 rds/sec",
      magazine: "5 / 10",
      wallPen: "High",
      headDmg: "255 (0-50m)",
      bodyDmg: "150 (0-50m)",
      icon: "https://media.valorant-api.com/weapons/a03b24d3-4319-996d-0f8c-94bbfba1dfc7/displayicon.png",
      desc: "The ultimate sniper rifle. Guaranteed 1-hit kill anywhere to the upper body or head against full armor."
    },
    {
      id: "ares",
      name: "Ares",
      category: "heavy",
      categoryLabel: "SNIPERS & HEAVY",
      cost: 1600,
      fireRate: "10-13 rds/sec",
      magazine: "50 / 100",
      wallPen: "High",
      headDmg: "72 (0-30m)",
      bodyDmg: "30 (0-30m)",
      icon: "https://media.valorant-api.com/weapons/55d8a0f4-4274-ca67-fe2c-06ab45efdf58/displayicon.png",
      desc: "High penetration light machine gun. Wind-up fire rate designed for wall-banging Ascent and Bind."
    },
    {
      id: "odin",
      name: "Odin",
      category: "heavy",
      categoryLabel: "SNIPERS & HEAVY",
      cost: 3200,
      fireRate: "12-15.6 rds/sec",
      magazine: "100 / 200",
      wallPen: "High",
      headDmg: "95 (0-30m)",
      bodyDmg: "38 (0-30m)",
      icon: "https://media.valorant-api.com/weapons/63e6c2b6-4a8e-869c-3d4c-e38355226584/displayicon.png",
      desc: "Unstoppable heavy machine gun. Continuous suppression, unmatched wallbang potential, and site hold."
    }
  ],

  shields: [
    {
      id: "none",
      name: "No Armor",
      cost: 0,
      hp: 0,
      desc: "100 Total HP. Highly vulnerable to Ghost, Marshal, and Stinger."
    },
    {
      id: "light",
      name: "Light Shield",
      cost: 400,
      hp: 25,
      desc: "125 Total HP. Absorbs 66% damage. Vulnerable to Outlaw (140 dmg) and Phantom close headshot."
    },
    {
      id: "heavy",
      name: "Heavy Shield",
      cost: 1000,
      hp: 50,
      desc: "150 Total HP. Maximum protection. Standard requirement for competitive Full Buy rounds."
    }
  ],

  abilities: [
    {
      id: "c-util",
      name: "Tactical Utility C",
      cost: 200,
      charges: 2,
      desc: "Standard agent utility (e.g. Flash, Smoke, Trap, Molly)."
    },
    {
      id: "q-util",
      name: "Tactical Utility Q",
      cost: 250,
      charges: 2,
      desc: "Agent signature utility charges."
    }
  ],

  // Competitive team composition default starting state
  defaultRoster: [
    { id: 1, name: "Jett", role: "Duelist", creds: 4100, weaponId: "vandal", shieldId: "heavy", utilCharges: 2, kills: 1 },
    { id: 2, name: "Sova", role: "Initiator", creds: 3950, weaponId: "vandal", shieldId: "heavy", utilCharges: 2, kills: 0 },
    { id: 3, name: "Omen", role: "Controller", creds: 4300, weaponId: "phantom", shieldId: "heavy", utilCharges: 2, kills: 1 },
    { id: 4, name: "Killjoy", role: "Sentinel", creds: 3800, weaponId: "bulldog", shieldId: "heavy", utilCharges: 1, kills: 0 },
    { id: 5, name: "Flex", role: "Flex / 2nd Duelist", creds: 2900, weaponId: "spectre", shieldId: "light", utilCharges: 1, kills: 0 }
  ],

  // 1-Click Pro Team Presets
  presets: [
    {
      id: "full-buy",
      name: "TEAM FULL BUY",
      tagline: "VANDALS / PHANTOMS + HEAVY SHIELDS",
      desc: "Standard round execution when team has >= 3,900 creds each. Maximum firepower advantage.",
      loadout: { weaponId: "vandal", shieldId: "heavy", utilCharges: 2 },
      targetCreds: 4500
    },
    {
      id: "eco-save",
      name: "FULL ECO / HARD SAVE",
      tagline: "CLASSIC / GHOST + ZERO ARMOR",
      desc: "Spend minimum credits (under $1,000) to guarantee a full rifle + heavy shield purchase next round.",
      loadout: { weaponId: "classic", shieldId: "none", utilCharges: 0 },
      targetCreds: 1800
    },
    {
      id: "force-buy",
      name: "TEAM FORCE BUY",
      tagline: "BULLDOGS / SPECTRES + LIGHT SHIELDS",
      desc: "High-risk tactical gamble to break enemy economy momentum or contest crucial match-point rounds.",
      loadout: { weaponId: "spectre", shieldId: "light", utilCharges: 1 },
      targetCreds: 2200
    },
    {
      id: "bonus-round",
      name: "BONUS CONVERSION",
      tagline: "RETAIN ROUND 2 SMGS VS RIFLES",
      desc: "After winning Round 1 and Round 2, keep surviving Spectres/Bulldogs and spend 0 to bank economy.",
      loadout: { weaponId: "spectre", shieldId: "heavy", utilCharges: 2 },
      targetCreds: 4900
    },
    {
      id: "hero-rifle",
      name: "HERO RIFLE & DROPS",
      tagline: "1-2 VANDALS WITH ECO SUPPORT",
      desc: "Star fragger gets a Vandal dropped by a rich teammate, while rest of team plays close with Shorties/Ghosts.",
      loadout: { weaponId: "ghost", shieldId: "none", utilCharges: 1 },
      targetCreds: 2400
    }
  ]
};
