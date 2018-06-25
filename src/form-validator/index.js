import Validator from './validator';
import * as ValidatorRule from './validator-rule';
import { fieldValidateMiddleware, formValidateMiddleware } from './middleware';

const { addRule } = ValidatorRule;

addRule('required', (getState, { value, field }, required) => {
  return !!value;
}, '不能为空！');

addRule('maxLength', (getState, { value, field }, maxLength) => {
  if (value) {
    return value.length <= maxLength;
  }
  return true;
});

addRule('minLength', (getState, { value, field }, minLength) => {
  if (value) {
    return value.length >= minLength;
  }
  return true;
});


addRule('regexp', (getState, { value, field }, regExp) => {
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

  ...ValidatorRule,
};
