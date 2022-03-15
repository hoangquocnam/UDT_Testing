import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {PasswordHasherBindings} from '../keys';
import {Customer} from '../models';
import {Credentials, CustomerRepository} from '../repositories/customer.repository';
import {BcryptHasher} from './hash.password';

export class MyUserService implements UserService<Customer, Credentials>{
  constructor(
    @repository(CustomerRepository)
    public userRepository: CustomerRepository,

    // @inject('service.hasher')
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher

  ) {}
  
  async verifyCredentials(credentials: Credentials): Promise<Customer> {
    // implement this method
    const foundUser = await this.userRepository.findOne({
      where: {
        email: credentials.email
      }
    });
    if (!foundUser) {
      throw new HttpErrors.NotFound('user not found');
    }
    const passwordMatched = await this.hasher.comparePassword(credentials.password, foundUser.password)
    if (!passwordMatched)
      throw new HttpErrors.Unauthorized('password is not valid');
    return foundUser;
  }
  convertToUserProfile(user: Customer): UserProfile {
    let userName = '';
    if (user.firstName)
      userName = user.firstName;
    if (user.lastName) {
      userName = user.firstName ? `${user.firstName} ${user.lastName}` : user.lastName;
    }
    return {
      [securityId]: user.id!.toString(),
      name: userName,
      id: user.id,
      email: user.email
    };
    // throw new Error('Method not implemented.');
  }

}
