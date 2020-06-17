import { validate } from 'class-validator';
import { createMethodDecorator, ClassType } from 'type-graphql';
import { UserInputError } from 'apollo-server-express';
import { ValidationError } from '../interfaces';
import { ActionTypes } from '../enums';
import {
  isCreateValidated,
  isUpdateValidated,
  isRetrieveValidated,
} from '../validations';

// If errorObj is of type boolean, then needs to be true to pass.
// If errorObj is of type ValidationError. Then needs to be empty array to pass.
export function ValidateArgs<T extends object>(actionType: ActionTypes) {
  return createMethodDecorator(async ({ args, info }, next) => {
    let errorObj: ValidationError[] | boolean;
    switch (actionType) {
      case ActionTypes.CREATE:
        errorObj = await isCreateValidated(info.fieldName, args);
        break;
      case ActionTypes.UPDATE:
        errorObj = await isUpdateValidated(info.fieldName, args);
        break;
      case ActionTypes.RETRIEVE:
        errorObj = await isRetrieveValidated(info.fieldName, args);
        break;
      default:
        errorObj = true;
        break;
    }

    if (typeof errorObj === 'boolean' && !errorObj)
      throw new UserInputError('Error validating user input');

    if (Array.isArray(errorObj) && !!errorObj?.length)
      throw new UserInputError('Invalid arguments', errorObj);

    return next();
  });
}
