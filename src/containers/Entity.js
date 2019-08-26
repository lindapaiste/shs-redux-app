import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { fetchEntityIfNeeded } from "../actions";
import { getEntity } from "../selectors";

class Entity extends Component {
  componentDidMount() {
    const { dispatch, type, id } = this.props;
    dispatch(fetchEntityIfNeeded(type, id));
  }
  isReady() {
    const { entity } = this.props;
    return entity && !entity.isFetching && !entity.didInvalidate;
  }
  render() {
    if (this.isReady()) {
      return this.props.render({
        ...this.props,
        object: this.props.entity
      });
    } else {
      return <div>Loading...</div>;
    }
  }
}

Entity.propTypes = {
  entity: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  render: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
  //TODO: need to make sure it rerenders only when the values are actually different
  //https://blog.isquaredsoftware.com/2017/12/idiomatic-redux-using-reselect-selectors/
  return {
    entity: getEntity(state, ownProps.type, ownProps.id)
  };
}

export default connect(mapStateToProps)(Entity);
