import KOS from "kos-core";

import {
  XFORM_FIELD_CHANGE,
  XFORM_VALIDATE,
  XFORM_FIELD_VALIDATE,
  XFORM_FIELD_VALIDATOR_DISABLE,
  XFORM_FIELD_VALIDATOR_RULE_DISABLE
} from "./const";
import { createFieldValuePayload } from "./data-util";
import FormValidator from "./form-validator/index";
import FieldDiaplay from "./field-display/index";

const { fieldDisplayMiddleware } = FieldDiaplay;
const { fieldValidateMiddleware, formValidateMiddleware } = FormValidator;
const KOSUtil = KOS.Util;

const fieldChangeHandlers = [];
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

      // fieldChangeHandlers.forEach(handler => {
      //   handler(dispatch, getState, action);
      // });
      // 触发校验
      // if (fieldValidateSeed) {
      //   clearTimeout(fieldValidateSeed);
      // }
      // 转移至form.js里执行
      // ((dispatch, payload) => {
      //   fieldValidateSeed = setTimeout(() => {
      //     console.log("run validate");
      //     dispatch({
      //       type: XFORM_FIELD_VALIDATE,
      //       payload: payload
      //     });
      //   }, 300);
      // })(dispatch, action.payload);

      break;
    case XFORM_FIELD_VALIDATE: // 字段校验
      const { field, formName, callback } = action.payload;
      const formData = getState()[formName] || {};

      fieldValidateMiddleware(dispatch, getState, {
        type: action.type,
        payload: {
          value: formData[field],
          ...action.payload
        }
      });

      break;
    case XFORM_VALIDATE: // 表单校验
      await formValidateMiddleware(dispatch, getState, action);
      break;
    case XFORM_FIELD_VALIDATOR_DISABLE:
      break;
    case XFORM_FIELD_VALIDATOR_RULE_DISABLE:
      break;
  }
};

// FormMiddleware.addFieldChangeHandler = handler => {
//   handler && fieldChangeHandlers.push(handler);
// };

// // 添加
// FormMiddleware.addFieldChangeHandler(fieldDisplayMiddleware);
// FormMiddleware.addFieldChangeHandler(fieldValidateMiddleware);

export default FormMiddleware;
