import React from "react";
import PropTypes from "prop-types";

export default ({ FieldWrapper, FieldProps }) => {
  class Field extends React.PureComponent {
    static defaultProps = {
      getOnChangeValue: e => {
        return e.target.value;
      }
    };
    static propTypes = {
      field: PropTypes.string,
      fieldType: PropTypes.string
    };
    constructor(props) {
      super(props);

      this.state = {};

      this.onFieldChange = this.fieldChange.bind(this);
      this.getFieldValue = this.getValue.bind(this);
    }
    componentDidMount() {
      const { fieldType, field } = this.props;
      this.context && this.context.registerField(field, fieldType);
    }
    componentWillUnmount() {
      const { fieldType, field } = this.props;
      this.context && this.context.revokeField(field, fieldType);
    }
    getValue() {
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
    fieldChange(onChange) {
      var _this = this;
      return function(e) {
        const { field, getOnChangeValue, fieldType } = this.props;
        const value = getOnChangeValue.apply(this, arguments);

        if (this.isOnComposition) {
          this.innerValue = value;
          this.setState({
            inputValue: value
          });
        } else {
          onChange && onChange.apply(this, arguments);
          this.context.onFieldChange({ field, value, fieldType });
        }
      }.bind(this);
    }
    onCompositionHandler(type, e) {
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
            this.onChange(e);
          }
          break;
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

      return (
        <FieldWrapper {...fieldProps}>
          {React.Children.map(children, child => {
            const { onChange } = child.props;
            this.onChange = this.onFieldChange(onChange);
            const props = {
              ...child.props,
              onChange: this.onChange,
              onCompositionStart: this.onCompositionHandler.bind(this, "start"),
              onCompositionUpdate: this.onCompositionHandler.bind(
                this,
                "update"
              ),
              onCompositionEnd: this.onCompositionHandler.bind(this, "end"),
              value: this.getFieldValue()
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
