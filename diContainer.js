"use strict";

//const fnArgs = require('parse-fn-args');
var fnArgs= function (fn) {
  var src = fn.toString()

  // remove comments
  src = src.replace(/(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg, '')

  var bi = src.indexOf('(')
  var ai = src.indexOf('=>')

  var args = ai > 0 && (ai < bi || bi < 0)
    ? src.slice(0, ai)
    : src.slice(bi + 1, src.indexOf(')'))

  args = args.replace(/\s+/g, '')

  return args ? args.split(',') : []
};


module.exports = () => {
  const dependencies = {};
  const factories = {};
  const diContainer = {};
  
  diContainer.factory = (name, factory) => {
    factories[name] = factory;
  };
  
  diContainer.register = (name, dep) => {
    dependencies[name] = dep;
  };
  
  diContainer.get = (name) => {
    if (!dependencies[name]) {
      const factory = factories[name];
      dependencies[name] = factory && 
          diContainer.inject(factory);
      if (!dependencies[name]) {
        throw new Error('Cannot find module: ' + name);
      }
    }
    return dependencies[name];
  };
  
  diContainer.inject = (factory) => {
    const args = fnArgs(factory)
      .map(function(dependency) {
        return diContainer.get(dependency);
      });
    return factory.apply(null, args);
  };
  
  return diContainer;
};
