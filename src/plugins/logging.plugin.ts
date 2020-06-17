import chalk = require('chalk');
import fs = require('fs');
import {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server-errors';
import {
  ApolloServerPlugin,
  GraphQLRequestContext,
  GraphQLRequestListener,
  GraphQLServiceContext,
  GraphQLResponse,
} from 'apollo-server-plugin-base';

// Handles request/response logging. Errors handled by error-logger middleware
export class ApolloLoggingPlugin
  implements ApolloServerPlugin, GraphQLRequestListener {
  private blacklistedAttributes = JSON.parse(
    fs.readFileSync('src/plugins/blacklist-attributes.json') as any,
  );

  private num: number = 0;

  private start: number;

  private stop: number;

  private urlText: string;

  /**
   * requestDidStart
   * Triggered at the beginning of every request cycle, and returns an object (GraphQLRequestListener)
   * that has the functions for each request lifecycle event.
   */
  public requestDidStart(
    context: GraphQLRequestContext,
  ): GraphQLRequestListener | void {
    this.start = Date.now();
    return this;
  }

  /**
   * Request Lifecycle Handlers
   */

  /**
   * The executionDidStart event fires whenever Apollo Server begins executing the GraphQL operation specified by a request's document AST.
   * @param context 'metrics' | 'source' | 'document' | 'operationName' | 'operation'
   */
  public executionDidStart(context: GraphQLRequestContext): void {
    const queryDefinition: any = context?.document?.definitions?.[0];
    this.urlText = `${chalk.bold.green(
      queryDefinition?.operation?.toUpperCase()?.charAt(0) ?? 'UNDEFINED',
    )} \u2014 ${chalk.underline.cyan(queryDefinition?.name?.value)}`;

    console.log(
      `[${chalk.white(this.start)}] ${chalk.magenta(
        `REQ #${chalk.bold(this.num)}`,
      )}: ${this.urlText}`,
    );

    if (!!Object.keys(context.request?.variables ?? {}).length) {
      const variables: any = {};
      for (let item of Object.entries(context.request?.variables ?? {})) {
        const [attr, value] = item;

        if (this.blacklistedAttributes.includes(attr) && !!value) {
          variables[attr] = '**********';
        } else {
          variables[attr] = value;
        }
      }

      console.log(
        chalk.gray(`variables => ${JSON.stringify(variables, null, 2)}`),
      );
    }
  }

  /**
   * The willSendResponse event fires whenever Apollo Server is about to send a response for a GraphQL operation.
   * This event fires (and Apollo Server sends a response) even if the GraphQL operation encounters one or more errors.
   * @param context 'metrics' | 'response'
   */
  public willSendResponse(context: GraphQLRequestContext): void {
    this.stop = Date.now();

    if (!context?.response?.errors)
      console.log(
        `[${chalk.white(this.stop)}] ${chalk.blueBright(
          `RES #${chalk.bold(this.num)}`,
        )}: ${this.urlText}\tTime: ${chalk.bold.yellow(
          this.stop - this.start,
        )}  \tStatus: ${chalk.bold.green('Success')}`,
      );
    this.num = ++this.num;
  }
}
