import KOS from 'kos-core';
import $ from 'lodash';

import { XFORM_FIELD_CHANGE, XFORM_VALIDATE } from './const';
import { createFieldValuePayload } from './data-util';
import FormValidator from './form-validator/index';
import FieldDiaplay from './field-display/index';


const { fieldDisplayMiddleware } = FieldDiaplay;
const { fieldValidateMiddleware, formValidateMiddleware } = FormValidator;


const fieldChangeHandlers = [];
const FormMiddleware = store => next => async (action) => {
  const { namespace, type } = KOS.splitActionType(action.type);
  const getState = () => store.getState()[namespace];
  const dispatch = (action) => {
    const { type } = action;
    store.dispatch({
      ...action,
      type: `${namespace}/${type}`
    });
  };

  await next(action);

  // 表单change
  if (type === XFORM_FIELD_CHANGE) {
    // 更新值
    dispatch({
      type: `setState`,
      payload: createFieldValuePayload(action.payload, getState),
    });

    // const displayResult = fieldDisplayMiddleware(dispatch, getState, action);

    // 返回了结果，处理校验器是否可用
    // if (displayResult && $.isObject(displayResult)) {

    // }
    fieldChangeHandlers.forEach(handler => {
      handler(dispatch, getState, action);
    });

    // 表单校验
    // formFieldChangeMiddleware(dispatch, getState, action);
  } else if (type === XFORM_VALIDATE) { // 执行全量表单校验
    formValidateMiddleware(dispatch, getState, action);
  }
};


FormMiddleware.addFieldChangeHandler = (handler) => {
  handler && fieldChangeHandlers.push(handler);
};


// 添加
FormMiddleware.addFieldChangeHandler(fieldDisplayMiddleware);
FormMiddleware.addFieldChangeHandler(fieldValidateMiddleware);

export default FormMiddleware;
