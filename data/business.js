// Business landscape — the top money-making organizations and companies in jiu-jitsu.
// Revenue and scale figures are directional estimates from public reporting and industry
// discussion, meant to convey relative size rather than audited financials.

window.BUSINESS = {
  intro: "Jiu-jitsu has grown from a niche martial art into a global industry spanning tournaments, gyms, media, apparel, and instructional content. Below are the categories and companies driving the money in the sport.",
  categories: [
    {
      name: "Tournament Organizations & Promotions",
      icon: "🏟️",
      color: "#dc2626",
      companies: [
        { name: "IBJJF (International Brazilian Jiu-Jitsu Federation)", model: "Sanctioning body & events", detail: "The dominant governing body of gi competition. Revenue comes from competitor registration fees (events draw thousands of entrants), annual membership, spectator tickets, and streaming. Its Worlds, Pans, and Europeans are the sport's tentpole gi events.", scale: "Largest tournament org" },
        { name: "ADCC", model: "Premier no-gi championship", detail: "The most prestigious no-gi brand. Revenue from ticketing (arena-scale live events), pay-per-view/streaming, sponsorships, and a growing network of qualifying trials worldwide. Winning ADCC massively boosts an athlete's market value.", scale: "Marquee no-gi brand" },
        { name: "ONE Championship", model: "Global MMA/martial-arts promotion", detail: "A billion-dollar-valued Asian promotion that added submission grappling to its broadcasts, paying stars like the Ruotolo brothers and Mikey Musumeci salaried contracts to compete on global TV — a major professionalization of the sport.", scale: "Billion-$ valuation" },
        { name: "Craig Jones Invitational (CJI)", model: "High-purse invitational", detail: "Launched in 2024 with a record-breaking prize purse (reportedly over $3 million across the event, with $1M to division winners), deliberately scheduled against ADCC. It reset athlete pay expectations and showed the commercial appetite for grappling.", scale: "Record prize money" },
        { name: "UFC Fight Pass Invitational", model: "Streaming-platform events", detail: "The UFC's streaming service produces its own submission grappling cards, leveraging the world's biggest MMA brand and subscriber base to distribute high-level jiu-jitsu.", scale: "UFC-backed distribution" }
      ]
    },
    {
      name: "Gym Franchises & Academies",
      icon: "🏢",
      color: "#2563eb",
      companies: [
        { name: "Gracie Barra", model: "Global gym franchise", detail: "One of the largest BJJ franchise networks in the world, with 900+ schools across dozens of countries. Revenue flows from franchise/licensing fees, membership dues, curriculum, and branded apparel — the McDonald's-scale model of BJJ instruction.", scale: "900+ schools" },
        { name: "Gracie University (Gracie Academy)", model: "Curriculum & online licensing", detail: "The Rener & Ryron Gracie operation built around the Gracie Combatives curriculum, certified training centers, and a large online learning platform — monetizing the Gracie name and self-defense system globally.", scale: "Global online reach" },
        { name: "Atos, AOJ, Alliance, Checkmat, New Wave, B-Team", model: "Elite competition teams / affiliations", detail: "Powerhouse competition academies monetize through affiliation networks, seminars, private lessons, apparel, and the sponsorship value of their champion rosters. Their athletes are the marketing engine for the whole ecosystem.", scale: "Champion-producing brands" },
        { name: "10th Planet Jiu-Jitsu", model: "No-gi franchise system", detail: "Eddie Bravo's no-gi-focused system grew into a large affiliation network of gyms worldwide, monetizing a distinctive curriculum, branding, and the EBI competition format.", scale: "Large no-gi network" }
      ]
    },
    {
      name: "Instructional Media & Streaming",
      icon: "📺",
      color: "#7c3aed",
      companies: [
        { name: "BJJ Fanatics", model: "Instructional video marketplace", detail: "The dominant seller of premium instructional video courses, partnering with virtually every top competitor (Gordon Ryan, Danaher, Marcelo Garcia, etc.). A high-margin digital business — reportedly a multi-eight-figure annual revenue operation and one of the most profitable companies in the sport.", scale: "Category leader" },
        { name: "FloGrappling (FloSports)", model: "Subscription streaming & media", detail: "The primary streaming home for elite grappling (WNO, IBJJF, ADCC broadcasts, news, and rankings). Monetizes through subscriptions and produces its own marquee super-fight events, shaping the sport's media narrative.", scale: "Premier streamer" },
        { name: "Athlete instructionals & subscriptions", model: "Creator-owned content", detail: "Top competitors increasingly sell their own app-based instructionals and subscription platforms (e.g., systemized 'A-to-Z' courses), capturing margin directly and turning technical knowledge into a recurring-revenue business.", scale: "Creator economy" }
      ]
    },
    {
      name: "Apparel, Gear & Gis",
      icon: "🥋",
      color: "#059669",
      companies: [
        { name: "Shoyoroll", model: "Premium limited-drop gis", detail: "A hype-driven premium gi brand famous for limited 'batch' drops that sell out instantly and command resale premiums — the streetwear model applied to kimonos, with cult brand loyalty and high margins.", scale: "Premium / hype leader" },
        { name: "Venum, Hayabusa, Tatami, Kingz, Fuji, Hyperfly", model: "Gear & apparel brands", detail: "A competitive field of manufacturers selling gis, rash guards, belts, and accessories globally. Growth tracks the sport's expanding participant base; sponsorship of top athletes and teams is the primary marketing channel.", scale: "Broad gear market" },
        { name: "Origin / made-in-USA & niche brands", model: "Vertically integrated apparel", detail: "Brands differentiating on domestic manufacturing, materials, and lifestyle branding (some tied to popular podcasts and personalities) capture premium buyers and blur the line between fight gear and lifestyle apparel.", scale: "Premium niche" }
      ]
    },
    {
      name: "Media, Events & Personalities",
      icon: "🎙️",
      color: "#d97706",
      companies: [
        { name: "The Joe Rogan effect & podcasts", model: "Attention & audience", detail: "Mainstream podcasters and BJJ-practitioner celebrities have driven enormous crossover interest, funneling new hobbyists (and their gym dues, gear purchases, and event tickets) into the sport — an indirect but massive commercial engine.", scale: "Mass-audience funnel" },
        { name: "Seminars & private lessons", model: "Athlete direct income", detail: "For most top grapplers, the traveling seminar circuit and private lessons remain a core income stream, often out-earning competition purses. A world title is largely valuable as a multiplier on seminar demand.", scale: "Core athlete income" },
        { name: "Sponsorship & supplements", model: "Endorsements", detail: "Supplement companies, CBD/recovery brands, energy drinks, and equipment makers sponsor athletes, teams, and events, mirroring the endorsement economy of larger sports on a smaller but growing scale.", scale: "Growing sponsor pool" }
      ]
    }
  ],
  takeaways: [
    "The biggest margins are digital: instructional video (BJJ Fanatics) and streaming (Flo) outscale most physical-product businesses.",
    "Gym franchising (Gracie Barra) is the largest footprint by locations and recurring membership revenue.",
    "Prize money has surged — CJI's multi-million-dollar purse in 2024 signaled real professionalization of athlete pay.",
    "For individual athletes, seminars, private lessons, and their own instructionals typically dwarf competition winnings.",
    "The sport's commercial growth is fueled by a booming amateur participant base — every hobbyist is a customer for gyms, gear, and content."
  ]
};
