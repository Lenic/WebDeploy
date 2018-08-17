const noop = () => { };

export default class Pipeline {
  constructor(context) {
    this.$list = [];
    this.$context = context || null;
  }

  static create(context) {
    return new Pipeline(context);
  }

  use(plugin) {
    plugin && plugin(this);

    return this;
  }

  end(fn) {
    this.$list.push(fn);

    return this;
  }

  exec(...args) {
    this.$list.concat(noop).reduce((x, y) => {
      x.apply(this.$context, args);

      return y;
    });
  }
}
