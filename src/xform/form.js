import React from "react";
import PropTypes from "prop-types";
import {
  getFieldValidateData,
  getFieldDisplayData,
  getFormValidateData,
  createFormDataPayload
} from "../data-util";

import { XFORM_FIELD_CHANGE, XFORM_VALIDATE } from "../const";

const formInsMap = {};
const addForm = ins => {
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
const runFormMethod = (namespace, formName, method) => {
  const ins = getForm(namespace, formName);

  if (ins) {
    return ins[method] && ins[method]();
  }
};
const validate = (namespace, formName, callback) => {
  if (typeof formName == "function" && arguments.length == 2) {
    callback = formName;
    formName = undefined;
  }
  const ins = getForm(namespace, formName);

  if (ins) {
    ins.validate(callback);
  }
};

const setFormData = (namespace, formName) =>
  runFormMethod(namespace, formName, "setData");
const getFormData = (namespace, formName) =>
  runFormMethod(namespace, formName, "getData");
const resetForm = (namespace, formName) =>
  runFormMethod(namespace, formName, "reset");

const isValidateSuccess = function(state, formName) {
  const formValidateData = getFormValidateData(state, formName);
  let result = true;
  for (let field in formValidateData) {
    const fieldValidateData = formValidateData[field];
    if (result && fieldValidateData) {
      result = fieldValidateData.status === "error";
    }
  }

  return result;
};

class Form extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    onSubmit: PropTypes.func,
    dispatch: PropTypes.func
  };

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
    return getFieldDisplayData(state, formName, field);
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
        field,
        value,
        formName
      }
    });
  }
  /**
   * 获取表单值
   */
  getData() {
    const { name: formName } = this.props;
    const state = this.getState();

    return state[formName] || {};
  }
  reset() {
    const namespace = this.context.getNamespace();
    const { name: formName } = this.props;
    const Model = KOS.getModel(namespace);

    const initialModel = Model.getInitial();
    this.setData(initialModel[formName]);
  }
  setData(formData) {
    const { name: formName } = this.props;

    this.dispatch({
      type: "setState",
      payload: {
        [formName]: formData
      }
    });
  }
  /**
   * 根据字段名称，获取字段的值
   * @param {String} field 字段名称
   */
  getFieldValue(field) {
    const formData = this.getData();
    return formData[field];
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
  onSubmit() {
    const { onSubmit } = this.props;

    this.validate(result => {
      const formData = this.getData();
      result && onSubmit && onSubmit(formData);
    });

    return false;
  }

  getChildContext() {
    return {
      onFieldChange: this.onFieldChange.bind(this),
      getFieldValue: this.getFieldValue.bind(this),
      getFieldVaidateData: this.getFieldVaidateData.bind(this),
      getFieldDisplayData: this.getFieldDisplayData.bind(this)
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

  render() {
    const { children } = this.props;
    return (
      <form
        onSubmit={() => {
          return this.onSubmit();
        }}
      >
        {children}
      </form>
    );
  }
}

// 传递给field用的
Form.childContextTypes = {
  onFieldChange: PropTypes.func,
  getFieldValue: PropTypes.func,
  getFieldVaidateData: PropTypes.func,
  getFieldDisplayData: PropTypes.func
};

// 来自wrapper
Form.contextTypes = {
  dispatch: PropTypes.func,
  getState: PropTypes.func,
  getNamespace: PropTypes.func
};

Form.getForm = getForm;
Form.getFormData = getFormData;
Form.resetForm = resetForm;
Form.validate = validate;

export default Form;
