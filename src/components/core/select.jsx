import Flex from 'antd-mobile/lib/flex';
import autobind from 'autobind-decorator';
import PickerView from 'antd-mobile/lib/picker-view';

let rootNode = null;
const Nothing = () => null
  , distroy = () => rootNode && preact.render(<Nothing />, document.body, rootNode);

export default class Select extends preact.Component {
  constructor({ value }) {
    super();

    this.state = { value };
  }

  static show(props) {
    rootNode = preact.render(preact.h(Select, props), document.body);
  }

  @autobind
  changeHandler(value) {
    this.setState({ value: value[0] });
  }

  @autobind
  cancelHandler() {
    this.props.callback({ cancel: true, value: null });

    distroy();
  }

  @autobind
  applyHandler() {
    this.props.callback({ cancel: false, value: this.state.value });

    distroy();
  }

  render({ data }, { value }) {
    return (
      <div>
        <div className="am-picker-popup-mask" onClick={this.cancelHandler}></div>
        <Flex
          direction="column"
          align="stretch"
          className="am-picker-popup"
          style={{ zIndex: 11000, transform: 'translateZ(1px)' }}>
          <Flex.Item>
            <Flex className="am-picker-popup-header">
              <div
                onClick={this.cancelHandler}
                className="am-picker-popup-item am-picker-popup-header-left">
                取消
              </div>
              <Flex.Item />
              <div
                onClick={this.applyHandler}
                className="am-picker-popup-item am-picker-popup-header-left">
                确定
              </div>
            </Flex>
          </Flex.Item>
          <Flex.Item>
            <PickerView
              data={[data]}
              value={[value]}
              cascade={false}
              onChange={this.changeHandler} />
          </Flex.Item>
        </Flex>
      </div>
    );
  }
}
