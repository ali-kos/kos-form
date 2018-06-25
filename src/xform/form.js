import React from 'react';
import PropTypes from 'prop-types';
import { getFieldValidateData, getFieldDisplayData } from '../data-util';

import { XFORM_VALIDATE_DATA, XFORM_FIELD_CHANGE, XFORM_VALIDATE } from '../const';

class Form extends React.Component {
  constructor(props) {
    super(props);
  }
  dispatch(action) {
    const dispatch = this.props.dispatch || this.context.dispatch;

    dispatch && dispatch(action);
  }
  getState() {
    const { getState } = this.context;
    if (getState) {
      return getState();
    }
    return this.props;
  }
  /**
   * 根据字段名称，获取字段的展示数据
   * @param {String} field 字段名称
   */
  getFieldDisplayData(field) {
    const { name: formName } = this.props;
    const state = this.getState();
    return getFieldDisplayData(state, formName, field)
  }
  /**
   * 根据字段名称，获取字段的校验数据
   * @param {String} field 字段名称
   */
  getFieldVaidateData(field) {
    const { name: formName } = this.props;
    const state = this.getState();
    return getFieldValidateData(state, formName, field);
  }
  /**
   * 字段值发生变化时触发
   * @param {String} field 字段名称
   * @param {String} value 值
   */
  onFieldChange(field, value) {
    const { name: formName } = this.props;

    this.dispatch({
      type: XFORM_FIELD_CHANGE,
      payload: {
        field, value, formName,
      },
    });
  }
  /**
   * 获取表单值
   */
  getFormData() {
    const { name: formName } = this.props;
    const state = this.getState();

    return state[formName] || {};
  }
  /**
   * 根据字段名称，获取字段的值
   * @param {String} field 字段名称
   */
  getFieldValue(field) {
    const formData = this.getFormData();
    return formData[field];
  }
  getChildContext() {
    return {
      onFieldChange: this.onFieldChange.bind(this),
      getFieldValue: this.getFieldValue.bind(this),
      getFieldVaidateData: this.getFieldVaidateData.bind(this),
      getFieldDisplayData: this.getFieldDisplayData.bind(this),
    };
  }
  render() {
    const { children } = this.props;
    return (<form>
      {children}
    </form>);
  }
}

// 传递给field用的
Form.childContextTypes = {
  onFieldChange: PropTypes.func,
  getFieldValue: PropTypes.func,
  getFieldVaidateData: PropTypes.func,
  getFieldDisplayData: PropTypes.func,
};


// 来自wrapper
Form.contextTypes = {
  dispatch: PropTypes.func,
  getState: PropTypes.func,
  getNamespace: PropTypes.func,
};


Form.createValidateAction = ({ formName, callback }) => ({
  type: XFORM_VALIDATE,
  payload: {
    formName,
    callback,
  },
});

export default Form;
