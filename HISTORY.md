# 版本日志

## v1.0.0

- 升级 kos-core 至 1.0.0 版本；
- 适配 model.validators 不配置的情况；
- 提供 Field 的 getOnChangeValue 的 props 提供，解决非标准的 onChange 返回情况

## v1.0.1

- 修复 input,testarea 等组件输入中文的 bug

## v1.0.2

- 修复 setData 方法错误

## v1.2.1

- 提供 form.validateField 能力
- 注入到 kos.wrapper 的 component 内 this.props.getForm(formName)能力

## v1.2.2

- 解决 kos-core 安装的依赖问题

## v1.2.3

- 修复 getOnChangeValue 经常性报错的问题

## v1.2.5

- 修复 getOnChangeValue 经常性报错的问题

## v1.2.5

- 修复 input 输入框在中间输入时，光标定位错误的 bug
- 格式化 validate-rule.js 的代码，添加备注
- field 组件进行了简单优化，并添加了一些钩子（以备后用）

## v2.0.0

本期为不兼容升级

- 调整了校验规则的的 fn 参数，改为：`(dispatch,getState,payload)=>{}`，其中 payload 包含`{value,field,fieldType,formName,data}`
- 支持校验方法体内，通过 `dispatch` 方法修改校验状态，实现异步状态的校验中的效果，详细使用方式见文档
- 调整了 `validate` 触发的时机，在 `Form.prototype.onFieldChange` 中去触发，解耦 `onChange` 事件
- 提供禁用字段校验规则的能力
- 提供禁用字段指定校验规则的能力

## v2.1.0

- `Form.prototype.validateField` 第一个参数调整为支持 String 和 Object
- 新增 email 校验规则

## v2.2.0

- 修复 minLength,maxLength,reg 校验规则的 bug；
- 新增 min,max,range,rangeLength 校验规则
- 新增中文校验规则


## v2.2.1

- 修复 rangeLengt的bug
- 修复 chinese的bug


## v2.2.2

- 修复 没有配置validators的bug


## v2.2.3

- 兼容部分自定义组件手动触发组件的onChange事件，且不带参数的情况，例如antd的InputNumber组件在onBlur的时候，会手动触发onChange


## v2.3.0

- Field组件提供valueProp属性，坚决Field兼容非value属性表示值的组件的问题，如Switch等组件


## v2.3.1

- 修复Textarea元素输入过程中光标定位问题



## v2.3.2

- 清理loadsh依赖


## v2.3.3

- 修复Util.isFunction判断的bug


## v2.4.0

- feat: 提供Field的required属性
- feat: 提供Field的validator属性
- chore: 部分逻辑重构

## v2.4.1

- bugfix: 解决dsl配置校验规则的bug
