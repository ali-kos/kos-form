import FieldValidator from "./field-validator";

class FormValidator {
  /**
   * 表单校验
   * @param {Array<Validator>} validators 校验规则配置
   * @param {String} formName 表单名
   */
  constructor(validators = [], formName) {
    this.formName = formName;

    // 实例化字段的校验规则
    this.fieldValidatorMap = FieldValidator.factory(validators);
  }
  /**
   * 根据字段名，获取校验规则
   * @param {String} field 字段名
   */
  getFieldValidator(field) {
    return this.fieldValidatorMap[field];
  }
  /**
   * 禁用指定字段的校验规则
   * @param {String} field 字段名
   * @param {Boolean} disable 是否禁用
   */
  disableFieldValidator(field, disabled = true) {
    const validator = this.getFieldValidator(field);
    if (validator) {
      validator.setDisable(disabled);
    }
  }
  /**
   * 禁用字段的指定校验规则
   * @param {String} field 字段名
   * @param {String|Number} rule 规则名称或者规则的序号
   * @param {Boolean} disable 是否禁用
   */
  disableFieldValidatorRule(field, rule, disabled = true) {
    const validator = this.getFieldValidator(field);
    if (validator) {
      validator.setRuleDisable(rule, disabled);
    }
  }
  /**
   * 执行所有的校验，并返回校验结果
   * @param {Object} payload 包含所有的 fieldPropsList;
   * @param {Function} getState 获取完整State的方法
   */
  async validate(dispatch, getState, payload) {
    const { formName, fieldValidatorMap } = this;
    const state = getState();
    const { fieldPropsList } = payload;
    const formData = (formName ? state[formName] : state) || {};
    const fieldResult = {};
    let formResult = true;

    // 此处循环的fieldPropsList是表单的fieldPropsList，即一个表单有多少个输入字段
    for (const fieldProps of fieldPropsList) {
      const { field, vField = field, required, validator } = fieldProps;

      const value = formData[field];
      const payload = {
        field,
        vField,
        value,
        formName,
        required,
        validator
      };
      // 返回一个只能执行更新字段校验信息的dispatch方法
      const fieldValidateDispatch = dispatch(payload);

      const result = await this.validateField(
        fieldValidateDispatch,
        getState,
        payload
      );

      fieldResult[field] = result;

      formResult =
        formResult && (result ? result.validateStatus !== "error" : true);
    }

    return {
      formResult,
      fieldResult
    };
  }
  /**
   * 执行校验，
   * @param {Function} dispatch 可以更新校验状态的回调方法
   * @param {Function} getState 获取完整State的方法
   * @param {Object} payload 执行的上下文数据，包含field,vField字段,value
   */
  async validateField(dispatch, getState, payload) {
    const { field, vField = field } = payload;
    // 此处将vField作为默认获取校验规则的key
    const fieldValidator =
      this.getFieldValidator(vField) || new FieldValidator(field);

    return await fieldValidator.run(dispatch, getState, payload);
  }
}

export default FormValidator;
