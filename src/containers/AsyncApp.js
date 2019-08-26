import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  setPath,
  fetchDataIfNeeded,
  invalidatePath,
  loadEnvironment,
  navigateTo
} from "../actions";
import Picker from "../components/Picker";
import Posts from "../components/Posts";
import { getCurrentPosts } from "../selectors";

import { WP_ENDPOINTS, getEndpointRestObject } from "../endpoints";
import { Celebrity } from "../router";

class AsyncApp extends Component {
  componentDidMount() {
    const { dispatch, currentPath } = this.props;
    //dispatch(loadEnvironment());
    //temporary
    const SampleRestUrl = {
      endpoint: WP_ENDPOINTS.POSTS,
      params: {
        categories: 9457,
        _embed: true
      }
    };

    const category = {
      id: 8040,
      slug: "acacia-brinley-clark"
    };
    this.loadEnvironment();
    dispatch(navigateTo(Celebrity(category)));
  }

  loadEnvironment() {
    const { dispatch } = this.props;
    const postTypes = getEndpointRestObject(WP_ENDPOINTS.TYPES);
    const taxonomies = getEndpointRestObject(WP_ENDPOINTS.TAXONOMIES);
    dispatch(fetchDataIfNeeded(postTypes));
    dispatch(fetchDataIfNeeded(taxonomies));
    //TODO: loop through all categories
  }

  componentDidUpdate(prevProps) {
    if (this.props.currentPath !== prevProps.currentPath) {
      const { dispatch, currentPath } = this.props;
      dispatch(fetchDataIfNeeded(currentPath));
    }
  }

  handleChange = newPath => {
    this.props.dispatch(setPath(newPath));
    this.props.dispatch(fetchDataIfNeeded(newPath));
  };

  handleRefreshClick = e => {
    e.preventDefault();

    const { dispatch, currentPath } = this.props;
    dispatch(invalidatePath(currentPath));
    dispatch(fetchDataIfNeeded(currentPath));
  };

  render() {
    const { currentPath, posts, isFetching, lastUpdated } = this.props;
    return (
      <div>
        <Picker
          value={currentPath}
          onChange={this.handleChange}
          options={["posts", "makeup", "hair"]}
        />
        <p>
          {lastUpdated && (
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString()}.{" "}
            </span>
          )}
          {!isFetching && (
            <a href="#" onClick={this.handleRefreshClick}>
              Refresh
            </a>
          )}
        </p>
        {isFetching && posts.length === 0 && <h2>Loading...</h2>}
        {!isFetching && posts.length === 0 && <h2>Empty.</h2>}
        {posts.length > 0 && (
          <div style={{ opacity: isFetching ? 0.5 : 1 }}>
            <Posts posts={posts} />
          </div>
        )}
      </div>
    );
  }
}

AsyncApp.propTypes = {
  currentPath: PropTypes.string.isRequired,
  posts: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  const { currentPath, dataByPath, entities } = state;
  const { isFetching, lastUpdated, items } = dataByPath[currentPath] || {
    isFetching: true,
    items: []
  };
  const posts = getCurrentPosts(state); // items.map(id => entities.posts[id]);

  return {
    currentPath,
    posts,
    isFetching,
    lastUpdated
  };
}

export default connect(mapStateToProps)(AsyncApp);
