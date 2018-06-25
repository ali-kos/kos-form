import $ from 'lodash';
import { getValidateHelp } from './validator-help';

/**
 * 支持的校验配置规则：
[{
  field:'name',
  rules:['required']
},{
  field:'name',
  rules:['maxLength:10']
},{
  field:'email',
  rules:['email']
},{
  field:'age',
  rules:[/d+/],
  help:'必须是数字'
},{
  field:'regpassword',
  data:[1234],
  fn(state,{field,value,formName},data){
    return true;
  }
}]
 */

const RuleParseUtil = {
  stringParser(validator) {
    const [name, data] = validator.split(':');
    const v = {
      ...getRule(name)
    };

    // 转换成数组
    if (data) {
      v.data = data.split(',');
    }

    return v;
  },
  functionParser(validator) {
    return {
      name: 'fn',
      fn: validator
    };
  },
  regexpParser(validator) {
    return {
      ...getRule('regexp'),
      data: validator
    };
  },
  objectParser(validator) {
    const { name, help, fn } = validator;

    if (name) {
      return {
        ...getRule(name),
        ...validator
      }
    }

    return {
      name: 'custome',
      ...validator
    }
  }
}

export const parseRule = (validator, custHelp) => {
  let v = null;
  if ($.isString(validator)) {
    v = RuleParseUtil.stringParser(validator);
  } else if ($.isFunction(validator)) {
    v = RuleParseUtil.functionParser(validator);
  } else if ($.isRegExp(validator)) {
    v = RuleParseUtil.regexpParser(validator);
  } else if ($.isObject(validator)) {
    v = RuleParseUtil.objectParser(validator);
  }

  if (v && custHelp !== undefined) {
    v.help = custHelp;
  }

  return v;
};

export const parseValidatorRules = (validatorItem) => {
  const { field, help } = validatorItem;
  const list = [];
  const rules = [].concat(validatorItem.rules);

  rules.forEach(ruleItem => {
    ruleItem && list.push(parseRule(ruleItem, help));
  });

  return list;
};

const validatorsMap = {};
export const addRule = (name, fn, help) => {
  validatorsMap[name] = {
    name, fn, help,
  };
};

export const removeRule = (name) => {
  delete validatorsMap[name];
};

export const getRule = name => validatorsMap[name];

/**
 *
 * @param {Object} validator 校验器
 * @param {Object} payload 参数
 * @param {Object} state 当前namespace下的Model
 */
export const runRule = async (validator, payload, getState) => {
  const {
    fn, help, data,
  } = validator;
  const { field, value, formName } = payload;

  const result = await fn(getState, { value, field, formName }, data);

  let validateStatus = 'success';
  let runnerHelp = '';
  if ($.isBoolean(result)) {
    validateStatus = result ? 'success' : 'error';
  } else if ($.isString(result)) { // 返回的是错误消息
    runnerHelp = result;
    if (result) {
      validateStatus = result ? 'error' : 'success';
    }
  } else if ($.isObject(result)) {
    return result;
  }

  const fieldResult = {
    validateStatus,
    hasFeedback: true,
    help: runnerHelp || getValidateHelp(help, validateStatus, data),
  };

  return fieldResult;
};
