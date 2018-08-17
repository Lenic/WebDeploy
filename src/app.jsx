export default class App extends preact.Component {
  constructor() {
    super();

    this.state = {
      name: '张三',
    };

    this.$refs = {};
  }

  render() {
    return (
      <div>Hello {this.state.name}!</div>
    );
  }
}
