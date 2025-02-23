const reverse = (string) => {
  return string.split("").reverse().join("");
};

const average = (array) => {
  // Define a reducer function that takes a sum and an item, and returns their sum
  const reducer = (sum, item) => {
    return sum + item;
  };

  return array.length === 0 ? 0 : array.reduce(reducer, 0) / array.length;
};

module.exports = {
  reverse,
  average,
};
