const express = require('express');

exports.byName = (obj1, obj2) => {
  if (obj1.name < obj2.name) {
    return -1;
  } else if (obj1.name > obj2.name) {
    return 1;
  } else {
    return 0;
  }
};

exports.byLastName = (obj1, obj2) => {
  if (obj1.last_name < obj2.last_name) {
    return -1;
  } else if (obj1.last_name > obj2.last_name) {
    return 1;
  } else {
    return 0;
  }
};