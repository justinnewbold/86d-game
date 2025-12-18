// ============================================
// GAME STATE REDUCER
// ============================================
// Handles all game-related state changes

export const GAME_ACTIONS = {
  // Core game actions
  INIT_GAME: 'INIT_GAME',
  RESET_GAME: 'RESET_GAME',
  ADVANCE_WEEK: 'ADVANCE_WEEK',
  UPDATE_LOCATION: 'UPDATE_LOCATION',
  UPDATE_LOCATIONS: 'UPDATE_LOCATIONS',

  // Financial actions
  UPDATE_CASH: 'UPDATE_CASH',
  UPDATE_CORPORATE_CASH: 'UPDATE_CORPORATE_CASH',
  ADD_LOAN: 'ADD_LOAN',
  PAY_LOAN: 'PAY_LOAN',

  // Staff actions
  HIRE_STAFF: 'HIRE_STAFF',
  FIRE_STAFF: 'FIRE_STAFF',
  TRAIN_STAFF: 'TRAIN_STAFF',
  SET_MANAGER: 'SET_MANAGER',

  // Equipment & upgrades
  BUY_EQUIPMENT: 'BUY_EQUIPMENT',
  BUY_UPGRADE: 'BUY_UPGRADE',

  // Menu management
  TOGGLE_86: 'TOGGLE_86',
  ADD_MENU_ITEM: 'ADD_MENU_ITEM',
  DEVELOP_RECIPE: 'DEVELOP_RECIPE',

  // Marketing & delivery
  TOGGLE_MARKETING: 'TOGGLE_MARKETING',
  TOGGLE_DELIVERY: 'TOGGLE_DELIVERY',
  LAUNCH_VIRTUAL_BRAND: 'LAUNCH_VIRTUAL_BRAND',

  // Expansion
  ADD_LOCATION: 'ADD_LOCATION',
  CLOSE_LOCATION: 'CLOSE_LOCATION',
  SELL_LOCATION: 'SELL_LOCATION',
  ADD_FRANCHISE: 'ADD_FRANCHISE',

  // Empire & stats
  UPDATE_STATS: 'UPDATE_STATS',
  ADD_MILESTONE: 'ADD_MILESTONE',
  UPDATE_COMPETITORS: 'UPDATE_COMPETITORS',

  // Events
  SET_ACTIVE_EVENT: 'SET_ACTIVE_EVENT',
  RESOLVE_EVENT: 'RESOLVE_EVENT',
};

const initialGameState = {
  // Core
  week: 1,
  speed: 1,
  isPaused: false,

  // Locations
  locations: [],
  activeLocationId: 1,

  // Corporate level
  corporateCash: 0,
  loans: [],
  franchises: [],
  competitors: [],

  // Progression
  unlockedMilestones: [],
  stats: {
    totalRevenue: 0,
    totalProfit: 0,
    customersServed: 0,
    staffHired: 0,
    staffFired: 0,
    locationsOpened: 0,
    locationsClosed: 0,
    eventsHandled: 0,
  },

  // Events
  activeEvent: null,
  eventHistory: [],

  // Empire
  empireValuation: 0,
  empireHistory: [],
};

