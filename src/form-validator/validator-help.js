import $ from 'lodash';

const formatStr = (str, data) => {
  data = [].concat(data);
  return str.replace(/\{(\d+)\}/g, function (m, i) {
    return data[i];
  });
};
export const getValidateHelp = (help, status, data) => {
  let h = '';
  if ($.isString(help)) {
    h = status === 'success' ? '' : help;
  } else {
    h = help && help[status];

  }

  return formatStr(h, data);
};
