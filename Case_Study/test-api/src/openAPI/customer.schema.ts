const CustomerLoginSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: "string",
    },
    password: {
      type: "string",
    },
  },
};

export const CustomerLoginRequestBody = {
  description: 'Required input for login',
  required: true,
  content: {
    'application/json': {schema: CustomerLoginSchema},
  },
};
