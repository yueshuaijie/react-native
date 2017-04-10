/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const log = require('../util/log').out('bundle');
const outputBundle = require('./output/bundle');
const path = require('path');
const Promise = require('promise');
const saveAssets = require('./saveAssets');
const Server = require('../../packager/react-packager/src/Server');
const fs = require('fs');

function saveBundle(output, bundle, args) {
  return Promise.resolve(
    output.save(bundle, args, log)
  ).then(() => bundle);
}

function buildBundle(args, config, output = outputBundle, packagerInstance) {
  return new Promise((resolve, reject) => {

    // This is used by a bazillion of npm modules we don't control so we don't
    // have other choice than defining it as an env variable here.
    if (!process.env.NODE_ENV) {
      // If you're inlining environment variables, you can use babel to remove
      // this line:
      // https://www.npmjs.com/package/babel-remove-process-env-assignment
      process.env.NODE_ENV = args.dev ? 'development' : 'production';
    }

    const transformModulePath =
      args.transformer ? path.resolve(args.transformer) :
      typeof config.getTransformModulePath === 'function' ? config.getTransformModulePath() :
      undefined;

    const options = {
      projectRoots: config.getProjectRoots(),
      assetRoots: config.getAssetRoots(),
      blacklistRE: config.getBlacklistRE(args.platform),
      getTransformOptionsModulePath: config.getTransformOptionsModulePath,
      transformModulePath: transformModulePath,
      extraNodeModules: config.extraNodeModules,
      nonPersistent: true,
      resetCache: args['reset-cache'],
    };

	//notice that 0.42 change react-packager route and prelude content
	let writeContent = args.dev ? 'global.__DEV__ = true;\n' : 'global.__DEV__ = false;\n' +
						'global.__BUNDLE_START_TIME__ = Date.now();\n';

	if (args.version) {
		 global.__BUNDLE_VERSION__ = args.version;
		 writeContent += "global.__BUNDLE_VERSION__ = '" + global.__BUNDLE_VERSION__ +"';\n";
	}
	if (args.name) {
		global.__BUNDLE_NAME__ = args.name;
		writeContent += "global.__BUNDLE_NAME__ = '" + global.__BUNDLE_NAME__ +"';\n";
	}
	global.__BUNDLE_BUILD__ = Date.now();

	writeContent += 'global.__BUNDLE_BUILD__ = ' + global.__BUNDLE_BUILD__ +';\n';

	const prelude = args.dev
		? path.join('/' + process.cwd(), 'node_modules/react-native/packager/react-packager/src/Resolver/polyfills/prelude_dev.js')
		: path.join('/' + process.cwd(), 'node_modules/react-native/packager/react-packager/src/Resolver/polyfills/prelude.js');


	console.log('prelude:---',prelude);
	console.log('writeContent:---\n',writeContent);
	fs.writeFile(prelude, writeContent, function (err) {
  		if (err) {
			console.log('write error----',err);
			throw err
		};
  		console.log('success write!');
	});

    const requestOpts = {
      entryFile: args['entry-file'],
      sourceMapUrl: args['sourcemap-output'],
      dev: args.dev,
      minify: !args.dev,
      platform: args.platform,
    };

    // If a packager instance was not provided, then just create one for this
    // bundle command and close it down afterwards.
    var shouldClosePackager = false;
    if (!packagerInstance) {
      packagerInstance = new Server(options);
      shouldClosePackager = true;
    }

    const bundlePromise = output.build(packagerInstance, requestOpts)
      .then(bundle => {
        if (shouldClosePackager) {
          packagerInstance.end();
        }
        return saveBundle(output, bundle, args);
      });

    // Save the assets of the bundle
    const assets = bundlePromise
      .then(bundle => bundle.getAssets())
      .then(outputAssets => saveAssets(
        outputAssets,
        args.platform,
        args['assets-dest']
      ));

    // When we're done saving bundle output and the assets, we're done.
    resolve(assets);
  });
}

module.exports = buildBundle;
