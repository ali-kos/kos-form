import $ from "lodash";
import { getValidateHelp } from "./validator-help";

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
  /**
   * 解析stringRule
   * @param {String} rule 规则，如：maxLength:2@最大长度不能超过{0};minLength min:1;rangeLength:1,2
   */
  stringParser(rule) {
    if (!rule) {
      return [];
    }
    rule = rule.split(";");
    const list = [];

    rule.forEach(item => {
      const [express, help] = item.split("@");
      const [name, data] = express.split(":");
      const v = {
        ...getRule(name)
      };

      // 转换成数组
      if (data) {
        v.data = data.split(",");
      }
      if (help) {
        v.help = help;
      }

      list.push(v);
    });

    return list;
  },
  functionParser(validator) {
    return {
      name: "fn",
      fn: validator
    };
  },
  regexpParser(validator) {
    return {
      ...getRule("regexp"),
      data: validator
    };
  },
  objectParser(validator) {
    const { name, help, fn } = validator;

    if (name) {
      return {
        ...getRule(name),
        ...validator
      };
    }

    return {
      name: "custome",
      ...validator
    };
  }
};

/**
 * 解析校验规则
 * @param {String|Function|RegExp|Object} rule 校验规则
 * @param {String|Object} custHelp 自定义文案
 */
export const parseRule = (rule, custHelp) => {
  let v = null;
  if ($.isString(rule)) {
    v = RuleParseUtil.stringParser(rule);
  } else if ($.isFunction(rule)) {
    v = RuleParseUtil.functionParser(rule);
  } else if ($.isRegExp(rule)) {
    v = RuleParseUtil.regexpParser(rule);
  } else if ($.isObject(rule)) {
    v = RuleParseUtil.objectParser(rule);
  }

  if (v && custHelp !== undefined) {
    v.help = custHelp;
  }

  return v;
};

/**
 * 解析校验规则，可以一次解析多个
 * @param {Object} validatorItem
 * @example
 * {
 *  field:'',
 *  rules:['required',(value)=>{return value>10},/d+/g]
 * }
 */
export const parseValidatorRules = validatorItem => {
  const { field, help } = validatorItem;
  let list = [];
  const rules = [].concat(validatorItem.rules);

  rules.forEach(ruleItem => {
    list = list.concat(parseRule(ruleItem, help));
  });

  return list;
};

const validatorsMap = {};

/**
 *
 * @param {String} name rule名称
 * @param {Function} fn 校验函数
 * @param {String|Object} help 帮助信息
 */
export const addRule = (name, fn, help) => {
  validatorsMap[name] = {
    name,
    fn,
    help
  };
};

/**
 * 根据名称移除rule规则
 * @param {String} name rule名称
 */
export const removeRule = name => {
  delete validatorsMap[name];
};

/**
 * 根据名称获取rule规则
 * @param {String} name rule名称
 */
export const getRule = name => validatorsMap[name];

/**
 *
 * @param {Object} validator 校验器
 * @param {Object} payload 参数
 * @param {Object} state 当前namespace下的Model
 */
export const runRule = async (validator, payload, getState) => {
  const { fn, help, data } = validator;
  const { field, value, formName } = payload;

  const result = await fn(getState, { value, field, formName }, data);

  let validateStatus = "success";
  let runnerHelp = "";
  if ($.isBoolean(result)) {
    validateStatus = result ? "success" : "error";
  } else if ($.isString(result)) {
    // 返回的是错误消息
    runnerHelp = result;
    if (result) {
      validateStatus = result ? "error" : "success";
    }
  } else if ($.isObject(result)) {
    return result;
  }

  const fieldResult = {
    validateStatus,
    hasFeedback: true,
    help: runnerHelp || getValidateHelp(help, validateStatus, data)
  };

  return fieldResult;
};