export function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.INIT_GAME:
      return {
        ...initialGameState,
        ...action.payload,
        locations: action.payload.locations || [],
      };

    case GAME_ACTIONS.RESET_GAME:
      return { ...initialGameState };

    case GAME_ACTIONS.ADVANCE_WEEK:
      return {
        ...state,
        week: state.week + 1,
        ...action.payload,
      };

    case GAME_ACTIONS.UPDATE_LOCATION: {
      const { locationId, updates } = action.payload;
      return {
        ...state,
        locations: state.locations.map(loc =>
          loc.id === locationId ? { ...loc, ...updates } : loc
        ),
      };
    }

    case GAME_ACTIONS.UPDATE_LOCATIONS:
      return {
        ...state,
        locations: action.payload,
      };

    case GAME_ACTIONS.UPDATE_CASH: {
      const { locationId, amount } = action.payload;
      return {
        ...state,
        locations: state.locations.map(loc =>
          loc.id === locationId ? { ...loc, cash: loc.cash + amount } : loc
        ),
      };
    }

    case GAME_ACTIONS.UPDATE_CORPORATE_CASH:
      return {
        ...state,
        corporateCash: state.corporateCash + action.payload,
      };

    case GAME_ACTIONS.ADD_LOAN:
      return {
        ...state,
        loans: [...state.loans, action.payload],
        corporateCash: state.corporateCash + action.payload.amount,
      };

    case GAME_ACTIONS.PAY_LOAN: {
      return {
        ...state,
        loans: state.loans.map(loan =>
          loan.id === action.payload.loanId
            ? { ...loan, remaining: loan.remaining - 1 }
            : loan
        ).filter(loan => loan.remaining > 0),
      };
    }

    case GAME_ACTIONS.HIRE_STAFF: {
      const { locationId, staff } = action.payload;
      return {
        ...state,
        locations: state.locations.map(loc =>
          loc.id === locationId
            ? { ...loc, staff: [...(loc.staff || []), staff], cash: loc.cash - staff.wage * 2 }
            : loc
        ),
        stats: { ...state.stats, staffHired: state.stats.staffHired + 1 },
      };
    }

    case GAME_ACTIONS.FIRE_STAFF: {
      const { locationId, staffId, severance } = action.payload;
      return {
        ...state,
        locations: state.locations.map(loc =>
          loc.id === locationId
            ? {
                ...loc,
                staff: (loc.staff || []).filter(s => s.id !== staffId),
                cash: loc.cash - severance,
              }
            : loc
        ),
        stats: { ...state.stats, staffFired: state.stats.staffFired + 1 },
      };
    }

    case GAME_ACTIONS.TRAIN_STAFF: {
      const { locationId, staffId, training, cost } = action.payload;
      return {
        ...state,
        locations: state.locations.map(loc =>
          loc.id === locationId
            ? {
                ...loc,
                cash: loc.cash - cost,
                staff: (loc.staff || []).map(s =>
                  s.id === staffId
                    ? { ...s, skill: Math.min(10, s.skill + training.skillBonus), training: training.id }
                    : s
                ),
              }
            : loc
        ),
      };
    }

    case GAME_ACTIONS.SET_MANAGER: {
      const { locationId, staff } = action.payload;
      return {
        ...state,
        locations: state.locations.map(loc =>
          loc.id === locationId
            ? {
                ...loc,
                manager: staff,
                staff: (loc.staff || []).filter(s => s.id !== staff.id),
              }
            : loc
        ),
      };
    }

    case GAME_ACTIONS.BUY_EQUIPMENT: {
      const { locationId, equipmentId, cost } = action.payload;
      return {
        ...state,
        locations: state.locations.map(loc =>
          loc.id === locationId
            ? {
                ...loc,
                cash: loc.cash - cost,
                equipment: [...(loc.equipment || []), equipmentId],
              }
            : loc
        ),
      };
    }

    case GAME_ACTIONS.BUY_UPGRADE: {
      const { locationId, upgradeId, cost, reputationBonus } = action.payload;
      return {
        ...state,
        locations: state.locations.map(loc =>
          loc.id === locationId
            ? {
                ...loc,
                cash: loc.cash - cost,
                upgrades: [...(loc.upgrades || []), upgradeId],
                reputation: loc.reputation + (reputationBonus || 0),
              }
            : loc
        ),
      };
    }

    case GAME_ACTIONS.TOGGLE_86: {
      const { locationId, itemId } = action.payload;
      return {
        ...state,
        locations: state.locations.map(loc =>
          loc.id === locationId
            ? {
                ...loc,
                menu: (loc.menu || []).map(m =>
                  m.id === itemId ? { ...m, is86d: !m.is86d } : m
                ),
              }
            : loc
        ),
      };
    }

    case GAME_ACTIONS.ADD_MENU_ITEM: {
      const { locationId, item } = action.payload;
      return {
        ...state,
        locations: state.locations.map(loc =>
          loc.id === locationId
            ? { ...loc, menu: [...(loc.menu || []), item] }
            : loc
        ),
      };
    }

    case GAME_ACTIONS.TOGGLE_MARKETING: {
      const { locationId, channelId } = action.payload;
      return {
        ...state,
        locations: state.locations.map(loc => {
          if (loc.id !== locationId) return loc;
          const channels = loc.marketing?.channels || [];
          const isActive = channels.includes(channelId);
          return {
            ...loc,
            marketing: {
              ...(loc.marketing || {}),
              channels: isActive
                ? channels.filter(c => c !== channelId)
                : [...channels, channelId],
            },
          };
        }),
      };
    }

    case GAME_ACTIONS.TOGGLE_DELIVERY: {
      const { locationId, platformId, setupCost, isActive } = action.payload;
      return {
        ...state,
        locations: state.locations.map(loc => {
          if (loc.id !== locationId) return loc;
          const platforms = loc.delivery?.platforms || [];
          if (isActive) {
            return {
              ...loc,
              delivery: { ...(loc.delivery || {}), platforms: platforms.filter(p => p !== platformId) },
            };
          } else {
            return {
              ...loc,
              cash: loc.cash - setupCost,
              delivery: { ...(loc.delivery || {}), platforms: [...platforms, platformId] },
            };
          }
        }),
      };
    }

    case GAME_ACTIONS.LAUNCH_VIRTUAL_BRAND: {
      const { locationId, brandId, cost } = action.payload;
      return {
        ...state,
        locations: state.locations.map(loc =>
          loc.id === locationId
            ? {
                ...loc,
                cash: loc.cash - cost,
                virtualBrands: [...(loc.virtualBrands || []), brandId],
              }
            : loc
        ),
      };
    }

    case GAME_ACTIONS.ADD_LOCATION:
      return {
        ...state,
        locations: [...state.locations, action.payload],
        corporateCash: state.corporateCash - action.payload.setupCost,
        stats: { ...state.stats, locationsOpened: state.stats.locationsOpened + 1 },
      };

    case GAME_ACTIONS.CLOSE_LOCATION: {
      const { locationId, closingCost } = action.payload;
      return {
        ...state,
        locations: state.locations.filter(l => l.id !== locationId),
        corporateCash: state.corporateCash - closingCost,
        stats: { ...state.stats, locationsClosed: state.stats.locationsClosed + 1 },
      };
    }

    case GAME_ACTIONS.SELL_LOCATION: {
      const { locationId, salePrice } = action.payload;
      return {
        ...state,
        locations: state.locations.filter(l => l.id !== locationId),
        corporateCash: state.corporateCash + salePrice,
        stats: { ...state.stats, locationsClosed: state.stats.locationsClosed + 1 },
      };
    }

    case GAME_ACTIONS.ADD_FRANCHISE:
      return {
        ...state,
        franchises: [...state.franchises, action.payload],
      };

    case GAME_ACTIONS.UPDATE_STATS:
      return {
        ...state,
        stats: { ...state.stats, ...action.payload },
      };

    case GAME_ACTIONS.ADD_MILESTONE:
      return {
        ...state,
        unlockedMilestones: [...(state.unlockedMilestones || []), action.payload],
      };

    case GAME_ACTIONS.UPDATE_COMPETITORS:
      return {
        ...state,
        competitors: action.payload,
      };

    case GAME_ACTIONS.SET_ACTIVE_EVENT:
      return {
        ...state,
        activeEvent: action.payload,
      };

    case GAME_ACTIONS.RESOLVE_EVENT:
      return {
        ...state,
        activeEvent: null,
        eventHistory: [...state.eventHistory, action.payload],
        stats: { ...state.stats, eventsHandled: state.stats.eventsHandled + 1 },
      };

    default:
      return state;
  }
}

export { initialGameState };
