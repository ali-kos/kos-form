import React from "react";
import PropTypes from "prop-types";

export default ({ FieldWrapper, FieldProps }) => {
  class Field extends React.PureComponent {
    static defaultProps = {
      getOnChangeValue: e => {
        if (e && e.target) {
          return e.target.value;
        }
        return e;
      }
    };
    static propTypes = {
      field: PropTypes.string,
      fieldType: PropTypes.string,
      validator: PropTypes.any,
      getOnChangeValue: PropTypes.func
    };
    constructor(props) {
      super(props);

      this.state = {};
    }
    componentDidMount() {
      const { fieldType, field } = this.props;
      this.context && this.context.registerField(field, fieldType);
    }
    componentWillUnmount() {
      const { fieldType, field } = this.props;
      this.context && this.context.revokeField(field, fieldType);
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
        const { field, getOnChangeValue, fieldType } = this.props;
        const value = getOnChangeValue.apply(this, arguments);

        if (this.isOnComposition) {
          this.innerValue = value;
          this.setState({
            inputValue: value
          });
        } else {
          // 是input，记录input的光标的位置
          if (e.target instanceof HTMLInputElement) {
            this.inputSelection = {
              start: e.target.selectionStart,
              end: e.target.selectionEnd
            };
            this.inputTarget = e.target;
          }

          onChange && onChange.apply(this, arguments);
          this.context.onFieldChange({ field, value, fieldType }, e);
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
          if (e.target instanceof HTMLInputElement && !this.isOnComposition) {
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
      const value = this.getFieldValue();
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

      const { children } = this.props;
      const validateData = this.getValidateData();

      const fieldProps = {
        ...FieldProps,
        ...this.props,
        ...validateData
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
              value,
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
