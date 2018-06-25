import { XFORM_VALIDATE_DATA, XFORM_DISPLAY_DATA } from './const';


/**
 * 创建校验信息更新的payloads
 * @param {Obeject} payload 触发的action
 * @param {Object} state State
 * @param {Object} resultMap {
 *  name:{
 *    help:'校验失败',
 *    status:'error',
 *    hasFeedback:true
 *  }
 * }结果
 */
export const createValidatePayload = (payload, getState, resultMap) => {
  const { formName } = payload;
  const newPayload = {};
  const state = getState();

  const stateValidateData = {
    ...state[XFORM_VALIDATE_DATA],
  };
  const formValidateData = {
    ...stateValidateData[formName],
    ...resultMap,
  };

  stateValidateData[formName] = formValidateData;
  newPayload[XFORM_VALIDATE_DATA] = stateValidateData;
  return newPayload;
};

/**
 * 根据表单名称和字段名称获取校验信息
 * @param {Object} state State,store.getState()[namespace]获取的值
 * @param {String} formName 表单名称
 * @param {String} field 字段名称
 */
export const getFieldValidateData = (state, formName, field) => {
  const formValidateData = getFormValidateData(state, formName);
  return formValidateData[field];
}

/**
 * 根据表单名称获取校验信息
 * @param {Object} state State,store.getState()[namespace]获取的值
 * @param {String} formName 表单名称
 * @param {String} field 字段名称
 */
export const getFormValidateData = (state, formName) => {
  const formValidateData = state[XFORM_VALIDATE_DATA] || {};
  return formValidateData[formName] || {};
}

/**
 * 创建值更新的payload
 * @param {Object} payload 触发的action
 * @param {Object} state State
 */
export const createFieldValuePayload = (payload, getState) => {
  const { field, value, formName } = payload;
  const newPayload = {};
  const state = getState();

  if (formName) {
    newPayload[formName] = {
      ...state[formName],
    };

    newPayload[formName][field] = value;
  } else {
    newPayload[field] = value;
  }
  return newPayload;
};


/**
 * 创建校验信息更新的payloads
 * @param {Obeject} payload 触发的action
 * @param {Object} state State
 * @param {Object} result {a:true,b:false}结果
 */
export const createDisplayPayload = (payload, getState, result) => {
  const { formName } = payload;
  const newPayload = {};
  const state = getState();

  const stateDisplayData = {
    ...state[XFORM_DISPLAY_DATA],
  };
  const formDisplayData = {
    ...stateDisplayData[formName],
    ...result,
  };

  stateDisplayData[formName] = formDisplayData;
  newPayload[XFORM_DISPLAY_DATA] = stateDisplayData;
  return newPayload;
};

/**
 * 根据表单名称和字段名称获取展示信息
 * @param {Object} state State,store.getState()[namespace]获取的值
 * @param {String} formName 表单名称
 * @param {String} field 字段名称
 */
export const getFieldDisplayData = (state, formName, field) => {
  let formValidateData = state[XFORM_DISPLAY_DATA] || {};
  formValidateData = formValidateData[formName] || {};

  return formValidateData[field];
}
