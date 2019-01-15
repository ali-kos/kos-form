import KOS from "kos-core";
import Validator from "./validator";

import { createValidatePayload } from "../data-util";

const KOSUtil = KOS.Util;

/**
 * 获取Model的validatorIns
 * @param {Object} model model
 * @param {String} formName 表单名
 */
const getFormValidator = (model, formName) => {
  let { validatorIns } = model;

  if (!validatorIns) {
    validatorIns = Validator.create(model.getAttr("validators"));
    model.validatorIns = validatorIns;
  }

  return validatorIns.getFormValidator(formName);
};

const dispatchFieldValidate = (dispatch, getState) => (payload, result) => {
  const { field } = payload;
  if (result !== undefined && result !== null) {
    result.hasFeedback =
      result.hasFeedback === undefined ? true : result.hasFeedback;
    dispatch({
      type: "setState",
      payload: createValidatePayload(payload, getState, {
        [field]: result
      })
    });
  }
};

const updateFieldValidateStatus = dispatch => payload => (
  validateStatus,
  help = "",
  hasFeedback = true
) => {
  if (typeof validateStatus === "object") {
    dispatch(payload, {
      hasFeedback,
      help,
      ...validateStatus
    });
  } else {
    dispatch(payload, {
      validateStatus,
      help,
      hasFeedback
    });
  }
};

/**
 * 字段校验中间件
 * @param {Function} dispatch dispatch方法，包装了namesapce的
 * @param {Function} getState 获取当前namespace下的getState方法
 * @param {Object} action 包含type、payload的对象实体
 */
export const fieldValidateMiddleware = async (dispatch, getState, action) => {
  const { namespace, type } = KOSUtil.getActionType(action.type);
  const model = KOS.getModel(namespace);
  const { payload } = action;
  const { formName, field } = payload;

  let result = null;

  // 有表单校验相关配置
  const validatorIns = getFormValidator(model, formName);
  const fieldValidateStatusDispatch = dispatchFieldValidate(dispatch, getState);
  // console.log("run field validate", action);

  if (validatorIns) {
    result = await validatorIns.validateField(
      updateFieldValidateStatus(fieldValidateStatusDispatch)(payload), // 返回一个只能执行更新字段校验信息的dispatch方法
      getState,
      payload
    );

    fieldValidateStatusDispatch(payload, result);
  }
  // 校验后进行回调
  const { callback } = payload;
  callback && callback(result);

  // return result;
};

/**
 * 表单校验中间件
 * @param {Function} dispatch dispatch方法，包装了namesapce的
 * @param {Function} getState 获取当前namespace下的getState方法
 * @param {Object} action 包含type、payload的对象实体，payload的
 */
export const formValidateMiddleware = async (dispatch, getState, action) => {
  const { namespace } = KOSUtil.getActionType(action.type);
  const model = KOS.getModel(namespace);
  const { payload } = action;
  const { formName } = payload;

  const validatorIns = getFormValidator(model, formName);
  let formResult = true;

  if (validatorIns) {
    const fieldValidateStatusDispatch = dispatchFieldValidate(
      dispatch,
      getState
    );
    const result = await validatorIns.validate(
      updateFieldValidateStatus(fieldValidateStatusDispatch),
      getState,
      payload
    );
    formResult = result.formResult;

    // 触发表单校验结果更新
    dispatch({
      type: "setState",
      payload: createValidatePayload(payload, getState, result.fieldResult)
    });
  }

  // 校验后进行回调
  const { callback } = payload;
  callback && callback(formResult);

  return formResult;
};

/**
 * 禁止字段所有校验规则的中间件
 * @param {Function} dispatch dispatch方法，包装了namesapce的
 * @param {Function} getState 获取当前namespace下的getState方法
 * @param {Object} action action.payload格式如：{ formName, field, disable }
 */
export const disableFieldValidatorMiddleware = (dispatch, getState, action) => {
  const { namespace, type } = KOSUtil.getActionType(action.type);
  const { formName, field, disabled } = action.payload;
  const model = KOS.getModel(namespace);

  const formValidatorIns = getFormValidator(model, formName);
  if (formValidatorIns && field) {
    formValidatorIns.disableFieldValidator(field, disabled);
  }
};

/**
 * 禁止字段指定校验规则的中间件
 * @param {Function} dispatch dispatch方法，包装了namesapce的
 * @param {Function} getState 获取当前namespace下的getState方法
 * @param {Object} action action.payload格式如：{ formName, field, rule, disable }
 */
export const disableFieldValidatorRuleMiddleware = (
  dispatch,
  getState,
  action
) => {
  const { namespace, type } = KOSUtil.getActionType(action.type);
  const { formName, field, rule, disabled } = action.payload;
  const model = KOS.getModel(namespace);

  const formValidatorIns = getFormValidator(model, formName);
  if (formValidatorIns && field && rule) {
    formValidatorIns.disableFieldValidatorRule(field, rule, disabled);
  }
};

export const clearFormValidateMiddleware = (dispatch, getState, action) => {
  const { namespace, type } = KOSUtil.getActionType(action.type);
  const { payload } = action;
  const { formName, fieldList, vFieldMap } = payload;

  const fieldValidateStatusDispatch = dispatchFieldValidate(dispatch, getState);
  const result = {
    validateStatus: "success",
    hasFeedback: false
  };

  for (const field of fieldList) {
    fieldValidateStatusDispatch({ formName, field }, result);
  }
};

export const clearFieldValidateMiddleware = (dispatch, getState, action) => {
  const { payload } = action;
  const { formName, field } = payload;

  const fieldValidateStatusDispatch = dispatchFieldValidate(dispatch, getState);
  fieldValidateStatusDispatch(payload, {
    validateStatus: "success",
    hasFeedback: false
  });
};
