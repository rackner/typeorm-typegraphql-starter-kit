import { UserRepository, CustomerRepository } from '../../repositories';
import { Customer, User, LoginIdentity } from '../../entities';
import { LoginIdentityTypes, UserRoleTypes } from '../../enums';
import { LoginResult, AuthTokens } from '../../interfaces';
import { getOne, retrieveAuthTokens } from '..';
import {
  AddCustomerInput,
  AddUserInput,
  UpdateUserInput,
} from '../../input-types';

// All add customer logic should go here
export const addCustomer = async (
  addCustomerInput: AddCustomerInput,
  userRepo: UserRepository,
  customerRepo: CustomerRepository,
): Promise<LoginResult> => {
  const user: User = await getOne(
    {
      value: addCustomerInput.emailAddress,
      attribute: 'emailAddress',
      relations: [{ relation: 'entity.customer', name: 'customer' }],
    },
    userRepo,
  );

  let customerUser: User;
  if (!!user) {
    let updateUser: UpdateUserInput;
    if (!!addCustomerInput.password) {
      const localIdentity = new LoginIdentity({
        type: LoginIdentityTypes.LOCAL,
        password: addCustomerInput.password,
      });

      updateUser = <UpdateUserInput>{
        ...addCustomerInput,
        loginIdentities: [localIdentity],
      };
    } else {
      updateUser = { ...addCustomerInput, id: user.id };
    }

    // Update user with new data
    await userRepo.updateOne(updateUser);

    customerUser = user;
  } else {
    if (!!addCustomerInput.password) {
      const localIdentity = new LoginIdentity({
        type: LoginIdentityTypes.LOCAL,
        password: addCustomerInput.password,
      });

      customerUser = await userRepo.createOne(<User>{
        ...addCustomerInput,
        loginIdentities: [localIdentity],
      });
    } else {
      customerUser = await userRepo.createOne(<AddUserInput>addCustomerInput);
    }
  }

  const customer = await customerRepo.createOne(customerUser);

  const tokens: AuthTokens = retrieveAuthTokens(
    customerUser,
    await userRepo.identityTypes(customerUser.id),
  );

  return {
    tokens,
    user: await getOne(
      {
        value: addCustomerInput.emailAddress,
        attribute: 'emailAddress',
        relations: [{ relation: 'entity.customer', name: 'customer' }],
      },
      userRepo,
    ),
  };
};
