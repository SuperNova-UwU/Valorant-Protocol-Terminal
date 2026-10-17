/**
 * VALORANT PROTOCOL // DEV DIARIES & PATCH INTELLIGENCE
 * Comprehensive updates database: Live patch notes, future roadmap & archive.
 */

window.VALORANT_DEV_DIARIES = {
  currentPatch: {
    version: "9.08",
    title: "EPISODE 9 ACT III // PROTOCOL REFINEMENT & MAP OVERHAULS",
    releaseDate: "OCTOBER 2026",
    status: "LIVE ON SERVERS",
    summary: "Patch 9.08 introduces substantial map rotation adjustments with the triumphant return of Pearl and Split, targeted agent adjustments to Vyse and Clove, Sunset B-Site architectural redesign, and next-gen Vanguard anti-cheat heuristic updates.",
    keyMetrics: [
      { label: "MAPS ROTATED", value: "4 SITES" },
      { label: "AGENTS TUNED", value: "4 OPERATIVES" },
      { label: "VANGUARD TELEMETRY", value: "KERNEL V3.2" },
      { label: "TICK RATE", value: "128 HZ FIXED" }
    ],
    highlights: [
      {
        category: "MAP UPDATES",
        badge: "CRITICAL",
        title: "Competitive Map Pool Rotation: Pearl & Split Return",
        content: "Pearl and Split return to the active Competitive and Unrated queues. Lotus and Icebox cycle out into the reserve pool for architectural adjustments. Pearl features refined mid-connector sightlines and widened B-Hall cover, while Split receives visual clarity upgrades on A-Ramps.",
        details: [
          "Split: Mid Mail heaven window lowered by 8cm for fairer peek angles against sniper rifles.",
          "Pearl: B Long pillar shifted 1.2m closer to site to prevent instant pre-aim spam from spawn.",
          "Icebox & Lotus removed from competitive matchmaking pool."
        ]
      },
      {
        category: "MAP UPDATES",
        badge: "OVERHAUL",
        title: "Sunset Site Redesign: B-Main & Boba Rework",
        content: "B-Site on Sunset was overly challenging for defenders to retake once attackers set up post-plant spam. We have redesigned B-Main choke width, elevated the defensive nesting box, and removed several cheesy off-angle pixel peeks.",
        details: [
          "B-Main entrance narrowed by 15% to allow Sentinels more reliable trap coverage.",
          "Boba pillar transformed into solid radiant concrete barrier, eliminating one-way smoke exploit.",
          "Market door auto-close sound attenuation increased for clearer audio cues across Mid."
        ]
      },
      {
        category: "AGENT BALANCING",
        badge: "BALANCING",
        title: "Vyse, Yoru & Clove Tactical Tuning",
        content: "Following Vyse's tactical deployment in Patch 9.04, we are fine-tuning her Arc Rose windup speed and Shear wall visibility to ensure counterplay remains responsive.",
        details: [
          "Vyse [Arc Rose]: Blind windup audio cue increased in volume by 12%; windup time adjusted from 0.8s to 0.9s to reward fast reflexes.",
          "Vyse [Shear]: Wall activation visual flare heightened so opponents immediately recognize trap trigger.",
          "Clove [Pick-Me-Up]: Overheal duration normalized from 10s to 8s to prevent excessive chained duels.",
          "Yoru [Fakeout]: Clone decoy destruction particle now properly triggers Cypher Spycam alert."
        ]
      },
      {
        category: "ANTI-CHEAT & SYSTEMS",
        badge: "SECURITY",
        title: "Riot Vanguard Kernel v3.2 & RR Rollback Compensation",
        content: "Our anti-cheat systems have been upgraded with hardware-level hypervisor checks to instantly intercept DMA (Direct Memory Access) cheats. Furthermore, matches nullified by a cheater ban will now automatically refund Rank Rating (RR) to all non-partied victims within 10 minutes.",
        details: [
          "Automated RR Restitution: If a match is flagged and banned by Vanguard, affected opponents receive up to +25 RR compensation.",
          "Hardware spoofing resistance upgraded to secure firmware TPM 2.0 validation."
        ]
      }
    ]
  },

  upcomingRoadmap: [
    {
      id: "collider",
      quarter: "EPISODE 10 ACT I",
      target: "COMING SOON",
      title: "PROJECT 'COLLIDER' & NEW OPERATIVE 'TEJO'",
      codename: "OPERATIVE #26 // TEJO",
      role: "INITIATOR / DISRUPTOR",
      origin: "COLOMBIA",
      description: "Valorant Protocol intercepts new radiant seismic energy signatures from the Andes. Operative Tejo wields localized sonic shockwaves, structural tremors, and subterranean sensory probes designed to dislodge stubborn Sentinel defensive nests.",
      milestones: [
        { label: "Concept & Kit Design", status: "COMPLETED", progress: 100 },
        { label: "VFX & Sound Design", status: "COMPLETED", progress: 100 },
        { label: "Pro Play Internal Testing", status: "IN PROGRESS", progress: 85 },
        { label: "PBE Public Testing", status: "SCHEDULED", progress: 40 }
      ],
      teaserQuote: "'When the ground underneath you shatters, there is nowhere left to hide.' - Tejo"
    },
    {
      id: "replay-system",
      quarter: "IN PRODUCTION",
      target: "PUBLIC BETA",
      title: "TACTICAL IN-CLIENT REPLAY ENGINE",
      codename: "SYSTEM PROTOCOL // OBSERVER",
      role: "ENGINE FEATURE",
      origin: "GLOBAL ENGINE TEAM",
      description: "A comprehensive cinematic and tactical match replay system built directly into the client. Review every round from any player's perspective, engage free-cam drone flight, trace bullet penetration vectors, and analyze crosshair placement with millisecond precision.",
      milestones: [
        { label: "Network Packet Serialization", status: "COMPLETED", progress: 100 },
        { label: "Tick-Accurate State Scrubbing", status: "COMPLETED", progress: 95 },
        { label: "Observer UI & Heatmaps", status: "IN PROGRESS", progress: 75 },
        { label: "Server Storage Scaling", status: "TESTING", progress: 60 }
      ],
      teaserQuote: "'Every duel, every angle, every split-second decision laid bare for competitive study.'"
    },
    {
      id: "ue5-migration",
      quarter: "TECH DIARY",
      target: "FUTURE DEPLOYMENT",
      title: "UNREAL ENGINE 5 CORE PIPELINE PORT",
      codename: "CORE UPGRADE // RADIANT LIGHT",
      role: "PERFORMANCE & GRAPHICS",
      origin: "RIOT ARCHITECTURE LAB",
      description: "Modernizing the underlying game engine to an optimized branch of Unreal Engine 5. Focus remains steadfastly on competitive integrity: zero input latency penalty, 240+ FPS on mid-range rigs, improved CPU multithreading, and ultra-crisp radiant ability particle rendering.",
      milestones: [
        { label: "Input Subsystem Modernization", status: "COMPLETED", progress: 100 },
        { label: "Shader Cache & Draw Call Reduction", status: "IN PROGRESS", progress: 80 },
        { label: "Frame Pacing Optimization", status: "IN PROGRESS", progress: 70 }
      ],
      teaserQuote: "'Crisp 128-tick competitive purity, backed by next-decade rendering pipelines.'"
    }
  ],

  pastPatches: [
    {
      version: "9.04",
      date: "AUGUST 2026",
      title: "NEW SENTINEL 'VYSE' DEPLOYMENT & CONSOLE SYNC",
      summary: "Vyse arrives with radiant liquid metal control. Consolidation of PC and console matchmaking balance, and Abyss map competitive adjustments.",
      tags: ["NEW AGENT", "SENTINEL", "MAPS"],
      changes: [
        "Vyse Released: Arc Rose (Blind), Shear (Wall), Razorvine (Slow/Damage), Steel Garden (Jam Weapon Ultimate).",
        "Abyss: Fixed mid jump-down ledge collision bug.",
        "Console: Enhanced Aim Curves for custom controller bindings."
      ]
    },
    {
      version: "8.11",
      date: "JUNE 2026",
      title: "THE DUELIST META RESHUFFLE: ISO, REYNA & NEON",
      summary: "Massive overhaul for the Duelist roster aimed at breaking Jett & Raze pick-rate monopoly.",
      tags: ["BALANCING", "DUELISTS", "BUFF / NERF"],
      changes: [
        "Iso: Double Tap shield immediately grants shield on cast without needing initial kill orb.",
        "Neon: Fast Lane sprint speed buffed; slide accuracy while running dramatically increased.",
        "Reyna: Devour heal rate boosted, Dismiss speed scaled, Leer blind range normalized.",
        "Raze: Blast Pack horizontal momentum slightly decayed on secondary bounce."
      ]
    },
    {
      version: "8.08",
      date: "MAY 2026",
      title: "CYPHER & VIPER CONTROLLER/SENTINEL RESHAPE",
      summary: "Tuning down oppressive continuous utility uptime from Cypher's Trapwires and Viper's Toxic Screen.",
      tags: ["SENTINEL", "CONTROLLER", "BALANCE"],
      changes: [
        "Cypher: Trapwire re-arm delay increased from 1s to 2s upon trip.",
        "Viper: Toxic Screen and Poison Cloud fuel drain rate increased when both are active.",
        "Brimstone: Stim Beacon radius increased by 10%."
      ]
    },
    {
      version: "8.05",
      date: "MARCH 2026",
      title: "IMMORTAL CONTROLLER 'CLOVE' INTRODUCED",
      summary: "Clove enters the fray from Scotland with post-death smoke casting and aggressive combat revival.",
      tags: ["NEW AGENT", "CONTROLLER", "SCOTLAND"],
      changes: [
        "Clove Released: Ruse (Post-Death Smokes), Meddle (Decay Orb), Pick-Me-Up (Speed & Overheal), Not Dead Yet (Self-Revive).",
        "Premier: Playoff tournament seeding rules updated.",
        "Voice Chat: Voice quality codec update with lower latency."
      ]
    },
    {
      version: "8.00",
      date: "JANUARY 2026",
      title: "EPISODE 8: DEFIANCE // NEW SNIPER 'OUTLAW'",
      summary: "First new weapon added to Valorant since launch: The Outlaw double-barrel sniper rifle, plus Icebox return.",
      tags: ["NEW WEAPON", "OUTLAW", "EPISODE 8"],
      changes: [
        "Outlaw Released: 2,400 Credits, 2-round magazine, 140 body damage, deadly against Light Armor.",
        "Icebox returns with revamped B Green and Mid container heights.",
        "Lotus B-Site site pillars modified."
      ]
    }
  ],

  devArticles: [
    {
      id: "vanguard-deep-dive",
      date: "OCTOBER 2026",
      title: "DEEP DIVE: HOW VANGUARD NEUTRALIZES KERNEL-LEVEL EXPLOITS",
      author: "RIOT K-DOG // LEAD SECURITY ARCHITECT",
      readTime: "6 MIN READ",
      excerpt: "An architectural review of how Riot Vanguard monitors hardware bus signals, intercepts DMA peripherals, and ensures that Valorant remains the gold standard of competitive PC integrity.",
      tags: ["SECURITY", "ENGINEERING", "VANGUARD"]
    },
    {
      id: "map-philosophy",
      date: "SEPTEMBER 2026",
      title: "MAP ARCHITECTURE 2026: BALANCING THREE-LANE WITH VERTICALITY",
      author: "SALGAR // MAP DESIGN LEAD",
      readTime: "5 MIN READ",
      excerpt: "From Abyss's bottomless chasms to Split's steep chokepoints: How our level designers create spaces that encourage cross-ability synergy while maintaining pure gunplay fundamentals.",
      tags: ["MAP DESIGN", "LEVEL DESIGN"]
    },
    {
      id: "agent-meta-philosophy",
      date: "AUGUST 2026",
      title: "WHY AGENT BALANCING STARTS AT THE TOP: PRO PLAY VS RADIANT QUEUE",
      author: "PENGUIN // COMBAT DESIGN LEAD",
      readTime: "7 MIN READ",
      excerpt: "Behind the curtain on our telemetry matrices: How we decide when an agent's utility is oppressive, when pick-rates lie, and how we keep all 29 operatives viable.",
      tags: ["COMBAT DESIGN", "BALANCE"]
    }
  ]
};
