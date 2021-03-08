/*
 * Copyright 2019-2021 Ilker Temir <ilker@ilkertemir.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const magvar = require('magvar');

module.exports = function (app) {
  var plugin = {};
  var mainProcess;

  plugin.id = 'magnetic-variation';
  plugin.name = 'Magnetic Variation';
  plugin.description = 'Provides magnetic variation based on position';

  function emitMagneticVariation() {
    let position = app.getSelfPath('navigation.position');
    if (!position) {
      app.debug('No position available');
      return;
    }
    position = position.value;
    let variation = magvar.get(position.latitude, position.longitude);

    // Convert to radians
    let variation_rad = variation * 0.01745;
    app.debug(`Emitting variation ${variation}° for (${position.latitude}, ${position.longitude})`);

    app.handleMessage(plugin.id, {
      updates: [{
	values: [{
	  path: 'navigation.magneticVariation',
          value: variation_rad
        }]
      }]
    });
	
  }

  plugin.start = function (options, restartPlugin) {
    app.debug('Starting plugin');
    mainProcess = setInterval( function() {
      emitMagneticVariation();
    }, 5 * 1000);
  };

  plugin.stop = function () {
    app.debug('Stopping plugin');
    clearInterval(mainProcess);
  };

  plugin.schema = {
  };

  return plugin;
};
