// Common
import { getOne } from './common/getOne.util';
import { getMany } from './common/getMany.util';
import { alterContext } from './common/alterContext.util';
import {
  generateSalt,
  hashPassword,
  compareToHash,
} from './common/encryption.util';

// Auth
import { authChecker } from './auth/authChecker.util';
import { loginLocally } from './auth/loginLocally.util';
import { retrieveAuthTokens } from './auth/retrieveAuthTokens.util';

// User
import { updateUser } from './user/updateUser.util';
import { deleteUser } from './user/deleteUser.util';

// Super Admin
import { addSuperAdmin } from './super-admin/addSuperAdmin.util';
import { deleteSuperAdmin } from './super-admin/deleteSuperAdmin.util';

// Admin
import { addAdmin } from './admin/addAdmin.util';
import { deleteAdmin } from './admin/deleteAdmin.util';

// Customer
import { addCustomer } from './customer/addCustomer.util';
import { deleteCustomer } from './customer/deleteCustomer.util';

// Image
import { deleteImage } from './image/deleteImage.util';
import { addImage } from './image/addImage.util';

export {
  // Common
  getOne,
  getMany,
  generateSalt,
  hashPassword,
  compareToHash,
  // Auth
  authChecker,
  loginLocally,
  alterContext,
  retrieveAuthTokens,
  // User
  updateUser,
  deleteUser,
  // Super Admin
  addSuperAdmin,
  deleteSuperAdmin,
  // Admin
  addAdmin,
  deleteAdmin,
  // Customer
  addCustomer,
  deleteCustomer,
  // Image
  deleteImage,
  addImage,
};
