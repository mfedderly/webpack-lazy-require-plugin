"use strict";

const webpack = require("webpack");
const { RuntimeGlobals, RuntimeModule, Template } = webpack;

class LazyRequirePluginRuntimeModule extends RuntimeModule {
  constructor() {
    super("lazy requires", RuntimeModule.STAGE_BASIC);
  }
  /**
   * @returns {string} runtime code
   */
  generate() {
    return Template.getFunctionContent(
      require("./LazyRequirePlugin.runtime.js")
    ).replace(
      /\$interceptModuleExecution\$/g,
      RuntimeGlobals.interceptModuleExecution
    );
  }
}

module.exports = LazyRequirePluginRuntimeModule;
