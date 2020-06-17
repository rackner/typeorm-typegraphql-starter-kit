import { UserRepository, AdminRepository } from '../../repositories';
import { Admin, User, LoginIdentity } from '../../entities';
import { LoginIdentityTypes } from '../../enums';
import { getOne } from '../../utilities';
import {
  AddAdminInput,
  AddUserInput,
  UpdateUserInput,
} from '../../input-types';

// All add admin logic should go here
export const addAdmin = async (
  addAdminInput: AddAdminInput,
  userRepo: UserRepository,
  adminRepo: AdminRepository,
): Promise<Admin> => {
  const user: User = await getOne(
    {
      value: addAdminInput.emailAddress,
      attribute: 'emailAddress',
      relations: [{ relation: 'entity.admin', name: 'admin' }],
    },
    userRepo,
  );

  let adminUser: User;
  if (!!user) {
    let updateUser: UpdateUserInput;
    if (!!addAdminInput.password) {
      const localIdentity = new LoginIdentity({
        type: LoginIdentityTypes.LOCAL,
        password: addAdminInput.password,
      });

      updateUser = <UpdateUserInput>{
        ...addAdminInput,
        loginIdentities: [localIdentity],
      };
    } else {
      updateUser = { ...addAdminInput, id: user.id };
    }

    // Update user with new data
    await userRepo.updateOne(updateUser);

    adminUser = user;
  } else {
    if (!!addAdminInput.password) {
      const localIdentity = new LoginIdentity({
        type: LoginIdentityTypes.LOCAL,
        password: addAdminInput.password,
      });

      adminUser = await userRepo.createOne(<User>{
        ...addAdminInput,
        loginIdentities: [localIdentity],
      });
    } else {
      adminUser = await userRepo.createOne(<AddUserInput>addAdminInput);
    }
  }

  return adminRepo.createOne(adminUser);
};
