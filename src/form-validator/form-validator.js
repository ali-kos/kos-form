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
    this.fieldValidateIns = FieldValidator.factory(validators);
  }
  /**
   * 根据字段名，获取校验规则
   * @param {String} field 字段名
   */
  getValidatorByField(field) {
    return this.fieldValidateIns[field];
  }
  /**
   * 根据字段类型，获取校验规则
   * @param {String} fieldType 字段类型，可以用于多个字段使用同一个字段类型的场景
   */
  getValidatorByFieldType(fieldType) {
    return this.fieldValidateIns[fieldType];
  }
  /**
   * 禁用指定字段的校验规则
   * @param {String} field 字段名
   * @param {Boolean} disable 是否禁用
   */
  disableValidatorByField(field, disable) {
    const validator = this.getValidatorByField(field);
    if (validator) {
      validator.setDisable(disable);
    }
  }
  /**
   * 根据字段类型，禁用校验规则
   * @param {String} fieldType 字段类型
   * @param {Boolean} disable 是否禁用
   */
  disableValidatorByFieldType(fieldType, disable) {
    const fieldValidator = this.getValidatorByFieldType(fieldType);
    if (fieldValidator) {
      fieldValidator.setDisable(disable);
    }
  }
  /**
   * 禁用字段的指定校验规则
   * @param {String} field 字段名
   * @param {String|Number} rule 规则名称或者规则的序号
   * @param {Boolean} disable 是否禁用
   */
  disableValidatorRuleByField(field, rule, disable) {
    const validator = this.getValidatorByField(field);
    if (validator) {
      validator.setRuleDisable(disable);
    }
  }
  /**
   * 根据字段类型，禁用字段的指定校验规则
   * @param {String} fieldType 字段类型
   * @param {String|Number} rule 规则名称或者规则的序号
   * @param {Boolean} disable 是否禁用
   */
  disableValidatorRuleByFieldType(fieldType, rule, disable) {
    const fieldValidator = this.getValidatorByFieldType(fieldType);
    if (fieldValidator) {
      fieldValidator.setRuleDisable(disable);
    }
  }
  /**
   * 执行所有的校验，并返回校验结果
   * @param {Object} payload 包含所有的fieldTypeMap, fieldList
   * @param {Function} getState 获取完整State的方法
   */
  async runAll(dispatch, getState, payload) {
    const { formName, fieldValidateIns } = this;
    const state = getState();
    const { fieldTypeMap, fieldList } = payload;
    let formData = formName ? state[formName] : state;
    formData = formData || {};

    const fieldResult = {};
    let formResult = true;

    for (const field of fieldList) {
      const fieldType = fieldTypeMap[field];

      const value = formData[field];
      const payload = {
        field,
        fieldType,
        value,
        formName
      };
      // 返回一个只能执行更新字段校验信息的dispatch方法
      const fieldValidateDispatch = dispatch(payload);
      const result = await this.run(fieldValidateDispatch, getState, payload);

      formResult =
        formResult && (result ? result.validateStatus !== "error" : true);
      fieldResult[field] = result;
    }

    return {
      formResult,
      fieldResult
    };
  }
  /**
   *
   * @param {Object} payload 执行的上下文数据，包含field,fieldType字段,value
   * @param {Function} getState 获取完整State的方法
   */
  async run(dispatch, getState, payload) {
    const { field, fieldType } = payload;
    const fieldValidate =
      this.getValidatorByField(field) ||
      this.getValidatorByFieldType(fieldType);

    if (!fieldValidate) {
      return null;
    }

    return fieldValidate.run(dispatch, getState, payload);
  }
}

export default FormValidator;
