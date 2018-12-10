import Flex from 'antd-mobile/lib/flex';
import List from 'antd-mobile/lib/list';
import Toast from 'antd-mobile/lib/toast';
import autobind from 'autobind-decorator';
import Button from 'antd-mobile/lib/button';
import Accordion from 'antd-mobile/lib/accordion';
import WingBlank from 'antd-mobile/lib/wing-blank';
import WhiteSpace from 'antd-mobile/lib/white-space';
import SwipeAction from 'antd-mobile/lib/swipe-action';

import asyncEach from '$lib/asyncEach';
import getPageParameter from '$lib/getPageParameter';

import deploy from './core/deploy';

const Item = List.Item;
const Brief = Item.Brief;

function map(data, fn) {
  const list = [];

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const item = data[key];

      list.push(fn(item));
    }
  }

  return list;
}

export default class Batch extends preact.Component {
  constructor() {
    super();

    this.state = {
      jobs: [],
      isDeploying: false,
      currentJobKey: '',
      dataSource: { loading: true },
    };
  }

  componentDidMount() {
    fetch(`${API_PREFIX}/api/v1/bulk`)
      .then(v => v.json())
      .then(v => this.setState({
        dataSource: {
          data: v.reduce((x, y) => {
            x[y] = {
              id: y,
              data: null,
              loading: false,
            };

            return x;
          }, {}),
        },
      }));
  }

  @autobind
  deployHandler() {
    const { jobs } = this.state;

    const url = getPageParameter('url');
    if (!url) {
      return Toast.fail('没有需要部署的包！', 2);
    }

    this.setState({ isDeploying: true });

    asyncEach(jobs.filter(v => !v.completed), (value, next) => {
      const parameter = {
        ...value,
        packageUrl: url,
      };

      deploy(parameter).then(
        v => {
          value.id = v;
          value.completed = true;
          this.forceUpdate();
        },
        msg => {
          Toast.fail(`${value.machine.slice(7)} | ${value.project}\n部署异常\n${msg}`, 1);

          value.error = true;
          this.forceUpdate();
        },
      ).then(() => {
        const value = next();
        if (value) {
          this.setState({ isDeploying: false });
        }
      });
    });
  }

  @autobind
  addDeployJobHandler(id) {
    const token = setTimeout(() => this.setState(x => {
      x.dataSource.data[id].loading = true;

      return x;
    }), 200);

    fetch(`${API_PREFIX}/api/v1/bulk/${id}`)
      .then(v => v.json())
      .then(v => this.setState(x => {
        clearTimeout(token);

        x.jobs = v;
        x.currentJobKey = v[0].key;

        const item = x.dataSource.data[id];

        item.data = v;
        item.loading = false;

        return x;
      }))
      .catch(() => clearTimeout(token));
  }

  @autobind
  changeJobHandler(key) {
    this.setState({ currentJobKey: key });
  }

  removeJobHandler(key, e) {
    e.stopPropagation();

    this.setState(v => {
      v.jobs = v.jobs.filter(v => v.key !== key);

      return v;
    });
  }

  renderBody({ dataSource: { data } }) {
    return (
      <List renderHeader="部署控制台">
        {
          map(data, item => (
            <Item key={item.id} extra={
              <Button
                inline
                type="primary"
                className="btn-add"
                loading={item.loading}
                disabled={item.loading}
                onClick={this.addDeployJobHandler.bind(this, item.id)}>
                <i className="iconfont">&#xe690;</i>
              </Button>
            }>
              {item.id}
            </Item>
          ))
        }
      </List>
    );
  }

  renderJobs({ jobs, currentJobKey }) {
    const Panel = Accordion.Panel;

    return (
      <List renderHeader="待部署的任务">
        <Accordion accordion={true} activeKey={currentJobKey} onChange={this.changeJobHandler}>
          {
            jobs.map(v => (
              <Panel
                key={v.key}
                header={
                  <SwipeAction
                    autoClose={true}
                    right={[
                      {
                        text: '删除',
                        onPress: this.removeJobHandler.bind(this, v.key),
                        style: { backgroundColor: '#F4333C', color: 'white' },
                      },
                    ]}>
                    <Flex>
                      <Flex.Item className={{ 'job-processing-text': v.completed }}>
                        {`${v.machine.slice(7)} | ${v.project}`}
                      </Flex.Item>
                      <Flex.Item />
                      {
                        !v.completed ? null : (
                          <Flex.Item className="iconfont job-processing">{v.id} &#xe60c;</Flex.Item>
                        )
                      }
                    </Flex>
                  </SwipeAction>
                }>
                <Item className="for-eye" extra={v.projectName}>
                  项目名称
                  <Brief>根据部署包地址确定</Brief>
                </Item>
                <Item className="for-eye" extra={v.machine}>
                  部署机器
                  <Brief>部署到哪台机器</Brief>
                </Item>
                <Item className="for-eye" extra={v.project}>
                  目标项目
                  <Brief>根据目标项目定位路径</Brief>
                </Item>
                <Item className="for-eye" extra={v.notification}>
                  通知对象
                  <Brief>消息通知到哪个钉钉群</Brief>
                </Item>
              </Panel>
            ))
          }
        </Accordion>
      </List >
    );
  }

  renderDeploy({ jobs, isDeploying }) {
    return (
      <div>
        <WhiteSpace size="lg" />
        <WingBlank>
          <Button
            type="primary"
            loading={isDeploying}
            disabled={isDeploying || jobs.every(v => v.completed)}
            onClick={this.deployHandler}>
            立即部署
          </Button>
        </WingBlank>
        <WhiteSpace />
      </div>
    );
  }

  render(props, state) {
    const { dataSource } = state;

    if (dataSource.loading) {
      return (
        <div className="loading">
          <img src={require('../css/images/loading.svg')} />
        </div>
      );
    }

    return (
      <div>
        {this.renderBody(state)}
        {state.jobs.length ? this.renderJobs(state) : null}
        {state.jobs.length ? this.renderDeploy(state) : null}
      </div>
    );
  }
}
