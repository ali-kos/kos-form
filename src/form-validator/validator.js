import FieldValidator from "./field-validator";

class Validator {
  constructor(validators = [], namespace, formName) {
    this.formName = formName;
    this.namespace = namespace;

    this.fieldValidateIns = FieldValidator.factory(validators);
  }
  getValidatorsByField(field, fieldType) {
    return (
      this.fieldValidateIns[field] || this.fieldValidateIns[fieldType] || null
    );
  }
  async runAll(payload, getState) {
    const { formName, fieldValidateIns } = this;
    const state = getState();
    const { fieldTypeMap, fieldList } = payload;
    let formData = formName ? state[formName] : state;
    formData = formData || {};

    const fieldResult = {};
    let formResult = true;

    for(const field of fieldList) {
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
    };

    return {
      formResult,
      fieldResult
    };
  }
  async run(payload, getState) {
    const { field, fieldType } = payload;
    const fieldValidate = this.getValidatorsByField(field, fieldType);

    if (!fieldValidate) {
      return null;
    }

    return fieldValidate.run(payload, getState);
  }
}

Validator.create = (validatorConfig, namespace) => {
  const map = {};
  const validatorMap = {};
  validatorConfig.forEach(item => {
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
