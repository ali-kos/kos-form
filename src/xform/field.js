import React from 'react';
import PropTypes from 'prop-types';

export default ({ FieldWrapper, FieldProps }) => {
  class Field extends React.Component {
    static defaultProps = {
      getOnChangeValue: (e) => {
        return e.value;
      }
    }
    constructor(props) {
      super(props);

      this.onFieldChange = this.fieldChange.bind(this);
      this.getFieldValue = this.getValue.bind(this);
    }
    getValue() {
      const { field } = this.props;
      return this.context.getFieldValue(field);
    }
    getValidateData() {
      const { field } = this.props;
      return this.context.getFieldVaidateData(field);
    }
    getDisplay() {
      const { field } = this.props;
      return this.context.getFieldDisplayData(field);
    }
    fieldChange(onChange) {
      const { field, getOnChangeValue } = this.props;
      return (e) => {
        const getOnChangeValue = this.props;
        const value = getOnChangeValue.apply(this, arguments);

        onChange && onChange.apply(this, arguments);
        this.context.onFieldChange(field, value);
      };
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
        ...validateData,
      };

      return (<FieldWrapper
        {...fieldProps}
      >
        {React.Children.map(children, (child) => {
          const { onChange } = child.props;
          const props = {
            ...child.props,
            onChange: this.onFieldChange(onChange),
            value: this.getFieldValue(),
          };
          return React.createElement(child.type, props);
        })}
      </FieldWrapper>);
    }
  }

  Field.contextTypes = {
    onFieldChange: PropTypes.func,
    getFieldValue: PropTypes.func,
    getFieldVaidateData: PropTypes.func,
    getFieldDisplayData: PropTypes.func,
  };

  return Field;
};
