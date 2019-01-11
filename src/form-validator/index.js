import Validator from "./validator";
import * as ValidatorRule from "./validator-rule";
import { fieldValidateMiddleware, formValidateMiddleware } from "./middleware";

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

export default {
  /**
   * 校验器类
   */
  Validator,
  /**
   * 表单字段校验器中间件
   */
  fieldValidateMiddleware,
  /**
   * 表单校验器中间件
   */
  formValidateMiddleware,

  ...ValidatorRule
};
