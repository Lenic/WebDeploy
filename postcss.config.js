module.exports = {
  plugins: [
    require('postcss-nested'),
    require('postcss-import'),
    require('postcss-preset-env')({
      stage: 0,
    }),
  ],
};
