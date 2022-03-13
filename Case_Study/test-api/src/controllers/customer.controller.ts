import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  param,
  getModelSchemaRef,
  patch,
  put,
  del,
  response,
} from '@loopback/rest';
import {Customer} from '../models';
import {
  User,
  MyUserService,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {PasswordHasherBindings, TokenServiceBindings, UserServiceBindings} from '../keys';
import {BcryptHasher} from '../services/hash.password';
import {JWTService} from '../services/jwt-service';
import {validateCredentials} from '../services';
import {get, getJsonSchemaRef, post, requestBody} from '@loopback/rest';
import * as _ from 'lodash';
import {Credentials, CustomerRepository} from '../repositories';


export class CustomerController {
  constructor(
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,

    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,

    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,

    @repository(CustomerRepository)
    public customerRepository: CustomerRepository,
  ) {}

  @get('/customers')
  @response(200, {
    description: 'Array of Customer model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Customer, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Customer) filter?: Filter<Customer>,
  ): Promise<Customer[]> {
    return this.customerRepository.find(filter);
  }

  @get('/customers/{id}')
  @response(200, {
    description: 'Customer model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Customer, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Customer, {exclude: 'where'})
    filter?: FilterExcludingWhere<Customer>,
  ): Promise<Customer> {
    return this.customerRepository.findById(id, filter);
  }

  @patch('/customers/{id}')
  @response(204, {
    description: 'Customer PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {partial: true}),
        },
      },
    })
    customer: Customer,
  ): Promise<void> {
    await this.customerRepository.updateById(id, customer);
  }

  @put('/customers/{id}')
  @response(204, {
    description: 'Customer PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() customer: Customer,
  ): Promise<void> {
    await this.customerRepository.replaceById(id, customer);
  }

  @del('/customers/{id}')
  @response(204, {
    description: 'Customer DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.customerRepository.deleteById(id);
  }

  @post('/customers/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',

                }
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody()credentials: Credentials,
  ): Promise<{token: string}> {
    const customer = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(customer);
    const token = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({token: token});
  }

  @post('/customers/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          schema: getJsonSchemaRef(User)
        }
      }
    }
  })
  async signup(@requestBody() userData: User) {
    validateCredentials(_.pick(userData, ['email', 'password']));
    userData.password = await this.hasher.hashPassword(userData.password)
    const savedUser = await this.customerRepository.create(userData);
    // delete savedUser.password;
    return savedUser;
  }
}
