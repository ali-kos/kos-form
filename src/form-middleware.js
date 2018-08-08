import KOS from 'kos-core';

import { XFORM_FIELD_CHANGE, XFORM_VALIDATE, XFORM_TYPE_MAP } from './const';
import { createFieldValuePayload, createTypeMapPayload } from './data-util';
import FormValidator from './form-validator/index';
import FieldDiaplay from './field-display/index';


const { fieldDisplayMiddleware } = FieldDiaplay;
const { fieldValidateMiddleware, formValidateMiddleware } = FormValidator;
const KOSUtil = KOS.Util;


const fieldChangeHandlers = [];
const FormMiddleware = store => next => async (action) => {
  const { namespace, type } = KOSUtil.getActionType(action.type);
  const getState = () => store.getState()[namespace];
  const dispatch = (action) => {
    const { type } = action;
    store.dispatch({
      ...action,
      type: `${namespace}/${type}`,
    });
  };

  await next(action);

  switch (type) {
    case XFORM_FIELD_CHANGE:
      // 更新值
      dispatch({
        type: 'setState',
        payload: createFieldValuePayload(action.payload, getState),
      });

      fieldChangeHandlers.forEach((handler) => {
        handler(dispatch, getState, action);
      });
      break;
    case XFORM_VALIDATE:
      await formValidateMiddleware(dispatch, getState, action);
      break;
    case XFORM_TYPE_MAP:
      dispatch({
        type: 'setState',
        payload: createTypeMapPayload(action.payload, getState),
      })
      break;
  }
};


FormMiddleware.addFieldChangeHandler = (handler) => {
  handler && fieldChangeHandlers.push(handler);
};


// 添加
FormMiddleware.addFieldChangeHandler(fieldDisplayMiddleware);
FormMiddleware.addFieldChangeHandler(fieldValidateMiddleware);

export default FormMiddleware;
