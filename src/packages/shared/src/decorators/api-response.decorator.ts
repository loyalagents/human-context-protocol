import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';

export const ApiStandardResponses = () => {
  return applyDecorators(
    ApiBadRequestResponse({ description: 'Bad Request' }),
    ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  );
};

export const ApiSuccessResponse = <TModel extends Type<any>>(
  model: TModel,
  isArray: boolean = false
) => {
  return applyDecorators(
    ApiOkResponse({
      description: 'Success',
      type: model,
      isArray
    }),
    ApiStandardResponses()
  );
};

export const ApiCreatedSuccessResponse = <TModel extends Type<any>>(
  model: TModel
) => {
  return applyDecorators(
    ApiCreatedResponse({
      description: 'Created successfully',
      type: model
    }),
    ApiStandardResponses()
  );
};

export const ApiNotFoundResponses = () => {
  return applyDecorators(
    ApiNotFoundResponse({ description: 'Resource not found' }),
    ApiStandardResponses()
  );
};