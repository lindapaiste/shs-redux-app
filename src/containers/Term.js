import Entity from "./Entity";
import React from "react";

export const Category = ({ id, render }) => {
  return <Entity type="category" id={id} render={render} />;
};

export const Brand = ({ id, render }) => {
  return <Entity type="brand" id={id} render={render} />;
};
