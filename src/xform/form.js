import React from "react";
import PropTypes from "prop-types";
import KOS from "kos-core";

import {
  getFieldValidateData,
  getFieldDisplayData,
  getFormValidateData,
  createFormDataPayload
} from "../data-util";

import {
  XFORM_FIELD_CHANGE,
  XFORM_VALIDATE,
  XFORM_FIELD_VALIDATE,
  XFORM_FIELD_VALIDATOR_DISABLE,
  XFORM_FIELD_VALIDATOR_RULE_DISABLE,
  XFORM_CLEAR_FIELD_VALIDATE,
  XFORM_CLEAR_VALIDATE
} from "../const";

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

class Form extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    onSubmit: PropTypes.func,
    dispatch: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.fieldList = [];
    this.vFieldMap = {};
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
   * @param {String} field 字段名称，表单内不可重复
   * @param {String} value 值
   * @param {String} vField 字段类型，表单内可重复
   */
  onFieldChange({ field, value, vField }) {
    const { name: formName } = this.props;

    const payload = {
      field,
      vField,
      value,
      formName
    };
    // 受控组件：传递值
    this.dispatch({
      type: XFORM_FIELD_CHANGE,
      payload
    });

    // 执行表单校验，连续操作只触发一次校验
    if (this.fieldChangeValidateSeed) {
      clearTimeout(this.fieldChangeValidateSeed);
    }
    this.fieldChangeValidateSeed = setTimeout(() => {
      this.validateField(payload);
    }, 400);
  }

  onFieldFocus({ field, vField }) {}
  onFieldBlur() {}
  onFieldKeyUp() {}
  onFieldDown() {}
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
  /**
   * 执行全表单校验
   */
  validate(callback) {
    const { name: formName } = this.props;
    const { vFieldMap, fieldList } = this;
    this.dispatch({
      type: XFORM_VALIDATE,
      payload: {
        formName,
        vFieldMap,
        fieldList,
        callback
      }
    });
  }
  /**
   * 执行表单字段校验
   * @param {String|Object} field 校验的参数
   * @param {Function} callback 回调方法
   */
  validateField(field, callback) {
    const payload = {
      value: this.getFieldValue(field),
      formName: this.props.name
    };
    if (typeof field === "object") {
      Object.assign(payload, field);
    } else {
      Object.assign(payload, {
        field,
        vField: field
      });
    }

    this.dispatch({
      type: XFORM_FIELD_VALIDATE,
      payload: {
        ...payload,
        callback
      }
    });
  }
  /**
   * 禁用字段校验
   * @param {String} field 字段名
   * @param {Boolean} disabled 是否禁用
   */
  disableFieldValidator(field, disabled) {
    const { name: formName } = this.props;
    this.dispatch({
      type: XFORM_FIELD_VALIDATOR_DISABLE,
      payload: {
        field,
        formName,
        disabled
      }
    });
  }
  /**
   * 禁用字段校验的指定规则
   * @param {String} field 字段名
   * @param {String} rule 校验规则，可以是校验规则名，也可以是校验规则的index，从0开始
   * @param {Boolean} disabled 是否禁用
   */
  disableFieldValidatorRule(field, rule, disabled) {
    const { name: formName } = this.props;
    this.dispatch({
      type: XFORM_FIELD_VALIDATOR_RULE_DISABLE,
      payload: {
        field,
        formName,
        rule,
        disabled
      }
    });
  }
  clearValidate() {
    const { name: formName } = this.props;
    const { fieldList, vFieldMap } = this;
    this.dispatch({
      type: XFORM_CLEAR_VALIDATE,
      payload: { formName, fieldList, vFieldMap }
    });
  }
  clearFieldValidate(field) {
    const { name: formName } = this.props;
    this.dispatch({
      type: XFORM_CLEAR_FIELD_VALIDATE,
      payload: { formName, field }
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
  registerField(field, vField) {
    if (field) {
      this.fieldList.push(field);

      if (vField) {
        this.vFieldMap[field] = vField;
      }
    }
  }
  revokeField(field) {
    const index = this.fieldList.indexOf(field);
    if (index > -1) {
      this.fieldList.splice(index, 1);
    }

    delete this.vFieldMap[field];
  }
  getChildContext() {
    return {
      registerField: this.registerField.bind(this),
      revokeField: this.revokeField.bind(this),
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
        {...this.props}
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
  registerField: PropTypes.func,
  revokeField: PropTypes.func,
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

KOS.wrapperProps({
  getForm(formName) {
    const namespace = this.getNamespace();

    return Form.getForm(namespace, formName);
  }
});

export default Form;
