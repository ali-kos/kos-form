import React from 'react';
import PropTypes from 'prop-types';

export default ({ FieldWrapper, FieldProps }) => {
  class Field extends React.Component {
    constructor(props) {
      super(props);

      this.onFieldChange = this.fieldChange.bind(this);
      this.getFieldValue = this.getValue.bind(this);
    }
    getValue(field) {
      return this.context.getFieldValue(field);
    }
    getValidateData(field) {
      return this.context.getFieldVaidateData(field);
    }
    getDisplay(field) {
      const display = this.context.getFieldDisplayData(field);

      return display === false ? 'none' : '';
    }
    fieldChange(field, onChange) {
      return (e) => {
        const { value } = e.target;
        onChange && onChange.call(e.target, e, field, value);
        this.context.onFieldChange(field, value);
      };
    }
    render() {
      const { children, field } = this.props;
      const validateData = this.getValidateData(field);


      const fieldProps = {
        ...FieldProps,
        ...this.props
      };

      fieldProps.style = fieldProps.style || {};
      fieldProps.style.display = this.getDisplay(field);

      console.log(fieldProps);

      return (<FieldWrapper
        {...fieldProps}
        {...validateData}
      >
        {React.Children.map(children, (child) => {
          const { onChange } = child.props;
          const props = {
            ...child.props,
            onChange: this.onFieldChange(field, onChange),
            value: this.getFieldValue(field),
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
