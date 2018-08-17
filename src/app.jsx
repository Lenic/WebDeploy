export default class App extends preact.Component {
  constructor() {
    super();

    this.state = {
      data: { loading: true },
    };

    this.$refs = {};
  }

  componentDidMount() {
    fetch('http://t.helianshare.com:8005/api/v1/initial')
      .then(v => v.json())
      .then(v => this.setState({ data: { data: v } }));
  }

  render() {
    return (
      <pre style={{ fontSize: 14 }}>{JSON.stringify(this.state.data, null, '  ')}!</pre>
    );
  }
}
