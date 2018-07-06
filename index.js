import xForm from './src/xform/form';
import xField from './src/xform/field';
import FormMiddleware from './src/form-middleware';
import * as ValidatorRule from './src/form-validator/validator-rule';

export const Form = xForm;
export const formMiddleware = FormMiddleware;
export const FieldHOC = xField;
export const addRule = ValidatorRule.addRule;
export const removeRule = ValidatorRule.removeRule;

