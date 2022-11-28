"use strict";

var $interceptModuleExecution$ = undefined;

module.exports = function () {
  const toRun = new Set();
  let toRunInterval;

  function processPending() {
    toRunInterval = undefined;

    const start = performance.now();
    let processed = 0;
    for (const fn of toRun) {
      // run up to 100ms before yielding
      if (performance.now() > start + 100) {
        setTimeout(processPending, 0);
        break;
      }
      fn();
      processed++;
    }
    const end = performance.now();
    console.log(`Processed ${processed} modules in ${end - start} (${toRun.size > 0 ? "done" : "unfinished"})`);
  }

  function prox(req) {
    return new Proxy(
      req,
      {
        apply(target, thisArg, args) {
          // only intercept certain extensions
          if (!args[0].endsWith('.js') && !args[0].endsWith(".ts") && !args[0].endsWith('.tsx') ) {
            return req(...args);
          }

          let init = false;
          let value;

          function func() {}

          function l() {
            if (!init) {
              init = true;
              value = req(...args);
              if (value != null && value.__esModule != null) {
                const desc = Reflect.getOwnPropertyDescriptor(value, "__esModule");
                Object.defineProperty(func, "__esModule", desc);
              }
              toRun.delete(l);
            }
          }
      
          toRun.add(l);
          if (!toRunInterval) {
            toRunInterval = setTimeout(processPending, 0);
          }

          return new Proxy(func, {
            get(_, prop, receiver) {
              l();
              if (prop === Symbol.toPrimitive) {
                return value;
              }
              if (value == null) {
                return undefined;
              }
              return Reflect.get(value, prop, receiver);
            },

            set(_, p, v, receiver) {
              l();
              return Reflect.set(value, p, v, receiver);
            },

            has(_, p) {
              l();
              return Reflect.has(value, p);
            },

            deleteProperty(_, p) {
              l();
              return Reflect.deleteProperty(value, p);
            },

            apply(_, t, args) {
              l();
              if (typeof value === "object" && typeof value.default === 'function') {
                return Reflect.apply(value.default, t, args);
              }
              return Reflect.apply(value, t, args);
            },

            construct(_, args) {
              l();
              return Reflect.construct(value, args);
            },

            getPrototypeOf() {
              l();
              return Reflect.getPrototypeOf(value);
            },

            setPrototypeOf(_, p) {
              l();
              return Reflect.setPrototypeOf(value, p);
            },

            isExtensible() {
              l();
              return Reflect.isExtensible(value);
            },

            preventExtensions() {
              l();
              return Reflect.preventExtensions(value);
            },

            defineProperty(_, p, a) {
              l();
              return Reflect.defineProperty(value, p, a);
            },

            getOwnPropertyDescriptor(target, p) {
              l();
              if (!['arguments', 'caller', 'prototype'].includes(p)) {
                return Reflect.getOwnPropertyDescriptor(value, p);
              }

              return Reflect.getOwnPropertyDescriptor(target, p);
            },

            ownKeys() {
              l();

              const values = Reflect.ownKeys(value);
              for (const key of ['arguments', 'caller', 'prototype']) {
                if (!values.includes(key)) {
                  values.push(key);
                }
              }
              
              return values;
            },
          })
        },
      }
    );
  }

  $interceptModuleExecution$.push(function (options) {
    const { require } = options;
    options.require = prox(require);
  });
};
