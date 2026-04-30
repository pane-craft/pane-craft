// import '../src/tokens.css';
import '../src/styles/tokens-primitive.css';
import '../src/styles/tokens-semantic.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
