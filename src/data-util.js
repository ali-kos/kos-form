import { XFORM_VALIDATE_DATA, XFORM_TYPE_MAP_DATA, XFORM_DISPLAY_DATA } from './const';


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
  const { formName, vasKey } = payload;
  const newPayload = {};
  const state = getState();

  const stateValidateData = {
    ...state[XFORM_VALIDATE_DATA],
  };

  let formValidateData;
  if (vasKey) {
    formValidateData = {
      ...stateValidateData[formName],
    };
    const fieldTypeValidateData = {
      ...formValidateData[vasKey],
      ...resultMap,
    }
    formValidateData[vasKey] = fieldTypeValidateData;
  } else {
    formValidateData = {
      ...stateValidateData[formName],
      ...resultMap,
    };
  }
  

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


// 创建type 和 field对应关系
export const createTypeMapPayload = (payload, getState) => {
  const { formName, field, typeName, destroy } = payload;
  const state = getState();
  const newPayload = {};

  const stateTypeMapData = {
    ...state[XFORM_TYPE_MAP_DATA],
  };

  const formTypeMapData = {
    ...stateTypeMapData[formName],
  }

  const typeChildren = [
    ...(formTypeMapData[typeName] || []),
  ];

  if (destroy) {
    const index = typeChildren.indexOf(field);
    typeChildren.splice(index, 1);
  } else {
    typeChildren.push(field);
  }

  formTypeMapData[typeName] = typeChildren;
  stateTypeMapData[formName] = formTypeMapData;
  newPayload[XFORM_TYPE_MAP_DATA] = stateTypeMapData;

  return newPayload;
}

// 获取fieldType下面所有field 用于form全部校验
export const getTypeChildrenData = (typeName, formName, getState) => {
  const state = getState();

  const stateTypeMapData = state[XFORM_TYPE_MAP_DATA] || {};
  const formTypeMapData = stateTypeMapData[formName] || {};
  const typeChildren = formTypeMapData[typeName] || [];

  return typeChildren;
}


export const getSymbolTypeName = typeName => {
  return `@@${typeName}`;
}

export const isSymbolTypeName = symbolTypeName => {
  return (/^@@/).test(symbolTypeName);
}

export const toTypeName = symbolTypeName => {
  return symbolTypeName.replace(/^@@/, '');
}