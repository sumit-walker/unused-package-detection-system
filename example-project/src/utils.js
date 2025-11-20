// This file imports axios which will be detected as used
const axios = require('axios');

function fetchData(url) {
  return axios.get(url);
}

module.exports = { fetchData };

