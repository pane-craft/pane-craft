export default {
  plugins: {
    'postcss-preset-env': {
      stage: 2,
      browsers: 'chrome >= 64, firefox >= 67, safari >= 12, edge >= 79',
    },
    autoprefixer: {},
  },
};