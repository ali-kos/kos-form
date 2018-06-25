import { parseValidatorRules, runRule } from './validator-rule';

/**
 *
 * @param {Object} validator 校验器
 * @param {Object} payload 参数
 * @param {Object} state 当前namespace下的Model
 */
// const runValidator = async (validator, payload, getState) => {
//   const {
//     fn, help, data,
//   } = validator;
//   const { field, value, formName } = payload;

//   const result = await fn(getState, { value, field, formName }, data);

//   let validateStatus = 'success';
//   let runnerHelp = '';
//   if ($.isBoolean(result)) {
//     validateStatus = result ? 'success' : 'error';
//   } else if ($.isString(result)) { // 返回的是错误消息
//     runnerHelp = result;
//     if (result) {
//       validateStatus = result ? 'error' : 'success';
//     }
//   } else if ($.isObject(result)) {
//     return result;
//   }

//   const fieldResult = {
//     validateStatus,
//     hasFeedback: true,
//     help: runnerHelp || getValidateHelp(help, validateStatus, data),
//   };

//   return fieldResult;
// };

class FieldValidator {
  constructor(field, validators) {
    this.field = field;
    this.validators = validators;
    this.disabled = false;

    this.list = this.initValidator(validators);
  }
  initValidator(validators) {
    let list = [];
    validators.forEach((item) => {
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
  async run(payload, getState) {
    let validateResult = null;

    if (this.disabled) {
      return null;
    }

    const { list } = this;
    for (let i = 0, len = list.length; i < len; i++) {
      const validator = list[i];

      if (validator && validator.fn) {
        const result = await runRule(validator, payload, getState);

        // 遇到错误，立刻退出
        if (result.validateStatus === 'error') {
          validateResult = result;
          break;
        }
      }
    }

    return validateResult;
  }
}

FieldValidator.factory = (validators) => {
  const vas = {};

  validators.forEach((validatorItem) => {
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
