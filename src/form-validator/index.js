import Validator from "./validator";
import * as ValidatorRule from "./validator-rule";
import * as ValidatorMiddleware from "./middleware";

const { addRule } = ValidatorRule;

addRule(
  "required",
  (dispatch, getState, { value, field, data }) => {
    return !!value;
  },
  "不能为空！"
);

addRule(
  "maxLength",
  (dispatch, getState, { value, field, maxLength: data }) => {
    if (value) {
      return value.length <= maxLength;
    }
    return true;
  }
);

addRule(
  "minLength",
  (dispatch, getState, { value, field, minLength: data }) => {
    if (value) {
      return value.length >= minLength;
    }
    return true;
  }
);

addRule("regexp", (dispatch, getState, { value, field, regExp: data }) => {
  return regExp.test(value);
});

addRule(
  "email",
  (dispatch, getState, { value, field, data }) => {
    return /[a-z0-9-]{1,30}@[a-z0-9-]{1,65}.[a-z]{3}/.test(value);
  },
  "请输入正确的email地址"
);

export default {
  /**
   * 校验器类
   */
  Validator,
  ...ValidatorMiddleware,
  ...ValidatorRule
};
