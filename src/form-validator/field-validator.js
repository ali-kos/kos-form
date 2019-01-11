import { parseValidatorRules, runRule } from "./validator-rule";
import { getFieldDisplayData } from "../data-util";

class FieldValidator {
  constructor(field, rules) {
    this.field = field;
    this.disabled = false;
    this.initRules(rules);
  }
  initRules(rules) {
    let list = [];
    rules.forEach(item => {
      list = list.concat(item);
    });
    this.rules = list;
  }
  setDisable(disable = true) {
    this.disabled = true;
  }
  setRuleDisable(disabled, name) {
    const isNumber = typeof name === "number";

    this.rules.forEach((rule, index) => {
      if (isNumber && index === name) {
        rule.disabled = disabled;
      } else if (rule.name === name) {
        rule.disabled = disabled;
      }
    });
  }
  async run(dispatch, getState, payload) {
    let validateResult = null;
    const { rules } = this;
    for (let i = 0, len = rules.length; i < len; i++) {
      const rule = rules[i];

      if (rule && rule.fn && !rule.disabled) {
        const result = await runRule(dispatch, getState, payload, rule);

        // 遇到错误，立刻退出
        if (result && result.validateStatus === "error") {
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

  validators.forEach(fieldValidator => {
    const { field } = fieldValidator;
    const rules = parseValidatorRules(fieldValidator);

    vas[field] = vas[field] || [];
    vas[field] = vas[field].concat(rules);
  });

  // 转换成对象进行管理
  for (const field in vas) {
    const rules = vas[field];
    if (field && rules) {
      vas[field] = new FieldValidator(field, rules);
    }
  }

  return vas;
};

export default FieldValidator;
