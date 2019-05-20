import React from "react";
import PropTypes from "prop-types";
import Util from "../lib/util";

const isInputElement = target => {
  return (
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
  );
};

const isInputEvent = e => {
  return e && isInputElement(e.target);
};

export default ({ FieldWrapper, FieldProps }) => {
  class Field extends React.Component {
    static defaultProps = {
      valuePropName: "value", // 默认是value属性，如switch等，支持checheck属性
      required: false,
      getOnChangeValue: e => {
        if (e && e.target) {
          return e.target.value;
        }
        return e;
      }
    };
    static propTypes = {
      field: PropTypes.string,
      vField: PropTypes.string,
      validator: PropTypes.any,
      required: PropTypes.bool,
      valuePropName: PropTypes.string,
      getOnChangeValue: PropTypes.func
    };
    constructor(props) {
      super(props);

      this.key = Util.randomId();
      this.state = {};
    }
    componentDidMount() {
      this.registerField();
    }
    componentWillUnmount() {
      this.revokeField();
    }
    componentDidUpdate() {
      this.registerField();
    }
    registerField(){
      const { context = {} } = this;
      const { registerField } = context;
      if (registerField) {
        registerField(this);
      } else {
        console.warn("Field needs Form Parents!");
      }
    }
    revokeField(){
      const { context = {}, key } = this;
      const { revokeField } = context;
      if (revokeField) {
        revokeField(key);
      }
    }
    getFieldValue() {
      const { field } = this.props;

      return this.isOnComposition
        ? this.state.inputValue
        : this.context.getFieldValue(field);
    }
    getValidateData() {
      const { field } = this.props;
      return this.context.getFieldVaidateData(field);
    }
    getDisplay() {
      const { field } = this.props;
      return this.context.getFieldDisplayData(field) === false ? false : true;
    }
    onFieldChange(onChange) {
      return function(e) {
        const {
          field,
          getOnChangeValue,
          vField = field, // vField就是默认的校验字段，默认为field
          required,
          validator
        } = this.props;
        const value = getOnChangeValue.apply(this, arguments);

        if (this.isOnComposition) {
          this.innerValue = value;
          this.setState({
            inputValue: value
          });
        } else {
          // 是input，记录input的光标的位置
          if (isInputEvent(e)) {
            this.inputSelection = {
              start: e.target.selectionStart,
              end: e.target.selectionEnd
            };
            this.inputTarget = e.target;
          }

          onChange && onChange.apply(this, arguments);
          this.context.onFieldChange(
            { field, value, vField, required, validator },
            e
          );
        }
      }.bind(this);
    }
    onCompositionHandler(type, onChange, e) {
      switch (type) {
        case "start":
          this.isOnComposition = true;
          break;
        case "update":
          this.isOnComposition = true;
          break;
        case "end":
          this.isOnComposition = false;
          if (isInputEvent(e) && !this.isOnComposition) {
            this.onFieldChange(onChange)(e);
          }
          break;
      }
    }
    onFieldFocus(onFocus) {
      return e => {
        onFocus && onFocus.apply(this, arguments);
      };
    }
    onFieldKeyDown(onKeyDown) {}
    onFieldKeyUp(onKeyUp) {}
    onFieldBlur(onBlur) {}
    componentDidUpdate(prevProps) {
      // const { value } = prevProps;
      const value = this.getFieldValue() || "";
      const { inputSelection, inputTarget } = this;
      if (inputSelection && inputTarget) {
        // 在 didUpdate 时根据情况恢复光标的位置
        // 如果光标的位置小于值的长度，那么可以判定属于中间编辑的情况
        // 此时恢复光标的位置
        if (inputSelection.start < value.length) {
          inputTarget.selectionStart = inputSelection.start;
          inputTarget.selectionEnd = inputSelection.end;
          this.inputSelection = null;
          this.inputTarget = null;
        }
      }
    }
    render() {
      const isDisplay = this.getDisplay();
      if (!isDisplay) {
        return null;
      }

      const { children, valuePropName, required } = this.props;
      const validateData = this.getValidateData();

      const fieldProps = {
        ...FieldProps,
        ...this.props,
        ...validateData,
        required
      };

      const { onCompositionHandler } = this;
      const value = this.getFieldValue();

      return (
        <FieldWrapper {...fieldProps}>
          {React.Children.map(children, (child, index) => {
            const {
              onChange,
              onFocus,
              onBlur,
              onKeyDown,
              onKeyUp
            } = child.props;

            // const onFieldChange = this.onFieldChange(onChange);
            const props = {
              ...child.props,
              [valuePropName]: value,
              onChange: this.onFieldChange(onChange),
              // onFocus: this.onFieldFocus(onFocus),
              // onBlur: this.onFieldBlur(onBlur),
              // onKeyDown: this.onFieldKeyDown(onKeyDown),
              // onKeyUp: this.onFieldKeyUp(onKeyUp),
              onCompositionStart: onCompositionHandler.bind(
                this,
                "start",
                onChange
              ),
              onCompositionUpdate: onCompositionHandler.bind(
                this,
                "update",
                onChange
              ),
              onCompositionEnd: onCompositionHandler.bind(this, "end", onChange)
            };
            return React.createElement(child.type, props);
          })}
        </FieldWrapper>
      );
    }
  }

  Field.contextTypes = {
    registerField: PropTypes.func,
    revokeField: PropTypes.func,
    onFieldChange: PropTypes.func,
    getFieldValue: PropTypes.func,
    getFieldVaidateData: PropTypes.func,
    getFieldDisplayData: PropTypes.func
  };

  return Field;
};
