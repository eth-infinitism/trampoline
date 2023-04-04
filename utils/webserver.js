// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.ASSET_PATH = '/';

const SSEStream = require('ssestream').default;
const debounce = require('lodash').debounce;

var WebpackDevServer = require('webpack-dev-server'),
  webpack = require('webpack'),
  config = require('../webpack.config'),
  env = require('./env'),
  path = require('path');

var options = config.chromeExtensionBoilerplate || {};
var excludeEntriesToHotReload = options.notHotReload || [];

for (var entryName in config.entry) {
  if (excludeEntriesToHotReload.indexOf(entryName) === -1) {
    config.entry[entryName] = [
      'webpack/hot/dev-server',
      `webpack-dev-server/client?hot=true&hostname=localhost&port=${env.PORT}`,
    ].concat(config.entry[entryName]);
  }
}

if (options.enableBackgroundAutoReload) {
  config.entry['background'] = [
    path.resolve(
      __dirname,
      `autoReloadClients/backgroundClient.js?port=${env.PORT}`
    ),
  ].concat(config.entry['background']);
}

config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(
  config.plugins || []
);

delete config.chromeExtensionBoilerplate;

var compiler = webpack(config);

var server = new WebpackDevServer(
  {
    https: false,
    hot: false,
    client: false,
    compress: false,
    host: 'localhost',
    port: env.PORT,
    static: {
      directory: path.join(__dirname, '../build'),
    },
    devMiddleware: {
      publicPath: `http://localhost:${env.PORT}/`,
      writeToDisk: true,
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!options.enableBackgroundAutoReload) {
        return middlewares;
      }
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      middlewares.push({
        path: '/__server_sent_events__', // you can find this path requested by backgroundClient.js.
        middleware: (req, res) => {
          const sseStream = new SSEStream(req);
          sseStream.pipe(res);

          sseStream.write('message from webserver.');

          let closed = false;

          const compileDoneHook = debounce((stats) => {
            const { modules } = stats.toJson({ all: false, modules: true });
            const updatedJsModules = modules.filter(
              (module) =>
                module.type === 'module' &&
                module.moduleType === 'javascript/auto'
            );
            const isBackgroundUpdated = updatedJsModules.some((module) =>
              module.nameForCondition.startsWith(
                path.resolve(__dirname, '../src/pages/Background')
              )
            );
            const shouldBackgroundReload =
              !stats.hasErrors() &&
              isBackgroundUpdated &&
              options.enableBackgroundAutoReload;

            if (shouldBackgroundReload) {
              sseStream.writeMessage(
                {
                  event: 'background-updated',
                  data: {}, // "data" key should be reserved though it is empty.
                },
                'utf-8'
              );
            }
          }, 1000);

          const plugin = (stats) => {
            if (!closed) {
              compileDoneHook(stats);
            }
          };

          // a mini webpack plugin just born!
          // this plugin will be triggered after each compilation done.
          compiler.hooks.done.tap('extension-auto-reload-plugin', plugin);

          res.on('close', () => {
            closed = true;
            sseStream.unpipe(res);
          });
        },
      });

      return middlewares;
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: 'all',
  },
  compiler
);

(async () => {
  await server.start();
})();
