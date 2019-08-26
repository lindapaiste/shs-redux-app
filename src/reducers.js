import { combineReducers } from "redux";
import ACTIONS from "./actions";
import { getEntity, entityIsReady } from "./selectors";
import {} from "./actions";
import { HomePage } from "./router";

//-----

function currentPage(state = HomePage, action) {
  switch (action.type) {
    case ACTIONS.SET_PAGE:
      return action.page;
    default:
      return state;
  }
}

function helperStoreEntityIfNeeded(state, entity) {
  if (helperShouldStoreEntity(state, entity)) {
    return helperStoreEntity(state, entity);
  } else {
    return state;
  }
}

function helperShouldStoreEntity(state, entity) {
  const { entityType, entityId } = entity;
  return !entityIsReady(state, entityType, entityId);
}

function helperStoreEntity(state, entity) {
  const { json, entityType, entityId } = entity;
  return {
    ...state,
    [entityType]: {
      ...state[entityType],
      [entityId]: {
        ...json,
        didInvalidate: false,
        isFetching: false
      }
    }
  };
}

function entities(state = {}, action) {
  const { type, entities } = action;
  switch (type) {
    case ACTIONS.RECEIVE_DATA:
      return entities.reduce(
        (state, entity) => helperStoreEntityIfNeeded(state, entity),
        state
      );

    /*let entityType = restObject.endpoint.entityType;
      //const entityArray = getEntities(data, restObject);
      // return entityArray.reduce((state, entity) => helperStoreEntity(state, entity, entityType), state );
      //let keyedEntities = getKeyedEntities(data, restObject);
      const keyedEntities = data.entities || {};
      return {
        ...state,
        [entityType]: {
          ...state[entityType],
          ...keyedEntities
        }
      };*/
    //return helperStorePostArray(state, data);
    //pass on to single entity function
    case ACTIONS.INVALIDATE_ENTITY:
    case ACTIONS.RECEIVE_ENTITY:
    case ACTIONS.REQUEST_ENTITY:
      return state;
    /*return {
        ...state,
        [entityType]: {
          ...state[entityType],
          [entityId]: singleEntity(
            getEntity(state, entityType, entityId),
            action
          )
        }
      };*/
    default:
      return state;
  }
}

function typeEntities(state = {}, action) {}

function singleEntity(state, action) {
  //initial state
  state = state || {
    isFetching: false,
    isError: false,
    didInvalidate: false
  };
  switch (action.type) {
    case ACTIONS.INVALIDATE_ENTITY:
      return { ...state, didInvalidate: true };
    case ACTIONS.REQUEST_ENTITY:
      return { ...state, isFetching: true, didInvalidate: false };
    case ACTIONS.RECEIVE_ENTITY:
      return {
        ...state,
        ...action.json,
        isFetching: false,
        didInvalidate: false,
        lastFetched: action.receivedAt
      };
    default:
      return state;
  }
}

function path(
  state = {
    isFetching: false,
    didInvalidate: false,
    items: []
  },
  action
) {
  switch (action.type) {
    case ACTIONS.INVALIDATE_PATH:
      return Object.assign({}, state, {
        didInvalidate: true
      });
    case ACTIONS.REQUEST_DATA:
      return Object.assign({}, state, {
        isFetching: true,
        didInvalidate: false
      });
    case ACTIONS.RECEIVE_DATA:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false,
        items: action.items,
        lastFetched: action.receivedAt
      });
    default:
      return state;
  }
}

function dataByPath(state = {}, action) {
  switch (action.type) {
    case ACTIONS.INVALIDATE_PATH:
    case ACTIONS.RECEIVE_DATA:
    case ACTIONS.REQUEST_DATA:
      return Object.assign({}, state, {
        [action.path]: path(state[action.path], action)
      });
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  dataByPath,
  currentPage,
  entities
});

export default rootReducer;
