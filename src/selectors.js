//import {createSelector} from 'reselct'

export function isEnvironmentLoaded(state) {
  return (
    entityTypeExists(state, "postType") && entityTypeExists(state, "taxonomy")
  );
}

export function requestEntityExists(state, request) {
  if (request.isEntity) {
    const item = request.requestedItem;
    return entityExists(state, item.type, item.id);
  } else {
    return false;
  }
}

export function getRequestEntity(state, request) {
  if (requestEntityExists(state, request)) {
    return getEntity(state, request.endpoint.entityType, request.id);
  }
}

export function getCurrentWebUrl(state) {
  if (state.currentPage.webUrl) {
    return state.currentPage.webUrl;
  }
  const request = state.currentPage.rest;
  if (request.isEntity) {
    return getItemWebUrl(state, request.requestedItem);
  } else {
    //TODO: handle archive pages
  }
}

export function getItemWebUrl(state, item) {
  const object = getItem(state, item);
  if (object && object.link) {
    return object.link;
  } else return undefined;
}

export function getCurrentPagePath(state) {
  if (
    state &&
    state.currentPage &&
    state.currentPage.rest &&
    state.currentPage.rest.path
  ) {
    console.log("current page path");
    console.log(state.currentPage.rest.path);
    return state.currentPage.rest.path;
  } else {
    console.log("page not found");
  }
}

export function getCurrentPageData(state) {
  return state.dataByPath[getCurrentPagePath(state)];
}

export function getCurrentPageItems(state) {
  const data = getCurrentPageData(state) || {};
  console.log(data);
  return data.items;
}

export function getCurrentPageObjects(state) {
  const items = getCurrentPageItems(state) || [];
  console.log(items);
  return items.map(entity => getEntity(state, entity.type, entity.id));
}

function getPathData(state, path) {
  return state.dataByPath[path];
}

export function getCurrentPosts(state) {
  console.log("current posts");
  console.log(getCurrentPageObjects(state));
  return getCurrentPageObjects(state);
}

export function getEntitiesForType(state, entityType) {
  const entities = state.entities || {};
  return entities[entityType] || {};
}

export function getEntity(state, entityType, entityId) {
  if (entityExists(state, entityType, entityId)) {
    return state.entities[entityType][entityId];
  } else {
    return undefined;
  }
}

function itemExists(state, item) {
  return entityExists(state, item.type, item.id);
}

function itemIsReady(state, item) {
  return entityIsReady(state, item.type, item.id);
}

function getItem(state, item) {
  return getEntity(state, item);
}

//booleans for early exit check
function entityTypeExists(state, entityType) {
  return state.entities && state.entities.hasOwnProperty(entityType);
}

function entityExists(state, entityType, entityId) {
  return (
    entityTypeExists(state, entityType) &&
    state.entities[entityType].hasOwnProperty(entityId)
  );
}

export function entityIsReady(state, entityType, entityId) {
  if (!entityExists(state, entityType, entityId)) return false;
  const entity = getEntity(state, entityType, entityId);
  return entity && !entity.isFetching && !entity.didInvalidate;
}

function EntityFetcher(state, entityType, entityId) {
  this.typeExists = () => {
    return state.entities && state.entities.hasOwnProperty(entityType);
  };
  this.exists = () => {
    return (
      this.typeExists() && state.entities[entityType].hasOwnProperty(entityId)
    );
  };
  this.get = () => {
    if (this.exists()) {
      return state.entities[entityType][entityId];
    }
  };
  this.isReady = () => {
    const entity = this.get();
    return entity && !entity.isFetching && !entity.didInvalidate;
  };
}
EntityFetcher.create = (state, entityType, entityId) => {
  return new EntityFetcher(state, entityType, entityId);
};
