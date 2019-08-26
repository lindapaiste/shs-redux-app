import {
  ENTITY_TYPES,
  POST_TYPES,
  WP_ENDPOINTS,
  getTaxonomyEndpoint,
  getPostTypeEndpoint
} from "./endpoints";
import { WEB_URL } from "./constants";
import { getItem } from "./selectors";

//entity object doesn't contain the entityType, but it could
function getPostPageFromEntity(entity) {
  return Single(entity.type, entity.id);
}

const WebPage = (
  restValues = {
    endpoint: WP_ENDPOINTS.POSTS
  }
) => {
  const rest = RestUrl.fromValues(restValues);
  const archiveEntities = [];
  return {
    rest,
    archiveEntities
  };
};

const Single = (postType, id) => {
  let page = WebPage({
    id,
    endpoint: getPostTypeEndpoint(postType)
  });
  page.isSingular = true;
  switch (postType) {
    case POST_TYPES.PAGE:
      page.isPage = true;
    case POST_TYPES.ATTACHMENT:
      page.isAttachment = true;
    case POST_TYPES.POST:
      page.isSingle = true;
      page.isPost = true; //added
    default:
      page.isSingle = true;
      page.isCustom = true; //added
  }
  return page;
};

const Archive = (entities, restValues) => {
  let page = WebPage(restValues);
  page.archiveEntities = entities;
  page.isArchive = true;
  page.isPaged =
    page.rest.params.page && page.rest.params.page > 1 ? true : false;
  return page;
};

const TermArchive = (id, taxonomy, pageNumber) => {
  const entities = [
    {
      id,
      type: ENTITY_TYPES.TERM,
      taxonomy
    }
  ];
  const rest = {
    endpoint: WP_ENDPOINTS.POSTS,
    params: {
      [taxonomy]: id,
      page: pageNumber
    }
  };
  let page = Archive(entities, restValues);
  page.isTax = true;
};

const CategoryArchive = (id, pageNumber) => {
  const entities = [
    {
      id: category.id,
      type: ENTITY_TYPES.TERM,
      taxonomy: "category"
    }
  ];

  let page = Archive({});
};

/*
class WebPage {
  isFrontPage = false;
  isHome = false;
  isSingular = false;
  isSingle = false;
  isAttachment = false;
  isPage = false;
  isArchive = false;
  isPostTypeArchive = false;
  isCategory = false;
  isTag = false;
  isTax = false;
  isAuthor = false;
  isDate = false;
  isPaged = false;
  isSearch = false;
  is404 = false;

  archiveEntities = [];
}

class Singular extends WebPage {
  isSingular = true;
}

class SinglePost extends WebPage {
  isSingle = true;
}*/

const IS_ARCHIVE = "isArchive";

function formArchiveWebUrl(state, archiveEntities, page) {
  const objects = archiveEntities.map(item => getItem(state, item));
  //for a single entity, use that entities url
  if (objects.length === 1) {
    let url = objects[0].link;
    if (url && page > 1) {
      url += `page/${page}/`;
    }
  }
  //for combination archives, need to get trickier
  return url;
}

export const Single = (id, postType, webUrl) => {
  const rest = RestUrl.fromValues({
    endpoint: getPostTypeEndpoint(postType),
    id: id
  });
  return {
    webUrl,
    rest
  };
};

export const HomePage = () => {
  const web = CustomUrl.fromValues({
    pathname: "/"
  });
  const rest = RestUrl.fromValues({
    endpoint: WP_ENDPOINTS.POSTS
  });
  return {
    web,
    rest
  };
};

export const Celebrity = category => {
  const web = CustomUrl.fromValues({
    pathname: category.slug
  });
  const rest = RestUrl.fromValues({
    endpoint: WP_ENDPOINTS.POSTS,
    params: {
      categories: category.id
    }
  });
  const archiveEntities = [
    {
      id: category.id,
      type: ENTITY_TYPES.TERM,
      taxonomy: "category"
    }
  ];
  return {
    web,
    rest,
    archiveEntities
  };
};

