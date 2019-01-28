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
  (dispatch, getState, { value, field, data: maxLength }) => {
    if (value) {
      return value.length <= maxLength;
    }
    return true;
  }
);

addRule(
  "minLength",
  (dispatch, getState, { value, field, data: minLength }) => {
    if (value) {
      return value.length >= minLength;
    }
    return true;
  }
);
addRule(
  "rangeLength",
  (dispatch, getState, { value, field, data: rangeLength }) => {
    const [minLength, maxLength] = rangeLength;
    if (value) {
      const len = value.length;
      return minLength <= len && len <= maxLength;
    }
    return true;
  }
);

addRule("min", (dispatch, getState, { value, field, data: min }) => {
  return value >= min;
});
addRule("max", (dispatch, getState, { value, field, data: max }) => {
  return value <= max;
});
addRule("range", (dispatch, getState, { value, field, data: range }) => {
  const [min, max] = range;
  return !value || (min <= value && value <= max);
});

addRule("regexp", (dispatch, getState, { value, field, data: regExp }) => {
  return !value || regExp.test(value);
});

addRule("chinese", (dispatch, getState, { value, field }) => {
  return /^[\u4e00-\u9fa5]*$/.test(value);
});

addRule(
  "email",
  (dispatch, getState, { value, field, data }) => {
    return !value || /[a-z0-9-]{1,30}@[a-z0-9-]{1,65}.[a-z]{3}/.test(value);
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
