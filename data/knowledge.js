// Knowledge base — history, rules, belts, positions, submissions, and major events.

window.KNOWLEDGE = {
  history: {
    title: "History & Origins",
    icon: "📜",
    intro: "Jiu-jitsu is a grappling martial art built on leverage, control, and submission. Modern competitive jiu-jitsu is dominated by Brazilian Jiu-Jitsu (BJJ), a ground-fighting system refined in Brazil in the 20th century.",
    entries: [
      { h: "Japanese roots (Jujutsu → Judo)", t: "The art traces to Japanese jujutsu, the close-combat systems of the samurai. In 1882 Jigoro Kano refined and modernized these into Judo, emphasizing throws, groundwork (newaza), and a live-sparring (randori) methodology that would prove central to jiu-jitsu's evolution." },
      { h: "Mitsuyo Maeda brings it to Brazil", t: "Kano sent skilled judoka abroad to spread the art. One of them, Mitsuyo 'Count Koma' Maeda, settled in Brazil in the early 1900s and taught his ground-focused judo to members of the Gracie family and others in Belém." },
      { h: "The Gracie family adaptation", t: "Carlos and Hélio Gracie adapted Maeda's teachings, emphasizing technique and leverage so a smaller person could defeat a larger, stronger opponent — largely by fighting from the guard and other bottom positions. This became the foundation of Gracie / Brazilian Jiu-Jitsu." },
      { h: "The Gracie Challenge & UFC 1", t: "The Gracies promoted 'Gracie Challenge' matches against other styles to prove BJJ's effectiveness. In 1993, Royce Gracie won the first UFC using BJJ against larger opponents, igniting a global explosion of interest in ground fighting and mixed martial arts." },
      { h: "The modern era", t: "From the 2000s onward the sport professionalized: the IBJJF standardized gi competition, ADCC elevated no-gi submission grappling, and a leg-lock revolution (led by figures like John Danaher's students) reshaped strategy. Streaming, super-fights, and big-money invitationals have since turned top grapplers into full-time professional athletes." }
    ]
  },
  belts: {
    title: "Belt System & Ranks",
    icon: "🥋",
    intro: "BJJ is famous for its slow, demanding promotion system. Ranks progress through colored belts, each often marked with up to four stripes/degrees before promotion. Reaching black belt commonly takes about a decade of consistent training.",
    ranks: [
      { belt: "White", color: "#f5f5f5", text: "#222", desc: "The beginner rank. Focus is on survival, escapes, and learning fundamental positions and the basic language of the art." },
      { belt: "Blue", color: "#2563eb", text: "#fff", desc: "A large technical toolbox. Blue belts understand the major positions and submissions and begin developing a personal game." },
      { belt: "Purple", color: "#7c3aed", text: "#fff", desc: "An advanced practitioner. Purple belts have refined technique, timing, and the ability to chain attacks and defenses fluidly." },
      { belt: "Brown", color: "#78350f", text: "#fff", desc: "The final step before black belt — polishing, tightening, and rounding out any remaining weaknesses in the game." },
      { belt: "Black", color: "#111", text: "#fff", desc: "Expert level and the goal of most practitioners. Black belts have degrees (stripes) marking continued years of experience and contribution." },
      { belt: "Coral (Red/Black)", color: "#b91c1c", text: "#fff", desc: "7th degree black belt — a coral belt (red and black). Awarded after decades at black belt to distinguished masters of the art." },
      { belt: "Red", color: "#dc2626", text: "#fff", desc: "9th degree — the highest rank, reserved for pioneers and grandmasters whose influence shaped the art itself." }
    ],
    kidsNote: "Youth practitioners progress through additional belts (grey, yellow, orange, green) before they are old enough to earn adult colored belts."
  },
  giNoGi: {
    title: "Gi vs. No-Gi",
    icon: "👕",
    intro: "Competitive jiu-jitsu splits into two major formats, each with distinct strategy and equipment.",
    entries: [
      { h: "Gi", t: "Practitioners wear the traditional uniform (gi/kimono) and belt. Grips on the collar, sleeves, and pants are legal, enabling a slower, more control- and grip-fighting-oriented game with a huge variety of collar chokes and lapel-based techniques. The IBJJF World Championship (Mundials) is the pinnacle gi event." },
      { h: "No-Gi", t: "Athletes wear rash guards and shorts — no grips on clothing. The pace is faster and more scramble-heavy, with an emphasis on body locks, underhooks, leg locks, and wrestling. ADCC is the premier no-gi submission grappling championship." },
      { h: "Why it matters", t: "Many techniques transfer, but the strategic meta differs sharply. Gi favors methodical control and collar chokes; no-gi rewards speed, leg entanglements, and front-headlock/guillotine systems. Elite all-rounders train both; specialists dominate one." }
    ]
  },
  positions: {
    title: "Key Positions",
    icon: "🤼",
    intro: "Jiu-jitsu is a game of positional hierarchy — advancing to more dominant positions before hunting submissions. Understanding the positional ladder is the core of the art's strategy.",
    items: [
      { name: "Guard", value: 2, note: "Bottom position with legs between you and opponent. Defensive but highly offensive in BJJ — sweeps and submissions launch from here (closed, open, half, butterfly, X, de la Riva)." },
      { name: "Half Guard", value: 3, note: "You control one of the opponent's legs. A key battleground for both sweeps (bottom) and passing (top)." },
      { name: "Side Control", value: 5, note: "Top, perpendicular, chest-to-chest control after passing the guard. Worth 3 points in IBJJF as a passing result and a launching pad to mount or the back." },
      { name: "Knee-on-Belly", value: 6, note: "Top control with a knee on the opponent's torso — mobile, pressure-heavy, and worth 2 points, setting up mount or submissions." },
      { name: "Mount", value: 8, note: "Sitting on the opponent's torso — a highly dominant top position worth 4 points, ideal for chokes and armbars." },
      { name: "Back Control", value: 10, note: "The most dominant position: chest to the opponent's back with hooks or a body triangle. Worth 4 points and the highest-percentage place to finish with the rear naked choke." }
    ]
  },
  submissions: {
    title: "Core Submissions",
    icon: "🔒",
    intro: "Submissions end a match by forcing a tap via choke or joint lock. They fall into two broad families: strangles (chokes) and joint locks.",
    groups: [
      { family: "Strangles / Chokes", color: "#dc2626", subs: [
        { name: "Rear Naked Choke", note: "The highest-percentage finish, applied from back control. A blood choke that ends fights quickly." },
        { name: "Cross-Collar Choke", note: "A gi choke using the opponent's own collar, iconic from mount and guard (Roger Gracie's signature)." },
        { name: "Guillotine", note: "A front-headlock choke, central to modern no-gi. Variations include the arm-in 'Marcelotine.'" },
        { name: "Triangle Choke", note: "A leg-based strangle from the guard, trapping the head and one arm." },
        { name: "Darce / Anaconda", note: "Arm-in front-headlock chokes favored in fast no-gi scrambles." }
      ]},
      { family: "Joint Locks", color: "#2563eb", subs: [
        { name: "Armbar", note: "Hyperextension of the elbow, available from guard, mount, and back — the most versatile joint lock." },
        { name: "Kimura", note: "A shoulder lock using a figure-four grip; also a powerful control and sweep tool." },
        { name: "Heel Hook", note: "A rotational knee/ankle lock and the centerpiece of the modern leg-lock revolution — extremely fast and dangerous." },
        { name: "Straight Ankle Lock", note: "A foundational leg lock, legal at nearly all levels, attacking the ankle and Achilles." },
        { name: "Omoplata", note: "A shoulder lock applied with the legs from guard, doubling as a sweep and control position." }
      ]}
    ]
  },
  rules: {
    title: "Rules & Scoring",
    icon: "⚖️",
    intro: "Different organizations use different rule sets. The two dominant systems are IBJJF (points-based, gi and no-gi) and ADCC (points + overtime, no-gi). Submission-only formats reward finishing above all.",
    systems: [
      { name: "IBJJF Points", desc: "Positional advancement scores points: Takedown 2, Sweep 2, Knee-on-belly 2, Guard pass 3, Mount 4, Back control 4. Advantages break ties. A submission ends the match instantly regardless of score." },
      { name: "ADCC", desc: "The premier no-gi format. A first period of no points encourages submission attempts, followed by a points period; overtime and negative points for stalling shape a finish-oriented strategy. Nearly all leg locks are legal." },
      { name: "Submission-Only / EBI Overtime", desc: "No points at all — win only by submission. If time expires, some events use EBI-style overtime rounds from back control or spider-web to force a result. Rewards aggressive finishers." }
    ]
  },
  events: {
    title: "Major Championships",
    icon: "🏆",
    intro: "The competitive calendar revolves around a handful of marquee events that define legacies and rankings.",
    items: [
      { name: "IBJJF World Championship (Mundials)", note: "The most prestigious gi tournament — the true 'world title' of gi jiu-jitsu, held annually in California." },
      { name: "ADCC World Championship", note: "The Olympics of no-gi submission grappling, held every two years. Winning ADCC is the crowning achievement in no-gi." },
      { name: "IBJJF Pans & Europeans", note: "Massive continental championships that, alongside Worlds, form the gi 'grand slam' of major titles." },
      { name: "IBJJF No-Gi Worlds", note: "The premier IBJJF event for the no-gi ruleset, distinct from ADCC." },
      { name: "Who's Number One (WNO)", note: "FloGrappling's premium super-fight card featuring elite matchups under submission-focused rules." },
      { name: "Craig Jones Invitational (CJI)", note: "A disruptive, high-purse invitational launched in 2024 that paid athletes record prize money and challenged ADCC's dominance." },
      { name: "ONE Championship (Submission Grappling)", note: "The martial-arts promotion that pays grapplers like the Ruotolos to compete in high-profile no-gi bouts on global broadcasts." }
    ]
  }
};