export const ExampleCelebrity = () => {
  console.log("endpoints");
  console.log(WP_ENDPOINTS);
  return {
    web: {
      pathname: "/acacia-brinley-clark/",
      params: {}
    },
    rest: {
      namespace: "wp/v2",
      endpoint: WP_ENDPOINTS.POSTS,
      id: undefined,
      params: {
        categories: 8040
      }
    },
    archiveEntities: [
      {
        type: "category",
        id: 8040
      }
    ],
    conditionals: [
      "isArchive",
      "isCategory"
      //could be isPaged when on page 2
    ]
  };
};

export const ExampleCelebrityPostType = {
  web: {
    pathname: "/acacia-brinley-clark/",
    params: {
      post_type: "tattoos"
    }
  },
  rest: {
    namespace: "wp/v2",
    endpoint: "tattoos",
    id: undefined,
    params: {
      categories: 8040
    }
  },
  archiveEntities: [
    {
      type: "category",
      id: 8040
    },
    {
      type: "types",
      id: "tattoos"
    }
  ],
  items: [
    //array of ids that gets filled in after fetch
    {
      type: "tattoos",
      id: 168286
    }
  ],
  conditionals: ["isArchive", "isCategory", "isPostTypeArchive"]
};

class CustomUrl {
  constructor(urlObject) {
    this.url = urlObject;
  }
  static fromHref(href) {
    return new this(new URL(href));
  }
  static fromValues({ pathname = "/", params = {}, base = WEB_BASE }) {
    let object = new this(new URL(pathname, base));
    object.setParams(params);
    return object;
  }
  get href() {
    return this.url.href;
  }
  get path() {
    return this.url.pathname + this.url.search;
  }
  get searchParams() {
    return this.url.searchParams;
  }
  get params() {
    return paramsToObject(this.url.searchParams);
  }
  setParam(key, value) {
    //value can be a string or an array
    if (Array.isArray(value)) {
      //override existing
      this.searchParams.delete(key);
      value.forEach(val => this.searchParams.append(key, val));
    } else {
      this.searchParams.set(key, value);
    }
  }
  setParams(paramsObject) {
    Object.keys(paramsObject).forEach(key =>
      this.setParam(key, paramsObject[key])
    );
  }
  toJSON() {
    return {
      href: this.href,
      params: this.params,
      pathname: this.url.pathname
    };
  }
}

export class RestUrl extends CustomUrl {
  static fromValues({
    namespace = "wp/v2",
    endpoint = WP_ENDPOINTS.POSTS,
    id = undefined,
    params = {}
  }) {
    let pathname = `/wp-json/${namespace}/${endpoint.slug}`;
    if (id) {
      pathname += `/${id}`;
    }
    let object = super.fromValues({ pathname, params });
    object.namespace = namespace;
    object.endpoint = endpoint;
    object.id = id;
    return object;
  }
  get hasId() {
    return this.id !== undefined;
  }
  get isEntity() {
    return this.hasId;
  }
  get isFrontPage() {}
  get isHome() {}
  get requestedItem() {
    if (this.hasId && this.endpoint) {
      return {
        id: this.id,
        type: this.endpoint.entityType
      };
    }
  }
}

function buildRestUrl({
  namespace = "wp/v2",
  endpoint,
  id = undefined,
  params = {}
}) {
  let pathname = `/wp-json/${namespace}/${endpoint}`;
  if (id) {
    pathname += `/${id}`;
  }
  let url = new URL(pathname, REST_BASE);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return url;
}

const WEB_BASE = "https://stealherstyle.net";
const REST_BASE = WEB_BASE + "/wp-json";

function buildWebUrl({ pathname = "/", params = {} }) {
  let url = new URL(pathname, WEB_BASE);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return url;
}

//from https://stackoverflow.com/questions/8648892/convert-url-parameters-to-a-javascript-object
function paramsToObject(entries) {
  let result = {};
  for (let entry of entries) {
    // each 'entry' is a [key, value] tupple
    const [key, value] = entry;
    result[key] = value;
  }
  return result;
}
