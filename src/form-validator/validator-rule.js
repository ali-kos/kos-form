import $ from "../lib/util";
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
export const parseValidatorRules = fieldValidator => {
  if(!fieldValidator){
    return [];
  }
  
  const { field, help } = fieldValidator;
  let list = [];
  const rules = [].concat(fieldValidator.rules);

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
 * @param {Object} rule 校验器
 * @param {Object} payload 参数
 * @param {Object} state 当前namespace下的Model
 */
export const runRule = async (dispatch, getState, payload, rule) => {
  const { fn, data, disabled } = rule;
  let { help = "校验错误！" } = rule;
  if (disabled || !fn) {
    return null;
  }

  // const { field, value, vField, formName } = payload;
  /**
   * result有几种返回结果
   * 为undefined(包括fn无返回的情况)或者null，则表示校验规则执行失败，整体结果返回null
   * 为true或者false，则表示校验成功或者失败，对应的validateStatus位success或者error
   * 为字符串，当字符串为空是，表示校验通过，当字符串有内容时，表示校验失败，字符串作为错误提示信息
   * 为对象时，包括如下字段：validateStatus,help,hasFeedback
   */
  const result = await fn(dispatch, getState, {
    ...payload,
    data
  });

  // 无任何返回或者返回undefined，不做任何处理
  if (result === undefined || result === null) {
    return null;
  }

  let validateStatus = "success";
  if ($.isBoolean(result)) {
    validateStatus = result ? "success" : "error";
  } else if ($.isString(result)) {
    // 返回的是错误消息
    help = result;
    if (result) {
      validateStatus = result ? "error" : "success";
    }
  } else if ($.isObject(result)) {
    return result;
  }

  return {
    validateStatus,
    hasFeedback: true,
    help: getValidateHelp(help, validateStatus, data)
  };
};
