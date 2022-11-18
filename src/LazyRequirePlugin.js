"use strict";

const webpack = require("webpack");
const LazyRequirePluginRuntimeModule = require("./LazyRequirePluginRuntimeModule");

const NAME = "LazyRequirePlugin";
class LazyRequirePlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(
      NAME,
      (compilation, { normalModuleFactory }) => {
        if (compilation.compiler !== compiler) return;

        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          NAME,
          (chunk, runtimeRequirements) => {
            runtimeRequirements.add(
              webpack.RuntimeGlobals.interceptModuleExecution
            );
            compilation.addRuntimeModule(
              chunk,
              new LazyRequirePluginRuntimeModule()
            );
          }
        );
      }
    );
  }
}

module.exports = LazyRequirePlugin;
