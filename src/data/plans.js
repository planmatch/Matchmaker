/* ---------------------------------------------------------
   Truoba — primary plan provider, tracked referral link
   (?ref=609). Truoba only sells modern/contemporary designs, so
   only this catalog's "modern" plans are real Truoba plans — each
   carries its own verified truobaUrl pointing at its actual detail
   page, sourced from truoba.com/house-plans/. The other styles below
   remain sample-only and have no provider link, rather than pointing
   a "See on Truoba" button at a plan Truoba doesn't actually sell.
--------------------------------------------------------- */
function truobaUrl(slug) {
  return `https://www.truoba.com/house-plans/${slug}/?ref=609`;
}

/* ---------------------------------------------------------
   DATA: curated sample house-plan catalog (stand-in for a
   real plan database / affiliate feed in the MVP)
--------------------------------------------------------- */
export const PLANS = [
  {
    id: "PL-1042",
    name: "Millbrook Farmhouse",
    style: "farmhouse",
    beds: 4,
    baths: 3,
    sqft: 2650,
    stories: 2,
    garage: 3,
    price: 285000,
    tags: ["porch", "open floor plan", "primary suite on main", "office"],
    blurb:
      "Wraparound porch, board-and-batten siding, and a great room that opens straight into the kitchen island.",
  },
  {
    id: "PL-2210",
    name: "Sable Ridge Craftsman",
    style: "craftsman",
    beds: 3,
    baths: 2.5,
    sqft: 2180,
    stories: 2,
    garage: 2,
    price: 219000,
    tags: ["porch", "office", "open floor plan"],
    blurb:
      "Tapered columns and exposed rafter tails outside; a flexible den up front works as an office or playroom.",
  },
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
    id: "PL-3355",
    name: "Juniper Trail Ranch",
    style: "ranch",
    beds: 3,
    baths: 2,
    sqft: 1780,
    stories: 1,
    garage: 2,
    price: 176000,
    tags: ["primary suite on main", "open floor plan", "porch"],
    blurb:
      "Everything on one level, including the primary suite tucked away from the two secondary bedrooms.",
  },
  {
    id: "PL-1899",
    name: "Halloway Colonial",
    style: "colonial",
    beds: 5,
    baths: 3.5,
    sqft: 3400,
    stories: 2,
    garage: 3,
    price: 398000,
    tags: ["office", "basement", "formal dining"],
    blurb:
      "A symmetrical brick facade with a center-hall layout, formal dining room, and a walk-out basement.",
  },
  {
    id: "PL-2677",
    name: "Whistler Cabin",
    style: "cabin",
    beds: 2,
    baths: 2,
    sqft: 1240,
    stories: 1,
    garage: 0,
    price: 98000,
    tags: ["porch", "open floor plan", "vaulted ceilings"],
    blurb:
      "A compact A-frame-inspired footprint with a vaulted great room and a full-width front porch.",
  },
  {
    id: "PL-0456",
    name: "Cypress Court Cottage",
    style: "cottage",
    beds: 3,
    baths: 2,
    sqft: 1620,
    stories: 1.5,
    garage: 1,
    price: 154000,
    tags: ["porch", "primary suite on main", "office"],
    blurb:
      "A steep-pitched roof and dormer windows give this cottage two guest rooms tucked upstairs under the eaves.",
  },
  {
    id: "PL-4021",
    name: "Alameda Mediterranean",
    style: "mediterranean",
    beds: 4,
    baths: 3,
    sqft: 2940,
    stories: 2,
    garage: 3,
    price: 356000,
    tags: ["open floor plan", "primary suite on main", "courtyard"],
    blurb:
      "A stucco exterior, clay tile roof, and interior courtyard bring the outdoors into the center of the plan.",
  },
  {
    id: "PL-3018",
    name: "Birchwood Contemporary",
    style: "contemporary",
    beds: 3,
    baths: 2.5,
    sqft: 2050,
    stories: 2,
    garage: 2,
    price: 248000,
    tags: ["open floor plan", "office", "vaulted ceilings"],
    blurb:
      "Clean gable forms with a two-story window wall lighting an open stair and great room below.",
  },
  {
    id: "PL-1533",
    name: "Foxglove Farmhouse",
    style: "farmhouse",
    beds: 3,
    baths: 2,
    sqft: 1890,
    stories: 1,
    garage: 2,
    price: 189000,
    tags: ["porch", "primary suite on main", "mudroom"],
    blurb:
      "A single-story farmhouse with a deep front porch and a mudroom that lands you right off the garage.",
  },
  {
    id: "PL-2894",
    name: "Redstone Craftsman",
    style: "craftsman",
    beds: 4,
    baths: 3,
    sqft: 2510,
    stories: 2,
    garage: 2,
    price: 267000,
    tags: ["porch", "open floor plan", "basement", "office"],
    blurb:
      "Stone-and-shingle exterior with a full unfinished basement, ready to grow into a fifth bedroom later.",
  },
];

export const STYLES = [
  "farmhouse",
  "craftsman",
  "modern",
  "ranch",
  "colonial",
  "cabin",
  "cottage",
  "mediterranean",
  "contemporary",
];

export const FEATURES = [
  "porch",
  "open floor plan",
  "primary suite on main",
  "office",
  "basement",
  "vaulted ceilings",
];
