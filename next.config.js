// next.config.js
module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /react-datepicker\\.css$/,
      use: ["style-loader", "css-loader"],
    });
    return config;
  },
};
module.exports = {
  compiler: {
    styledComponents: true,
  },
};