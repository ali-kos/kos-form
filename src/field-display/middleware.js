import KOS from 'kos-core';
import { createDisplayPayload } from '../data-util';

const KOSUtil = KOS.Util;
/**
 * 
 * @param {Function} dispatch dispatch方法，包装了namesapce的
 * @param {Function} getState 获取当前namespace下的getState方法
 * @param {Object} action 包含type、payload的对象实体
 */
export const fieldDisplayMiddleware = async (dispatch, getState, action) => {
  const { namespace, type } = KOSUtil.getActionType(action.type);
  const model = KOS.getModel(namespace);
  const { payload } = action;
  const { formName, field } = payload;

  let formController = model.getAttr('formFieldDisplay') || {};
  if (formName) {
    formController = formController[formName] || {}
  }

  let fieldDisplay = formController[field];

  if (fieldDisplay) {
    const result = await fieldDisplay(getState, payload);

    // 触发表单校验结果更新
    result && dispatch({
      type: 'setState',
      payload: createDisplayPayload(payload, getState, result),
    });

    return result;
  }
}
