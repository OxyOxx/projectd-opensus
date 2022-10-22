const methods = ['get', 'post', 'delete', 'patch', 'put'];
const reflectors = [
  'toString',
  'valueOf',
  'inspect',
  'constructor',
  Symbol.toPrimitive,
  Symbol.for('nodejs.util.inspect.custom'),
];
const fetch = require('./fetch.js');

function buildRoute(path, opt = {}) {
  const route = [''];
  const handler = {
    get(target, name) {
      if (reflectors.includes(name)) return () => path + route.join('/');
      else if (methods.includes(name)) {
        return options => fetch(`${path}${route.join('/')}`, {...Discord.mergeDefault(opt, options), method: name.toUpperCase()})
      }
      route.push(name);
      return new Proxy(() => {}, handler);
    },
    apply(target, _, args) {
      route.push(...args.filter(x => x !== null));
      return new Proxy(() => {}, handler);
    },
  };
  return new Proxy(() => {}, handler);
}

module.exports = buildRoute;
