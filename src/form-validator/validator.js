import FieldValidator from './field-validator';
import { isSymbolTypeName, getTypeChildrenData, toTypeName } from '../data-util';
class Validator {
  constructor(validators = [], namespace, formName) {
    this.formName = formName;
    this.namespace = namespace;

    this.fieldValidateIns = FieldValidator.factory(validators);
  }
  getValidatorsByField(field) {
    return this.fieldValidateIns[field] || null;
  }
  async runFieldType(payload, getState) {
    const { vasKey, formName, formData } = payload;
    const typeName = toTypeName(vasKey);
    const fieldList = getTypeChildrenData(typeName, formName, getState);
    const fieldListResult = {};
    let noError = true;
    for(const field of fieldList) {
      const value = formData[field];
      const newPayload = { field, formName, value, vasKey };
      const fieldResult = await this.run(newPayload, getState);
      fieldListResult[field] = fieldResult;
      noError = noError && (fieldResult ? fieldResult.validateStatus !== 'error' : true);
    }
    return {fieldListResult, noError};
  }
  async runAll(getState) {
    const { formName, fieldValidateIns } = this;
    const state = getState();
    let formData = formName ? state[formName] : state;
    formData = formData || {};

    const fieldResult = {};
    let formResult = true;

    for (const vasKey in fieldValidateIns) {

      let result;
      const isFieldType = isSymbolTypeName(vasKey);

      if (isFieldType) {
        const {fieldListResult, noError} = await this.runFieldType({ vasKey, formName, formData }, getState);
        formResult = formResult && noError;
        result = fieldListResult;
      } else {
        const field = vasKey;
        const value = formData[field];
        result = await this.run({ field, value, formName }, getState);
        formResult = formResult && (result ? result.validateStatus !== 'error' : true);
      }

      fieldResult[vasKey] = result;
    }

    return {
      formResult,
      fieldResult,
    };
  }
  async run(payload, getState) {
    const { field, vasKey } = payload;

    const fieldValidate = this.getValidatorsByField(vasKey || field);
    if (!fieldValidate) {
      return null;
    }

    return fieldValidate.run(payload, getState);
  }
}


Validator.create = (validatorConfig, namespace) => {
  const map = {};
  const validatorMap = {};
  validatorConfig.forEach((item) => {
    const { formName, validators } = item;

    let fvList = map[formName] || [];
    if (validators) {
      fvList = fvList.concat(validators);
    } else {
      fvList = fvList.concat(item);
    }
    map[formName] = fvList;
  });

  for (const formName in map) {
    // 初始化
    validatorMap[formName] = new Validator(map[formName], namespace, formName);
  }

  return validatorMap;
};


export default Validator;
