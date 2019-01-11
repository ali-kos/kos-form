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
 *
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
    result = await validatorIns.run(
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
 *
 * @param {Function} dispatch dispatch方法，包装了namesapce的
 * @param {Function} getState 获取当前namespace下的getState方法
 * @param {Object} action 包含type、payload的对象实体
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
    const result = await validatorIns.runAll(
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

export const fieldValidatorDisableMiddleware = (dispatch, getState, action) => {
  const { namespace, type } = KOSUtil.getActionType(action.type);
  const { formName, field, fieldType, disable } = action.payload;
  const model = KOS.getModel(namespace);

  const validatorIns = getFormValidator(model, formName);
  if (validatorIns) {
    const formValidatorIns = validatorIns.getFormValidator(formName);
    if (field) {
      formValidatorIns.disableValidatorByField(field, disable);
    } else if (fieldType) {
      formValidatorIns.disableValidatorByFieldType(field, disable);
    }
  }
};

export const fieldValidatorRuleDisableMiddleware = (
  dispatch,
  getState,
  action
) => {
  const { namespace, type } = KOSUtil.getActionType(action.type);
  const { formName, field, fieldType, rule, disable } = action.payload;

  const validatorIns = getFormValidator(model, formName);
  if (validatorIns) {
    const formValidatorIns = validatorIns.getFormValidator(formName);
    if (field) {
      formValidatorIns.disableValidatorByField(field, disable);
    } else if (fieldType) {
      formValidatorIns.disableValidatorByFieldType(field, disable);
    }
  }
};
