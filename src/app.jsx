import autobind from 'autobind-decorator';

import getPageParameter from '$lib/getPageParameter';

export default class App extends preact.Component {
  constructor() {
    super();

    this.state = {
      submitEnabled: true,
      dataSource: { loading: true },
      projectName: 'doctor-website',
      form: {},
      infos: [],
    };

    this.$refs = {};
  }

  componentDidMount() {
    fetch('http://t.helianshare.com:8005/api/v1/initial')
      .then(v => v.json())
      .then(v => this.setState({ dataSource: { data: v } }));
  }

  @autobind
  changeMachineHandler({ target: { value } }) {
    this.setState(state => {
      state.form = {
        ...state.form,
        machine: value,
        project: '-1',
      };

      return state;
    });
  }

  @autobind
  changeProjectHandler({ target: { value } }) {
    this.setState(state => {
      state.form = {
        ...state.form,
        project: value,
      };

      return state;
    });
  }

  @autobind
  changeNotificationHandler({ target: { value } }) {
    this.setState(state => {
      state.form = {
        ...state.form,
        notification: value,
      };

      return state;
    });
  }

  @autobind
  deployHandler() {
    const { form } = this.state
      , keys = Object.keys(form);

    if (keys.length < 3 || keys.some(v => form[v] === '-1')) {
      return alert('需要填写完成才可以部署！');
    }

    const setInfo = msg => this.setState(state => {
      state.infos = state.infos.concat(msg);
      return state;
    });

    const url = getPageParameter('url');
    if (!url) {
      return setInfo('没有需要部署的包！');
    }

    setInfo('部署信息提交中……');
    this.setState({ submitEnabled: false });
    fetch('http://t.helianshare.com:8005/api/v1/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        packageUrl: url,
      }),
    }).then(
      res => {
        this.setState({ submitEnabled: true });

        if (res.ok) {
          res.json().then(v => setInfo(`部署队列编号：${v.id}`));
        } else if (res.status >= 400 && res.status <= 500) {
          setInfo('参数传递错误！');
        }
      },
      () => {
        setInfo('服务器异常！');
        this.setState({ submitEnabled: true });
      },
    );
  }

  @autobind
  renderForm({ form }, { machines, notifications }) {
    const currentMachine = form.machine
      , selectedMachine = machines.find(v => v.name === currentMachine)
      , projects = selectedMachine ? selectedMachine.projects : [];

    return (
      <form className="pure-form pure-form-aligned">
        <fieldset>
          <legend>部署控制台</legend>

          <div className="pure-control-group">
            <label>项目名称：</label>
            <span className="message-inline">
              {this.state.projectName}
            </span>
          </div>

          <div className="pure-control-group">
            <label>部署地址：</label>
            <select class="pure-input-1-2" value={form.machine || '-1'} onChange={this.changeMachineHandler}>
              <option value="-1">--</option>
              {machines.map(({ name }) => (<option value={name}>{name}</option>))}
            </select>
          </div>

          <div className="pure-control-group" value={form.project || '-1'} onChange={this.changeProjectHandler}>
            <label>容器名称：</label>
            <select class="pure-input-1-2">
              <option value="-1">--</option>
              {projects.map(v => (<option value={v}>{v}</option>))}
            </select>
          </div>

          <div className="pure-control-group" value={form.notification || '-1'} onChange={this.changeNotificationHandler}>
            <label>通知对象：</label>
            <select class="pure-input-1-2">
              <option value="-1">--</option>
              {notifications.map(v => (<option value={v}>{v}</option>))}
            </select>
          </div>

          <div className="pure-control-group">
            <button type="button" class="pure-button pure-button-primary" disabled={!this.state.submitEnabled} onClick={this.deployHandler}>
              开始部署
            </button>
          </div>

        </fieldset>
      </form>
    );
  }

  @autobind
  renderInfo({ infos }) {
    return (
      <ul>
        {infos.map(v => <li>{v}</li>)}
      </ul>
    );
  }

  render(props, state) {
    const { data, loading } = state.dataSource;
    if (loading) {
      return (
        <div className="loading">
          <img src={require('./css/images/loading.svg')} />
        </div>
      );
    }

    return (
      <div className="container">
        {this.renderForm(state, data)}
        {this.renderInfo(state)}
      </div>
    );
  }
}
