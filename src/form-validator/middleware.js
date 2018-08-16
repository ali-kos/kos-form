import KOS from "kos-core";
import Validator from "./validator";

import { createValidatePayload } from "../data-util";

const KOSUtil = KOS.Util;

/**
 * 获取Model的validatorIns
 * @param {Object} model model
 * @param {String} formName 表单名
 */
const getModelValidatorIns = (model, formName) => {
  let { validatorMap } = model;
  const namespace = model.getNamespace();

  // 此处有性能优化的空间，如果一个Model下存在多个formName的时候
  if (!validatorMap) {
    const validatorConfig = model.getAttr("validators");
    model.validatorMap = validatorMap = validatorConfig
      ? Validator.create(validatorConfig, namespace)
      : {};
  }

  return validatorMap[formName];
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

  // 有表单校验相关配置
  const validatorIns = getModelValidatorIns(model, formName);
  if (validatorIns) {
    const result = await validatorIns.run(payload, getState);
    const fieldResult = {};
    fieldResult[field] = result;

    // 触发表单校验结果更新
    dispatch({
      type: "setState",
      payload: createValidatePayload(payload, getState, fieldResult)
    });

    return fieldResult;
  }
};

/**
 *
 * @param {Function} dispatch dispatch方法，包装了namesapce的
 * @param {Function} getState 获取当前namespace下的getState方法
 * @param {Object} action 包含type、payload的对象实体
 */
export const formValidateMiddleware = async (dispatch, getState, action) => {
  const { namespace, type } = KOSUtil.getActionType(action.type);
  const model = KOS.getModel(namespace);
  const { payload } = action;
  const { formName, field } = payload;

  const validatorIns = getModelValidatorIns(model, formName);
  let formResult = true;
  if (validatorIns) {
    const result = await validatorIns.runAll(payload, getState);
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
};
