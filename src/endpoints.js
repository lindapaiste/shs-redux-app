import { RestUrl } from "./router";

export const ENTITY_TYPES = {
  TERM: "term",
  TAXONOMY: "taxonomy",
  POST_TYPE: "postType",
  POST: "post",
  MEDIA: "media",
  USER: "user",
  COMMENT: "comment"
};

export const POST_TYPES = {
  POST: "post",
  PAGE: "page",
  MEDIA: "attachment",
  BLOCK: "wp_block",
  HAIR: "hair",
  MAKEUP: "makeup",
  TATTOOS: "tattoos",
  NAILS: "nails",
  PIERCINGS: "piercings",
  BEAUTY_PRODUCTS: "products"
};

export const WP_ENDPOINTS = {
  POSTS: {
    slug: "posts",
    entityType: ENTITY_TYPES.POST,
    postType: POST_TYPES.POST,
    isPaginated: true
  },
  PAGES: {
    slug: "pages",
    entityType: ENTITY_TYPES.POST,
    postType: POST_TYPES.PAGE,
    isPaginated: true
  },
  MEDIA: {
    slug: "media",
    entityType: ENTITY_TYPES.MEDIA,
    postType: POST_TYPES.MEDIA,
    isPaginated: true
  },
  TAXONOMIES: {
    slug: "taxonomies",
    entityType: ENTITY_TYPES.TAXONOMY,
    isKeyed: true,
    isPaginated: false
  },
  TYPES: {
    slug: "types",
    entityType: ENTITY_TYPES.POST_TYPE,
    isKeyed: true,
    isPaginated: false
  },
  CATEGORIES: {
    slug: "categories",
    entityType: ENTITY_TYPES.TERM,
    taxonomy: "category",
    isPaginated: true
  },
  TAGS: {
    slug: "tags",
    entityType: ENTITY_TYPES.TERM,
    taxonomy: "tag",
    isPaginated: true
  },
  BLOCKS: {
    slug: "blocks",
    entityType: ENTITY_TYPES.POST,
    postType: POST_TYPES.BLOCK,
    isPaginated: true
  },
  COMMENTS: {
    slug: "comments",
    entityType: ENTITY_TYPES.COMMENT,
    isPaginated: true
  },
  USERS: {
    slug: "users",
    entityType: ENTITY_TYPES.USER,
    isPaginated: true
  }
};

const endpointNames = Object.values(WP_ENDPOINTS).map(obj => obj.slug);

function isPostType(endpointObject) {
  return endpointObject.hasOwnProperty("postType");
}

function isBuiltInEndpoint(name) {
  return endpointNames.includes(name);
}

function getBuiltInEndpoint(name) {
  return findBuiltInEndpoint(obj => obj.slug === name);
}

//returns the first match even if there are multiple matches
function findBuiltInEndpoint(filter) {
  const builtIn = Object.values(WP_ENDPOINTS).filter(filter);
  if (builtIn.length) {
    return builtIn[0];
  }
}

export function getPostTypeEndpoint(name) {
  const builtIn = findBuiltInEndpoint(obj => obj.postType === name);
  return builtIn || createPostTypeEndpoint(name);
}

function createPostTypeEndpoint(name) {
  return {
    slug: name,
    entityType: ENTITY_TYPES.POST,
    postType: name,
    isPaginated: true
  };
}

export function getTaxonomyEndpoint(name) {
  const builtIn = findBuiltInEndpoint(obj => obj.taxonomy === name);
  return builtIn || createTaxonomyEndpoint(name);
}

function createTaxonomyEndpoint(name) {
  return {
    slug: name,
    entityType: ENTITY_TYPES.TERM,
    taxonomy: name,
    isPaginated: true
  };
}

export function getEndpointRestObject(endpoint) {
  return getRestObject({ endpoint });
}

export function getRestObject({ endpoint, id, params }) {
  return RestUrl.fromValues({
    namespace: endpoint.namespace || "wp/v2",
    endpoint: endpoint.slug || "posts",
    id,
    params
  });
}

export function getRestPath({ endpoint, id, params }) {
  const object = RestUrl.fromValues({
    namespace: endpoint.namespace || "wp/v2",
    endpoint: endpoint.slug || "posts",
    id,
    params
  });
  return object.path;
}
