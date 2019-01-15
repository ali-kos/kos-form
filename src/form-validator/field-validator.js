import { parseValidatorRules, runRule } from "./validator-rule";

class FieldValidator {
  constructor(field, rules) {
    this.field = field;
    this.disabled = false;
    this.initRules(rules);
  }
  /**
   * 初始化Rule
   * @param {Array<Object>} rules rule列表
   */
  initRules(rules) {
    let list = [];
    rules.forEach(item => {
      list = list.concat(item);
    });
    this.rules = list;
  }
  /**
   * 禁用字段校验器
   * @param {Boolean} disable 是否禁用
   */
  setDisable(disabled = true) {
    this.disabled = disabled;
  }
  /**
   * 禁用校验规则
   * @param {String|Number} rule 校验规则名称或者序号，需要不推荐使用
   * @param {Boolean} disabled 是否禁用
   */
  setRuleDisable(rule, disabled = true) {
    const isNumber = typeof rule === "number";

    this.rules.forEach((ruleItem, index) => {
      if (isNumber && index === rule) {
        ruleItem.disabled = disabled;
      } else if (ruleItem.name === rule) {
        ruleItem.disabled = disabled;
      }
    });
  }
  /**
   * 执行校验规则，返回执行状态
   * @param {Function} dispatch 校验状态更新器
   * @param {String} getState 获取当前State的方法
   * @param {Object} payload 参数，包括：field,vField,formName,data,value等
   * @returns validateResult 校验结果：{validateStatus,hasFeedback,help}
   */
  async run(dispatch, getState, payload) {
    const { successFeedback = false, successHelp = "" } = payload;
    let validateResult = {
      hasFeedback: successFeedback,
      validateStatus: "success",
      help: successHelp
    };
    const { rules, disabled } = this;
    if (disabled) {
      return validateResult;
    }
    for (let i = 0, len = rules.length; i < len; i++) {
      const rule = rules[i];

      if (rule && rule.fn && !rule.disabled) {
        const result = await runRule(dispatch, getState, payload, rule);

        // 遇到错误，立刻退出
        if (result) {
          validateResult = result;
          if (result.validateStatus === "error") {
            break;
          }
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
