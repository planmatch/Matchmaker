/* ---------------------------------------------------------
   Real plan providers. Every plan in this catalog links to its own
   verified detail page on one of these — no sample-only plans.

   Truoba (?ref=609) — modern/contemporary designs only.
   Advanced House Plans (?a=6a988b5ac89e5) — everything else this
   catalog covers (farmhouse, craftsman, colonial, cottage,
   mediterranean, contemporary). Neither provider sells "ranch" or
   "cabin" as a distinct style, so those categories were dropped
   rather than showing plans with no real link.
--------------------------------------------------------- */
function truobaUrl(slug) {
  return `https://www.truoba.com/house-plans/${slug}/?ref=609`;
}
function ahpUrl(slug) {
  return `https://advancedhouseplans.com/plan/${slug}?a=6a988b5ac89e5`;
}

export const PLANS = [
  {
    id: "TM-220",
    name: "Truoba Mini 220",
    style: "modern",
    beds: 1,
    baths: 1,
    sqft: 570,
    stories: 1,
    garage: 0,
    price: 700,
    priceNote: "plan set",
    truobaUrl: truobaUrl("tm-220"),
    tags: ["porch"],
    blurb:
      "A 570 sq ft guest-house-scale plan built around one open living space with a fireplace and covered front and side porches.",
  },
  {
    id: "TM-525",
    name: "Truoba Mini 525",
    style: "modern",
    beds: 2,
    baths: 1,
    sqft: 915,
    stories: 1,
    garage: 0,
    price: 900,
    priceNote: "plan set",
    truobaUrl: truobaUrl("tm-525"),
    tags: ["porch"],
    blurb:
      "A compact two-bedroom plan with a wood stove, covered front and side porches, and a rear deck.",
  },
  {
    id: "T-126",
    name: "Truoba 126",
    style: "modern",
    beds: 2,
    baths: 2,
    sqft: 1680,
    stories: 2,
    garage: 0,
    price: 1500,
    priceNote: "plan set",
    truobaUrl: truobaUrl("t-126"),
    tags: ["porch", "open floor plan"],
    blurb:
      "A two-story plan with an open living area linked to covered front and rear porches, a sundeck, and an optional basement.",
  },
  {
    id: "T-218",
    name: "Truoba 218",
    style: "modern",
    beds: 3,
    baths: 2,
    sqft: 1628,
    stories: 2,
    garage: 2,
    price: 1500,
    priceNote: "plan set",
    truobaUrl: truobaUrl("t-218"),
    tags: ["porch", "open floor plan", "primary suite on main"],
    blurb:
      "A mid-century modern design with a main-floor primary suite, a walk-in closet, and a two-car garage.",
  },
  {
    id: "T-225",
    name: "Truoba 225",
    style: "modern",
    beds: 3,
    baths: 2.5,
    sqft: 2170,
    stories: 2,
    garage: 2,
    price: 1600,
    priceNote: "plan set",
    truobaUrl: truobaUrl("t-225"),
    tags: ["porch", "open floor plan", "primary suite on main", "office"],
    blurb:
      "A modern farmhouse with a main-floor primary suite, a home office, a detached garage, and covered porches on three sides.",
  },
  {
    id: "T-322",
    name: "Truoba 322",
    style: "modern",
    beds: 3,
    baths: 2,
    sqft: 2278,
    stories: 2,
    garage: 2,
    price: 1700,
    priceNote: "plan set",
    truobaUrl: truobaUrl("t-322"),
    tags: ["porch", "open floor plan", "primary suite on main", "office"],
    blurb:
      "A modern mid-century plan with a main-floor primary suite, a study room, a mudroom, and covered front and rear porches.",
  },
  {
    id: "TC-125",
    name: "Truoba Class 125",
    style: "modern",
    beds: 4,
    baths: 2.5,
    sqft: 2604,
    stories: 1,
    garage: 2,
    price: 1700,
    priceNote: "plan set",
    truobaUrl: truobaUrl("tc-125"),
    tags: ["porch", "open floor plan", "office"],
    blurb:
      "A single-story four-bedroom plan with a home office, a fireplace, a walk-in pantry, and covered porches front and back.",
  },
  {
    id: "TC-1422",
    name: "Truoba Class 1422",
    style: "modern",
    beds: 4,
    baths: 3.5,
    sqft: 2562,
    stories: 1,
    garage: 2,
    price: 2100,
    priceNote: "plan set",
    truobaUrl: truobaUrl("tc-1422"),
    tags: ["porch", "open floor plan", "office"],
    blurb:
      "The largest plan in the lineup, with a home office, a guest bedroom, and covered porches front and back.",
  },
  {
    id: "AHP-KRISTINE",
    name: "Kristine",
    style: "farmhouse",
    beds: 1,
    baths: 1,
    sqft: 364,
    stories: 2,
    garage: 0,
    price: 499,
    priceNote: "plan set",
    ahpUrl: ahpUrl("kristine"),
    tags: ["vaulted ceilings"],
    blurb:
      "A 364 sq ft modern farmhouse cabin with a cathedral-ceilinged living room, a kitchenette, and a sleeping loft.",
  },
  {
    id: "AHP-GEORGETOWN",
    name: "Georgetown",
    style: "craftsman",
    beds: 3,
    baths: 3,
    sqft: 2268,
    stories: 2,
    garage: 2,
    price: 1599,
    priceNote: "plan set",
    ahpUrl: ahpUrl("georgetown"),
    tags: ["porch", "open floor plan", "office"],
    blurb:
      "A craftsman design with a wrap-around porch, a front den that doubles as an office, and an open great room and kitchen.",
  },
  {
    id: "AHP-BAINBRIDGE",
    name: "Bainbridge",
    style: "colonial",
    beds: 3,
    baths: 2,
    sqft: 1653,
    stories: 1,
    garage: 2,
    price: 1399,
    priceNote: "plan set",
    ahpUrl: ahpUrl("bainbridge"),
    tags: ["porch", "primary suite on main"],
    blurb:
      "A Southern colonial-style single-story home with a wrap-around covered porch and classic round columns.",
  },
  {
    id: "AHP-SPRINGROSE",
    name: "Spring Rose",
    style: "cottage",
    beds: 1,
    baths: 1,
    sqft: 642,
    stories: 1,
    garage: 0,
    price: 899,
    priceNote: "plan set",
    ahpUrl: ahpUrl("spring-rose"),
    tags: ["open floor plan"],
    blurb:
      "A 642 sq ft cottage-style ADU with an open-concept living area and large windows for natural light.",
  },
  {
    id: "AHP-MESACANYON",
    name: "Mesa Canyon",
    style: "mediterranean",
    beds: 3,
    baths: 2,
    sqft: 1701,
    stories: 1,
    garage: 3,
    price: 1499,
    priceNote: "plan set",
    ahpUrl: ahpUrl("mesa-canyon"),
    tags: ["porch", "open floor plan", "primary suite on main"],
    blurb:
      "A single-story Mediterranean home with stucco siding, a covered front porch, and an open great room warmed by a fireplace.",
  },
  {
    id: "AHP-PONOMA",
    name: "Ponoma",
    style: "contemporary",
    beds: 3,
    baths: 3,
    sqft: 2727,
    stories: 1,
    garage: 3,
    price: 1799,
    priceNote: "plan set",
    ahpUrl: ahpUrl("ponoma"),
    tags: ["porch", "open floor plan", "primary suite on main"],
    blurb:
      "A single-story contemporary home with slanted metal rooflines, a covered front porch, and an expansive open great room.",
  },
];

export const STYLES = ["farmhouse", "craftsman", "modern", "colonial", "cottage", "mediterranean", "contemporary"];

export const FEATURES = [
  "porch",
  "open floor plan",
  "primary suite on main",
  "office",
  "basement",
  "vaulted ceilings",
];
