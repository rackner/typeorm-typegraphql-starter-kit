import { SSM } from 'aws-sdk';
import { FileUpload } from 'graphql-upload';
import pluralize = require('pluralize');
import { Service } from 'typedi';
import { ApolloError } from 'apollo-server-express';

@Service()
export class SSMService {
  // AWS S3 Object
  public ssm: SSM = new SSM({
    region: process.env.AWS_REGION,
    signatureVersion: 'v4',
  });

  public async getParameter(Name: string): Promise<SSM.Parameter> {
    const parameterResult: SSM.GetParameterResult = await new Promise(
      (res, rej) => {
        this.ssm.getParameter(
          {
            Name,
            WithDecryption: true,
          },
          (err, data: any) => {
            if (!!err) rej(err);

            res(data);
          },
        );
      },
    );

    if (!parameterResult.Parameter)
      throw new ApolloError(
        'Error retrieving parameter',
        'UNABLE_TO_RETRIEVE_PARAMETER',
      );

    return parameterResult.Parameter;
  }

  public async getParameters(Names: string[]): Promise<SSM.Parameter[]> {
    const parametersResult: SSM.GetParametersResult = await new Promise(
      (res, rej) => {
        this.ssm.getParameters(
          { Names, WithDecryption: true },
          (err, data: any) => {
            if (!!err) rej(err);

            res(data);
          },
        );
      },
    );

    if (!parametersResult.Parameters)
      throw new ApolloError(
        'Error retrieving parameters',
        'UNABLE_TO_RETRIEVE_PARAMETERS',
      );

    return parametersResult.Parameters;
  }

  public async createParameter(
    Name: string,
    Value: string,
    Tags: any,
    Description?: string,
  ): Promise<void> {
    return await new Promise((res, rej) => {
      this.ssm.putParameter(
        {
          Name,
          Value,
          Description,
          Overwrite: false,
          Type: 'SecureString',
          Tags,
        },
        (err, data: any) => {
          if (!!err) rej(err);

          res(data);
        },
      );
    });
  }

  public async updateParameter(
    Name: string,
    Value: string,
    Description?: string,
  ): Promise<void> {
    const params: SSM.PutParameterRequest = {
      Name,
      Value,
      Overwrite: true,
      Type: 'SecureString',
    };

    if (!!Description) params.Description = Description;

    return await new Promise((res, rej) => {
      this.ssm.putParameter(params, (err, data: any) => {
        if (!!err) rej(err);

        res(data);
      });
    });
  }
}
