import React from 'react';
import PropTypes from 'prop-types';
import { getFieldValidateData, getFieldDisplayData, getFormValidateData } from '../data-util';

import { XFORM_FIELD_CHANGE, XFORM_VALIDATE } from '../const';


const formInsMap = {};
const addForm = (ins) => {
  const namespace = ins.context.getNamespace();
  const formName = ins.props.name;

  formInsMap[`${namespace}/${formName}`] = ins;
};

const removeForm = (namespace, formName) => {
  delete formInsMap[`${namespace}/${formName}`];
};

const getForm = (namespace, formName) => {
  return formInsMap[`${namespace}/${formName}`];
};

const isValidateSuccess = function (state, formName) {
  const formValidateData = getFormValidateData(state, formName);
  let result = true;
  for (let field in formValidateData) {
    const fieldValidateData = formValidateData[field];
    if (result && fieldValidateData) {
      result = fieldValidateData.status === 'error';
    }
  }

  return result;
}

class Form extends React.Component {
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
  componentDidMount() {
    addForm(this);
  }
  componentWillUnmount() {
    const namespace = this.context.getNamespace();
    const { name: formName } = this.props;

    removeForm(namespace, formName);
  }
  validate(callback) {
    const { name: formName } = this.props;
    this.dispatch({
      type: XFORM_VALIDATE,
      payload: {
        formName,
        callback
      }
    });
  }
  onFormSubmit() {
    const { onSubmit } = this.props;

    onSubmit && onSubmit(this.getFormData());
  }
  render() {
    const { children } = this.props;
    return (<form onSubmit={() => { return this.onFormSubmit(); }}>
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

Form.getForm = getForm;
// Form.isValidateSuccess = isValidateSuccess;

Form.validate = (namespace, formName, callback) => {
  debugger;
  if (typeof (formName) == 'function' && arguments.length == 2) {
    callback = formName;
    formName = undefined;
  }
  const ins = getForm(namespace, formName);

  if (ins) {
    ins.validate(callback);
  }
};

Form.getFormData = (namespace, formName) => {
  const ins = getForm(namespace, formName);
  if (ins) {
    return ins.getFormData();
  }
};


export default Form;
