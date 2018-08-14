import { parseValidatorRules, runRule } from "./validator-rule";
import { getFieldDisplayData } from "../data-util";

class FieldValidator {
  constructor(field, validators) {
    this.field = field;
    this.validators = validators;
    this.disabled = false;

    this.list = this.initValidator(validators);
  }
  initValidator(validators) {
    let list = [];
    validators.forEach(item => {
      list = list.concat(item);
    });
    return list;
  }
  setDisable() {
    this.disabled = true;
  }
  setEnable() {
    this.disabled = false;
  }
  isDisable(state, formName, field) {
    return getFieldDisplayData(state, formName, field);
  }
  async run(payload, getState) {
    // TODO：如果表单为隐藏的，则不执行校验器，这部分逻辑有耦合
    const { formName, field } = payload;
    const state = getState();
    const disable = this.isDisable(state, formName, field);
    if (disable === false) {
      return validateResult;
    }

    let validateResult = null;
    const { list } = this;
    for (let i = 0, len = list.length; i < len; i++) {
      const validator = list[i];

      if (validator && validator.fn) {
        const result = await runRule(validator, payload, getState);

        // 遇到错误，立刻退出
        if (result.validateStatus === "error") {
          validateResult = result;
          break;
        }
      }
    }

    return validateResult;
  }
}

FieldValidator.factory = validators => {
  const vas = {};

  validators.forEach(validatorItem => {
    const { field } = validatorItem;
    const list = parseValidatorRules(validatorItem);

    vas[field] = vas[field] || [];
    vas[field] = vas[field].concat(list);
  });

  // 转换成对象进行管理
  for (const field in vas) {
    if (field) {
      vas[field] = new FieldValidator(field, vas[field]);
    }
  }

  return vas;
};

export default FieldValidator;
