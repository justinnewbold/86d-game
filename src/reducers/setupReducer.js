// ============================================
// SETUP STATE REDUCER
// ============================================
// Handles game setup/configuration state

export const SETUP_ACTIONS = {
  SET_NAME: 'SET_NAME',
  SET_CUISINE: 'SET_CUISINE',
  SET_CAPITAL: 'SET_CAPITAL',
  SET_CUSTOM_CAPITAL: 'SET_CUSTOM_CAPITAL',
  SET_LOCATION_TYPE: 'SET_LOCATION_TYPE',
  SET_DIFFICULTY: 'SET_DIFFICULTY',
  RESET_SETUP: 'RESET_SETUP',
  LOAD_SETUP: 'LOAD_SETUP',
};

const initialSetupState = {
  name: '',
  cuisine: 'american',
  capital: 100000,
  customCapitalMode: false,
  customCapitalInput: '',
  locationType: 'urban',
  difficulty: 'normal',
  isValid: false,
};

// Validation helper
function validateSetup(state) {
  const name = state.name || '';
  const capital = state.capital || 0;
  return (
    name.trim().length >= 2 &&
    name.trim().length <= 30 &&
    state.cuisine &&
    capital >= 25000 &&
    capital <= 100000000
  );
}

export function setupReducer(state, action) {
  let newState;

  switch (action.type) {
    case SETUP_ACTIONS.SET_NAME:
      newState = { ...state, name: action.payload };
      break;

    case SETUP_ACTIONS.SET_CUISINE:
      newState = { ...state, cuisine: action.payload };
      break;

    case SETUP_ACTIONS.SET_CAPITAL:
      newState = {
        ...state,
        capital: action.payload,
        customCapitalMode: false,
        customCapitalInput: '',
      };
      break;

    case SETUP_ACTIONS.SET_CUSTOM_CAPITAL:
      newState = {
        ...state,
        customCapitalMode: action.payload.mode !== undefined ? action.payload.mode : state.customCapitalMode,
        customCapitalInput: action.payload.input !== undefined ? action.payload.input : state.customCapitalInput,
        capital: action.payload.capital !== undefined ? action.payload.capital : state.capital,
      };
      break;

    case SETUP_ACTIONS.SET_LOCATION_TYPE:
      newState = { ...state, locationType: action.payload };
      break;

    case SETUP_ACTIONS.SET_DIFFICULTY:
      newState = { ...state, difficulty: action.payload };
      break;

    case SETUP_ACTIONS.RESET_SETUP:
      return { ...initialSetupState };

    case SETUP_ACTIONS.LOAD_SETUP:
      newState = { ...state, ...action.payload };
      break;

    default:
      return state;
  }

  return { ...newState, isValid: validateSetup(newState) };
}

export { initialSetupState };
