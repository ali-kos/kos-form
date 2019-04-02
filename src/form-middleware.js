import KOS from "kos-core";

import {
  XFORM_FIELD_CHANGE,
  XFORM_VALIDATE,
  XFORM_FIELD_VALIDATE,
  XFORM_FIELD_VALIDATOR_DISABLE,
  XFORM_FIELD_VALIDATOR_RULE_DISABLE,
  XFORM_CLEAR_VALIDATE,
  XFORM_CLEAR_FIELD_VALIDATE
} from "./const";
import { createFieldValuePayload } from "./data-util";
import FormValidator from "./form-validator/index";
import FieldDiaplay from "./field-display/index";

const { fieldDisplayMiddleware } = FieldDiaplay;
const {
  fieldValidateMiddleware,
  formValidateMiddleware,
  disableFieldValidatorMiddleware,
  disableFieldValidatorRuleMiddleware,
  clearFieldValidateMiddleware,
  clearFormValidateMiddleware
} = FormValidator;
const KOSUtil = KOS.Util;

// const fieldChangeHandlers = [];
// let fieldValidateSeed = null;
const FormMiddleware = store => next => async action => {
  const { namespace, type } = KOSUtil.getActionType(action.type);
  const getState = () => store.getState()[namespace];
  const dispatch = action => {
    const { type } = action;
    store.dispatch({
      ...action,
      type: `${namespace}/${type}`
    });
  };

  await next(action);

  switch (type) {
    case XFORM_FIELD_CHANGE: // 字段值变更
      // 更新值
      dispatch({
        type: "setState",
        payload: createFieldValuePayload(action.payload, getState)
      });
      break;
    case XFORM_FIELD_VALIDATE: // 字段校验
      fieldValidateMiddleware(dispatch, getState, action);
      break;
    case XFORM_VALIDATE: // 表单校验
      await formValidateMiddleware(dispatch, getState, action);
      break;
    case XFORM_FIELD_VALIDATOR_DISABLE: // 禁用字段所有的校验规则
      disableFieldValidatorMiddleware(dispatch, getState, action);
      break;
    case XFORM_FIELD_VALIDATOR_RULE_DISABLE: // 禁用字段指定的校验规则
      disableFieldValidatorRuleMiddleware(dispatch, getState, action);
      break;
    case XFORM_CLEAR_VALIDATE: // 清除表单的校验状态
      clearFormValidateMiddleware(dispatch, getState, action);
      break;
    case XFORM_CLEAR_FIELD_VALIDATE: // 清除表单指定字段的校验状态
      clearFieldValidateMiddleware(dispatch, getState, action);
      break;
  }
};

export default FormMiddleware;
