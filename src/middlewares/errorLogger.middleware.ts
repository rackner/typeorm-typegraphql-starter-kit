import { MiddlewareFn } from 'type-graphql';
import chalk = require('chalk');

export const ErrorLogger: MiddlewareFn<any> = async ({ info }, next) => {
  try {
    return await next();
  } catch (err) {
    const urlText = `${chalk.bold.green(
      info.operation?.operation?.toUpperCase()?.charAt(0) ?? 'UNDEFINED',
    )} \u2014 ${chalk.underline.cyan(info?.fieldName)}`;

    let errorMessage = err.stack;
    let code = err.extensions?.code ?? 'ERROR';

    // Corresponds to error in class validator
    if (err.message === 'Argument Validation Error') {
      errorMessage = JSON.stringify(err.validationErrors, null, 2);
      code = 'ARG_VALIDATION_ERROR';
    }

    console.log(
      `[${chalk.white(Date.now())}] ${chalk.blueBright(
        `RES #${chalk.bold(0)}`,
      )}: ${urlText}\tStatus: ${chalk.underline.bold.red(code)}\n`,
      chalk.gray(errorMessage),
    );

    // rethrow the error
    return err;
  }
};
