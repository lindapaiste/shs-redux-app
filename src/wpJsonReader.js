import { ENTITY_TYPES } from "./endpoints";

export default class WpRestResponse {
  constructor(json, restObject) {
    const { endpoint, id } = restObject;
    this.entities = this.reformatToArray(json, endpoint, id).map(
      json => new WpRestEntity(json, endpoint.entityType, id)
    );
  }
  reformatToArray(json, endpoint, id) {
    //for a single entity, the whole response is one entity
    if (id) {
      return [json];
    }
    //handle special cases for types and taxonomies where response is an object rather than an array
    else if (endpoint.isKeyed) {
      return Object.values(json);
    }
    //array of responses
    else if (Array.isArray(json)) {
      return json;
    }
    //invalid response
    else {
      //TODO: throw error
      return [];
    }
  }
  get items() {
    return this.entities.map(entity => entity.entityItem);
  }
  get embeddedEntities() {
    return this.entities.reduce(
      (embeds, entity) => embeds.concat(entity.embeddedEntities),
      []
    );
  }
}

class WpRestEntity {
  /*constructor(json, entityType) {
    //verify that json is an object so that there are no errors later on
    //this.json = ( typeof(json) === 'object' ) ? json : {};
    if (typeof json === "object") {
      Object.keys(json).forEach(key => (this[key] = json[key]));
    }
    this.entityType = entityType;
  }*/
  constructor(json, entityType, entityId) {
    //verify that json is an object so that there are no errors later on
    this.json = typeof json === "object" ? json : {};
    this.entityType = entityType;
    this.entityId = entityId || json.id || json.slug;
  }
  get entityItem() {
    return {
      type: this.entityType,
      id: this.entityId
    };
  }
  get embedded() {
    return this.json._embedded || {};
  }
  hasEmbedded(fieldName) {
    if (fieldName) {
      return this.embedded.hasOwnProperty(fieldName);
    } else {
      //if field name is not set, see if it has any fields
      return this.json.hasOwnProperty("_embedded");
    }
  }
  getEmbedded(fieldName) {
    return this.embedded[fieldName] || [];
    //always return an array
  }
  get embeddedEntities() {
    if (!this.hasEmbedded) return [];
    //for each object, return entityType, entityId, json
    let objects = [];
    //authors
    this.getEmbedded("author").forEach(json =>
      objects.push({
        entityType: ENTITY_TYPES.USER,
        entityId: json.id,
        json
      })
    );
    //media
    this.getEmbedded("wp:featuredmedia").forEach(json =>
      objects.push({
        entityType: ENTITY_TYPES.MEDIA,
        entityId: json.id,
        json
      })
    );
    //terms
    this.getEmbedded("wp:term").forEach(array =>
      array.forEach(json =>
        objects.push({
          entityType: ENTITY_TYPES.TERM,
          entityId: json.id,
          json
        })
      )
    );
    return objects;
  }
  get links() {
    return this.json._links || {};
  }
  hasLinks(fieldName) {
    if (fieldName) {
      return this.links.hasOwnProperty(fieldName);
    } else {
      //if field name is not set, see if it has any fields
      return this.json.hasOwnProperty("_links");
    }
  }
  getLinks(fieldName) {
    return this.links[fieldName] || [];
    //always return an array
  }
}
