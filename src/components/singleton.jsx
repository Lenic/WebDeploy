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
import Select from './core/select';

const Item = List.Item;
const Brief = Item.Brief;

const defaultItems = [{ value: '-1', label: '--' }];

export default class Singleton extends preact.Component {
  constructor() {
    super();

    let projectName = '--';

    const url = getPageParameter('url');
    if (url) {
      const segments = url.split('/');

      projectName = segments.slice(segments.length - 2, segments.length - 1)[0];
    }

    this.state = {
      isDeploying: false,
      jobs: [
        // {
        //   key: '123',
        //   completed: true,
        //   projectName: 'abc',
        //   machine: 'deploy-37',
        //   project: 'test-abc',
        //   notification: 'fed',
        // },
        // {
        //   key: '234',
        //   completed: true,
        //   projectName: 'def',
        //   machine: 'deploy-37',
        //   project: 'test-def',
        //   notification: 'fed',
        // },
      ],
      currentJobKey: '',
      info: { projectName },
      dataSource: { loading: true },
    };
  }

  componentDidMount() {
    fetch('http://t.helianshare.com:8005/api/v1/initial')
      .then(v => v.json())
      .then(v => this.setState(state => {
        const machines = defaultItems.concat(v.machines.map(v => ({
          value: v.name,
          label: v.name.slice(7),
        })));

        const projects = { [defaultItems[0].value]: defaultItems };
        v.machines.forEach(item => {
          projects[item.name] = defaultItems.concat(item.projects.map(v => ({
            value: v,
            label: v,
          })));
        });

        const notifications = defaultItems.concat(v.notifications.map(v => ({
          value: v,
          label: v,
        })));

        return {
          ...state,
          dataSource: { machines, projects, notifications },
          info: {
            ...state.info,
            machine: machines[0].value,
            project: projects[machines[0].value][0].value,
            notification: notifications[0].value,
          },
        };
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
  showMachines() {
    const self = this
      , { dataSource: { machines, projects }, info: { machine } } = this.state;

    Select.show({
      data: machines,
      value: machine,
      callback({ cancel, value }) {
        if (cancel) {
          return;
        }

        let convertedValue = value;
        if (!convertedValue) {
          convertedValue = defaultItems[0].value;
        }

        self.setState(v => {
          v.info = {
            ...v.info,
            machine: convertedValue,
            project: projects[convertedValue][0].value,
          };

          return v;
        });
      },
    });
  }

  @autobind
  showProjects() {
    const self = this
      , { dataSource: { projects }, info: { machine, project } } = this.state;

    Select.show({
      data: projects[machine],
      value: project,
      callback({ cancel, value }) {
        if (cancel) {
          return;
        }

        self.setState(v => {
          v.info = {
            ...v.info,
            project: value,
          };

          return v;
        });
      },
    });
  }

  @autobind
  showNotifications() {
    const self = this
      , { dataSource: { notifications }, info: { notification } } = this.state;

    Select.show({
      data: notifications,
      value: notification,
      callback({ cancel, value }) {
        if (cancel) {
          return;
        }

        let convertedValue = value;
        if (!convertedValue) {
          convertedValue = defaultItems[0].value;
        }

        self.setState(v => {
          v.info = {
            ...v.info,
            notification: convertedValue,
          };

          return v;
        });
      },
    });
  }

  @autobind
  getAddible() {
    const { info } = this.state
      , keys = Object.keys(info);

    return !(keys.length < 3 || keys.some(v => info[v] === '-1'));
  }

  @autobind
  addDeployJobHandler() {
    if (!this.getAddible()) {
      return Toast.fail('填写完成才可以部署！', 1);
    }

    this.setState(v => {
      v.jobs = [{ ...v.info, key: Date.now().toString() }].concat(v.jobs);
      v.info = { projectName: v.info.projectName };
      v.currentJobKey = v.jobs[0].key;

      return v;
    });
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

  renderBody({ dataSource: { machines, projects, notifications }, info }) {
    const selectedMachine = machines.find(v => v.value === info.machine)
      , machine = selectedMachine ? selectedMachine : defaultItems[0]
      , selectedProject = projects[machine.value].find(v => v.value === info.project)
      , project = selectedProject || projects[machines[0].value][0]
      , selectedNotification = notifications.find(v => v.value === info.notification)
      , notification = selectedNotification || defaultItems[0];

    return (
      <List renderHeader="部署控制台">
        <Item extra={info.projectName}>
          项目名称
          <Brief>根据部署包地址确定</Brief>
        </Item>
        <Item
          arrow="horizontal"
          extra={machine.label}
          onClick={this.showMachines}>
          部署机器
          <Brief>部署到哪台机器</Brief>
        </Item>
        <Item
          arrow="horizontal"
          extra={project.label}
          onClick={this.showProjects}>
          容器名称
          <Brief>根据容器名称定位路径</Brief>
        </Item>
        <Item
          arrow="horizontal"
          extra={notification.label}
          onClick={this.showNotifications}>
          通知对象
          <Brief>消息通知到哪个钉钉群</Brief>
        </Item>
      </List>
    );
  }

  renderBodyController() {
    return (
      <div>
        <WhiteSpace />
        <WingBlank>
          <Button
            type="primary"
            disabled={!this.getAddible()}
            onClick={this.addDeployJobHandler}>
            添加部署任务
          </Button>
        </WingBlank>
        <WhiteSpace />
      </div>
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
                  容器名称
                  <Brief>根据容器名称定位路径</Brief>
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
        {this.renderBodyController()}
        {state.jobs.length ? this.renderJobs(state) : null}
        {state.jobs.length ? this.renderDeploy(state) : null}
      </div>
    );
  }
}
