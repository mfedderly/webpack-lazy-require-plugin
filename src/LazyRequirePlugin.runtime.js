"use strict";

var $interceptModuleExecution$ = undefined;

module.exports = function () {
  const toRun = new Set();
  let toRunInterval;

  function prox(req, args) {
    let init = false;
    let value;

    function l() {
      init = true;
      value = req(...args);
    }

    toRun.add(l);
    if (!toRunInterval) {
      toRunInterval = setTimeout(() => {
        toRunInterval = undefined;
        for (const fn of toRun) {
          fn();
        }
      }, 0);
    }

    return new Proxy(
      {},
      {
        get(target, prop, receiver) {
          if (!init) {
            l();
            toRun.delete(l);
          }
          return Reflect.get(value, prop);
        },
      }
    );
  }

  $interceptModuleExecution$.push(function (options) {
    const { require } = options;
    options.require = (...args) => prox(require, args);
  });
};
