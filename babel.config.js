module.exports = function(api) {
  api.cache(true)

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ]
  const plugins = [
    '@babel/plugin-proposal-class-properties',
    [
      'babel-plugin-root-import',
      {
        rootPathSuffix: './',
        rootPathPrefix: '~/'
      }
    ]
  ]

  return {
    presets,
    plugins
  }
}
