import { UserRepository, SuperAdminRepository } from '../../repositories';
import { SuperAdmin, User, LoginIdentity } from '../../entities';
import { LoginIdentityTypes } from '../../enums';
import { getOne } from '../../utilities';
import {
  AddSuperAdminInput,
  AddUserInput,
  UpdateUserInput,
} from '../../input-types';

// All add super admin logic should go here
export const addSuperAdmin = async (
  addSuperAdminInput: AddSuperAdminInput,
  userRepo: UserRepository,
  superAdminRepo: SuperAdminRepository,
): Promise<SuperAdmin> => {
  const user: User = await getOne(
    {
      value: addSuperAdminInput.emailAddress,
      attribute: 'emailAddress',
    },
    userRepo,
  );

  let superAdminUser: User;
  if (!!user) {
    let updateUser: UpdateUserInput;
    if (!!addSuperAdminInput.password) {
      const localIdentity = new LoginIdentity({
        type: LoginIdentityTypes.LOCAL,
        password: addSuperAdminInput.password,
      });

      updateUser = <UpdateUserInput>{
        ...addSuperAdminInput,
        loginIdentities: [localIdentity],
      };
    } else {
      updateUser = { ...addSuperAdminInput, id: user.id };
    }

    // Update user with new data
    await userRepo.updateOne(updateUser);

    superAdminUser = user;
  } else {
    if (!!addSuperAdminInput.password) {
      const localIdentity = new LoginIdentity({
        type: LoginIdentityTypes.LOCAL,
        password: addSuperAdminInput.password,
      });

      superAdminUser = await userRepo.createOne(<User>{
        ...addSuperAdminInput,
        loginIdentities: [localIdentity],
      });
    } else {
      superAdminUser = await userRepo.createOne(
        <AddUserInput>addSuperAdminInput,
      );
    }
  }

  return superAdminRepo.createOne(superAdminUser);
};
