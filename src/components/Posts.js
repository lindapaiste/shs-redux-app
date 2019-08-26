import React, { Component } from "react";
import PropTypes from "prop-types";
import { Brand } from "../containers/Term";

export default class Posts extends Component {
  render() {
    return (
      <ul>
        {this.props.posts.map((post, i) => (
          <li key={i}>{post.title.rendered}</li>
        ))}
      </ul>
    );
  }
}
/*
--{" "}
            {post.brand.map(id => (
              <Brand id={id} render={RenderBrand} />
            ))}
            */

const RenderBrand = ({ entity }) => {
  return <div>{entity.name}</div>;
};

Posts.propTypes = {
  posts: PropTypes.array.isRequired
};
