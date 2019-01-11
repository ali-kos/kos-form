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
   * 根据字段名或者字段类型，获取校验规则，传一个即可
   * @param {String} field 字段名
   * @param {String} fieldType 字段类型，可以用于多个字段使用同一个字段类型的场景
   */
  getValidatorsByField(field, fieldType) {
    return (
      this.fieldValidateIns[field] || this.fieldValidateIns[fieldType] || null
    );
  }
  /**
   * 执行所有的校验，并返回校验结果
   * @param {Object} payload 包含所有的fieldTypeMap, fieldList
   * @param {Function} getState 获取完整State的方法
   */
  async runAll(payload, getState) {
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
      const result = await this.run(
        {
          field,
          fieldType,
          value,
          formName
        },
        getState
      );

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
   * @param {Object} payload 执行的上下文数据，包含field,fieldType字段
   * @param {Function} getState 获取完整State的方法
   */
  async run(payload, getState) {
    const { field, fieldType } = payload;
    const fieldValidate = this.getValidatorsByField(field, fieldType);

    if (!fieldValidate) {
      return null;
    }

    return fieldValidate.run(payload, getState);
  }
}

export default FormValidator;
