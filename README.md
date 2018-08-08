# kos-form

## 简介

kos-form提供基于kos的表单封装能力，主要提供：
* **表单配套控件** 
* **表单项展示控制能力**
* **表单校验**
三类能力


## 表单组件


### 使用示例




### Form


## Form

## FieldHoc


## 表单校验

本组件实现了一套表单校验规则，配合KOS和Model使用


### rules的配置情况

#### rule说明

**配置示例** 
```js
{
  name:'min',
  data:3,
  help:{
    success:'成功',
    error:'不能小于{0}',
    warring:'警告一下',
    validating:'校验中'
  },
  fn:(getState,{field,value,formName},data){
    // 执行校验

    return false;
  }
}
```

**概要说明**
|属性|数据类型|说明|
|:--:|:--:|:--:|
|name|string|校验器名称，校验器将根据此名称，去找到默认的校验器|
|data|any|校验器需要的额外参数，多个参数使用Array|
|fn|function|优先级最高的属性配置，配置了fn，校验器校验时将直接执行该函数，返回结果参看下面的说明|
|help|string\|object|string：为字符串时，表示错误的提示消息；<br/>object：为对象时，包含校验的4个状态，success,error,warring,validating，见上面的配置示例|

**补充说明** 

* **data:** 这个配置项用于传入校验器需要的参数，例如min，range这样的校验器，需要根据设定的值来执行，例如 `{name:'min',data:1}` ; `{name:'range',data:[1,2]}`；同时data的值会和help的配置表达式一起起作用
* **help：** 校验的信息反馈，可以为sting和对象
 + string：为字符串时，表示校验`错误` 的；
 + object：为对象时，展示校验过程中的多个状态；
  - success：校验成功时的反馈
  - warring：提示性反馈
  - validating：正在校验中的反馈
  - error：错误的反馈

所以配置 `{help:'不能小于{0}'}` 和 `{help:{error:'不能小于{0}'}}` 是等效的

> 注：目前validating配置无效

* **fn：** 
 + getState：function，无参数，返回当前form所在namespace下的state数据
 + payload：
  - field：字段名
  - value：当前值
  - 表单名
 + data：rule配置时配置的data



**单个string表达式**
```js
validators:[{
  formName:'addForm',
  validators:[{
    field:'page_name',
    rules:'required'
  }]
}]
```

**多个string表达式**
```js
validators:[{
  formName:'addForm',
  validators:[{
    field:'page_name',
    rules:'maxLength:2@最大长度不能超过{0};minLength min:1;rangeLength:1,2'
  }]
}]
```

**指定校验器名称**

**通过Field类型校验**

```jsx
  <Field field="a" fieldType="typeA"></Field>
  <Field field="b" fieldType="typeA"></Field>
```

```js
validators:[{
  formName:'addForm',
  validators:[{
    type:'typeA',
    rules:'required'
  }]
}]
```


