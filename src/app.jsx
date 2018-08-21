import autobind from 'autobind-decorator';
import TabBar from 'antd-mobile/lib/tab-bar';

import Batch from './components/batch';
import Singleton from './components/singleton';

const singleton = (<i className="iconfont" style={{ width: 22, height: 22 }}>&#xea67;</i>)
  , selectedIconSingleton = (<i className="iconfont" style={{ width: 22, height: 22, color: '#108EE9' }}>&#xea67;</i>)
  , batch = (<i className="iconfont" style={{ width: 22, height: 22 }}>&#xe602;</i>)
  , selectedBatch = (<i className="iconfont" style={{ width: 22, height: 22, color: '#108EE9' }}>&#xe602;</i>);

export default class App extends preact.Component {
  constructor() {
    super();

    this.state = { selectedIndex: 0 };
  }

  @autobind
  changeSelectedHandler(index) {
    this.setState({ selectedIndex: index });
  }

  render() {
    return (
      <div id="app">
        <TabBar>
          <TabBar.Item title="单独部署"
            key="singleton"
            icon={singleton}
            selected={true}
            selectedIcon={selectedIconSingleton}
            onPress={this.changeSelectedHandler.bind(this, 0)}>
            <Singleton />
          </TabBar.Item>
          <TabBar.Item
            title="批量部署"
            key="batch"
            icon={batch}
            selected={false}
            selectedIcon={selectedBatch}
            onPress={this.changeSelectedHandler.bind(this, 1)}>
            <Batch />
          </TabBar.Item>
        </TabBar>
      </div>
    );
  }
}
