import fetch from "isomorphic-fetch";
import { WP_ENDPOINTS } from "./endpoints";
import WpRestResponse from "./wpJsonReader";
import { RestUrl } from "./router";
import { getRequestEntity } from "./selectors";

const ACTIONS = {
  REQUEST_DATA: "REQUEST_DATA",
  RECEIVE_DATA: "RECEIVE_DATA",
  REQUEST_ENTITY: "REQUEST_ENTITY",
  RECEIVE_ENTITY: "RECEIVE_ENTITY",
  NAVIGATE_TO: "NAVIGATE_TO",
  SET_PAGE: "SET_PAGE",
  INVALIDATE_PATH: "INVALIDATE_PATH",
  INVALIDATE_ENTITY: "INVALIDATE_ENTITY"
};
export default ACTIONS;

export function navigateTo(page) {
  return dispatch => {
    dispatch(setPage(page));
    dispatch(fetchDataIfNeeded(page.rest));
  };
}

export function setPage(page) {
  return {
    type: ACTIONS.SET_PAGE,
    page
  };
}

export function invalidatePath(path) {
  return {
    type: ACTIONS.INVALIDATE_PATH,
    path
  };
}

function requestData(request) {
  return {
    type: ACTIONS.REQUEST_DATA,
    request,
    path: request.path
  };
}

function receiveData(response, request) {
  return {
    type: ACTIONS.RECEIVE_DATA,
    items: response.items,
    entities: response.entities.concat(response.embeddedEntities),
    receivedAt: Date.now(),
    request,
    path: request.path
  };
}

function fetchData(request) {
  return dispatch => {
    dispatch(requestData(request));

    return (
      fetch(`https://stealherstyle.net${request.path}`)
        .then(response => response.json())
        //      .then(json => json.data.children.map(child => child.data)) //convert to an array of data
        .then(json => new WpRestResponse(json, request))
        .then(response => dispatch(receiveData(response, request)))
      //.then(data => dispatch(receiveData(path, data, request)))
      //.then(data => data.map( post => dispatch(receiveEntity(post.type, post.id, post))))
    );
  };
}

function shouldFetchData(state, request) {
  const object = request.id
    ? //for a singular page
      getRequestEntity(state, request)
    : //for an archive page
      state.dataByPath[request.path];
  return shouldFetch(object);
}

function shouldFetch(object) {
  if (!object) {
    return true;
  } else if (object.isFetching) {
    return false;
  } else {
    return object.didInvalidate;
  }
}

export function fetchDataIfNeeded(request) {
  return (dispatch, getState) => {
    if (shouldFetchData(getState(), request)) {
      return dispatch(fetchData(request));
    }
  };
}

///---------------entity

function invalidateEntity(entityType, entityId) {
  return {
    type: ACTIONS.INVALIDATE_ENTITY,
    entityType,
    entityId
  };
}

function requestEntity(entityType, entityId) {
  return {
    type: ACTIONS.REQUEST_ENTITY,
    entityType,
    entityId
  };
}

function receiveEntity(entityType, entityId, json) {
  return {
    type: ACTIONS.RECEIVE_ENTITY,
    entityType,
    entityId,
    json,
    receivedAt: Date.now() //impure function so it goes in actions not reducers
  };
}

function fetchEntity(entityType, entityId) {
  return dispatch => {
    dispatch(requestEntity(entityType, entityId));
    //TODO: better url mapping
    return fetch(
      `https://stealherstyle.net/wp-json/wp/v2/${entityType}/${entityId}/`
    )
      .then(response => response.json())
      .then(json => dispatch(receiveEntity(entityType, entityId, json)));
  };
}

function isValidEntity(state, entityType, entityId) {
  return (
    state &&
    state[entityType] &&
    state[entityType][entityId] &&
    !state[entityType][entityId].didInvalidate
  );
}

function shouldFetchEntity(state, entityType, entityId) {
  //make sure the complete path exists before attempting to get the object
  if (!isValidEntity(state, entityType, entityId)) {
    return true;
  }
  const entity = state.entities[entityType][entityId];
  if (entity.isFetching) {
    return false;
  } else {
    return entity.didInvalidate;
  }
}

export function fetchEntityIfNeeded(entityType, entityId) {
  return (dispatch, getState) => {
    if (shouldFetchEntity(getState(), entityType, entityId)) {
      return dispatch(fetchEntity(entityType, entityId));
    }
  };
}

export function storeEntityIfNeeded(entityType, entityId, json) {
  return (dispatch, getState) => {
    if (shouldFetchEntity(getState(), entityType, entityId)) {
      return dispatch(receiveEntity(entityType, entityId));
    }
  };
}

///---------------environment
