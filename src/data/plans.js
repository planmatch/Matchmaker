/* ---------------------------------------------------------
   Truoba — primary plan provider, tracked referral link.
   Truoba's catalog is exclusively modern/contemporary designs with
   its own category taxonomy (by size, bed count, etc.), which doesn't
   line up with this app's style list — so rather than fabricate
   unverified per-style deep links, every result points to the same
   tracked referral URL.
--------------------------------------------------------- */
export const TRUOBA_URL = "https://www.truoba.com/?ref=609";

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
    id: "PL-0788",
    name: "Cinder Peak Modern",
    style: "modern",
    beds: 4,
    baths: 3.5,
    sqft: 3120,
    stories: 2,
    garage: 2,
    price: 412000,
    tags: ["open floor plan", "primary suite on main", "basement"],
    blurb:
      "Flat rooflines and floor-to-ceiling glass along the back elevation, with a finished lower level for a media room.",
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
  {
    id: "PL-0912",
    name: "Talbot Modern Ranch",
    style: "modern",
    beds: 3,
    baths: 2,
    sqft: 1950,
    stories: 1,
    garage: 2,
    price: 231000,
    tags: ["primary suite on main", "open floor plan", "vaulted ceilings"],
    blurb:
      "A single-story modern with a low-slung roofline and a great room ceiling that vaults to twelve feet.",
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
