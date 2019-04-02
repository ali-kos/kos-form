import FieldValidator from "./field-validator";
import FormValidator from "./form-validator";

/**
 * 工厂函数
 * @param validatorConfig，例如
 * 
 * [{
    formName: 'addForm',
    validators: [{
      field: 'page_type',
      rules: 'required'
    }, {
      field: 'page_desc',
      rules: ['required', (getState, { field, value }, data) => {
        return value && value.length <= 3;
      }],
      help: '请正确填写'
    }, {
      field: 'page_name',
      rules: ['required@好好填', {
        name: 'maxLength',
        data: 4,
        help: 'maxLength:{0}'
      }]
    }, {
      field: 'page_name',
      help: '异步校验失败',
      rules: {
        data: { a: 1 },
        fn: async (getState, { field, value }, data) => {
          const xdata = await fetch({
            url: '/app/list',
            data: {
            }
          });

          return true
        }
      }
    }]
  }]
 */

class Validator {
  constructor(validators = []) {
    this.validators = validators;
    this.formValidator = {};
    this.init();
  }
  init() {
    const map = {};
    const { validators, formValidator } = this;

    // 第一层遍历formName，同一个formName可以写多个{formName,validators}的配置
    validators.forEach(item => {
      // 兼容只有一个表单，不写表单名的情况，使用时强烈推荐定义表单名
      const { formName, validators = item } = item;
      map[formName] = map[formName] || [];
      map[formName] = map[formName].concat(validators);
    });

    // 根据formName的情况，进行校验规则的实例化
    for (const formName in map) {
      const validators = map[formName];
      // 初始化
      formValidator[formName] = new FormValidator(validators, formName);
    }
  }
  /**
   * 获取表单校验实例
   * @param {String} formName 表单名称
   */
  getFormValidator(formName) {
    return this.formValidator[formName];
  }
}

Validator.create = validators => {
  return new Validator(validators);
};

export default Validator;
