# Cuzi Server Instructions

## Steps to run this project:

1. Run `npm i` command
2. (Optional) Setup database settings inside `ormconfig.json` file on the root project folder (required only if using typeormCLI, aka to run migrations)
3. Add environment variables inside `.env` file on the root project folder. This is required to run the project, get this info from an admin.
4. Run the `npm run start_local` command to start the development server with hot-reload
5. Run the `npm run start` command to start the development server without hot-reload

## Steps to commit to this project:

1) On the cuzi-server Cuzi MVP project board, move the relevant issue to the `In Progress` column, make sure to assign yourself to the issue.

2) Checkout (start on) the development branch: `git checkout dev`

3) If the development branch does not exist on your local system, fetch it from origin (github): `git fetch origin dev`
   If the branch does exist, proceed to the next step.

4) Checkout (create) a new branch off of the development branch: `git checkout -b new-branch-name-here`
 
Naming conventions:
- Be descriptive
- Be concise (try to make it less than 5 words)
- Use lower-dash-case (example: new-branch-name-here)
- Obey the following rule for branch names: /^[0-9a-z-]+\$/g

5) Proceed to work on a issue/bug-fix in the this branch.

6) When complete, commit and push this branch to GitHub:
```
   git add .
   git commit -m "Enter a meaningful commit message describing the work you did here. This text can be as long or as short as you require."
   git push origin branch-name-here
```

7) Go to the cuzi-server GitHub repository. Navigate to the pull request tab and create a new pull request. Choose the base branch as `dev`, and the compare branch as the branch you just pushed to GitHub. Assign Jake (and at least one other person) as reviewers to the project and label as necessary, and then create the PR.

8) On the cuzi-server Cuzi MVP project board, move the relevant issue to the `Review in Progress` column.

## Overall Path of a Request/Response (GraphQL)
1) src/server.ts

     this is basically the starting point for the app. where we:
        a) connect to the database
        b) initiate our express web app
        c) add global express middlewares to assist with express (set headers, compress, cors, etc.)
        d) initiate the ability to upload files with apollo
        e) build our graphQL schema based off of decorators we tagged throughout the application
        f) setup any global apollo middlewares (includes guards/interceptors) to assist with apollo requests/responses
        g) alter graphql request context to include data we want (attach user from the login token with every request)
        h) initiate apollo with our express instance
        i) open up a port in which we can begin taking HTTP requests on

2) Request Validation.

     Request is validated with schema. If the request and arguments are not valid and matching what the server schema provides, then the request will throw an error and never get past this point. Validation includes:
        a) gateway exists and is offered by graphQL API (has a matching query/mutation in schema)
        b) arguments are valid and match the structure and types required in the schema
        c) any class-validator validations on input types/args also performed here

3) Authentication (Optional) src/utilities/auth/auth-checker.util.ts 

     If a gateway/field is tagged with the @Authorized() decorator, then it is sent here next. Here, we check everything having with authorization and authentication on this app*. Any gateway, resolve property, or field which the decorator is tagged with will automatically be required to be authenticated with our system. The following is possible for arguments of the @Authenticated decorator:
        a) @Authorized() has zero arguments. If tagged with authenticated, then API requires nothing more than the user being authenticated (aka include proper headers) to continue
        b) @Authorized(...args: UserRoleTypes[]) If tagged with this, requires the user sending the request to have every role-type that was included as an argument in the authenticated decorator. Example: @Authorized(UserRoleTypes.CUSTOMER, UserRoleTypes.ADMIN) requires the calling user to be both a CUSTOMER and ADMIN to proceed.
        c) @Authorized(options: AuthCheckerOptions) If tagged with this, then will provide more advanced options to check the user is authenticated, has the proper roles, and is scoped to perform the request. The option parameters are as follows:
            c1) role: (optional) a single UserRoleType that is required to perform the request
            c2) andRoles: (optional) an array of UserRoleTypes that are ALL required in order to perform the request. This is equivalent to b) above
            c3) orRoles: (optional) an array of UserRoleTypes in which only ONE is required in order for perform the request
            c4) type: (required) the ActionTypes type this request pertains to. Includes CREATE, UPDATE, READ, LIST, or DELETE.
            c5) entity: (optional) the EntityTypes entity which this action is affecting (only if one). This is used to segment scopes further down when calling scope functions. Must also set validateScope argument to true to scope. Can also just use fieldName if affecting more than one entity.
            c6) validateScope: (optiona) a boolean argument describing whether or not the input args/types need to be validated for scope. This confirms that a user is only able to perform actions that their user is scoped to do, based on factors other than role. This can include things like admins only being able to add items to businesses they own or customers only being able to update their own user. Most of the time, we will just allow super admins to pass scoping authorization errors.
     *Authentication/authorization includes:
        - Checking that the request includes the proper headers. Requires `x-access-token` and `x-refresh-token` with every request. These tokens will be decoded with every request and translate to a user (this user will be attached to the request context). This corresponds to authentication.
        - Checking that the user performing the request (aka the one decoded by the token) has the correct roles in order to perform the request. This corresponds to basic authorization.
        - Scoping the input args/parameters to make sure the user performing the request (aka user decoded by tokens) should be able to perform the request. This corresponds to a more complex form of authorization, in which the users' attributes and owning relations define whether or not the user is able to perform a request.

4) Validate Arguments (Optional) src/decorators/validate-args.decorator.ts

     If a gateway is tagged with the @ValidateArgs parameter, then that requests' arguments will be further validated. This validation includes things beyond the ability of the graphQL schema/class-validator, aka things having to do with the current state of the application/user. For example, a password is required when creating a super admin for a user that doesn't exist yet. But including a password will throw an error when creating a super admin for a user that DOES exist. 
     It is the assumption that all arguments coming out of the ValidateArgs methods are completely validated by the time they hit the gateways/resolvers.

5) Resolvers/Gateways   src/resolvers/**.resolver.ts

     This is basically where the main execution is started for a function. It is where we tag 3) and 4) in order to execute them as middleware. And once those pass, where we begin to make changes to our data/perform requests. However, most of the time, these resolvers/gateways will just pass on any information provided by the arguments/user performing the action to utility functions. Where most of the 'heavy lifting' will be done.

6) Utility Functions src/utilities/**.util.ts

     This is where the core of the 'work' for our backend is done. It is where we will call upon repositories 7a) and services 7b) to make changes to data tracked both internally/externally, based off of resolvers/arguments requested by a user.

7a) Repositories (Optional)

     These are basically our 'touchpoints' to our database, where we use TypeORM to perform CRUD options on our data stored in our postgres. We should try to avoid directly connecting to our database in non-repositories, or non-entities, if possible. Aka, try to do your best to keep all TypeORM methods (createQueryBuilder, save, find, etc.) in repositories/entity class based methods only. 

7b) Services (Optional) src/services/**.service.ts

     These are our 'touchpoints' to external services (not including our database(s)). This is more or less how we connect to external APIs such as Square, AWS, Stripe, etc.

8) From here, the response is sent back to the user with any data requested. If there are any afterwares, they would be executed at this step (for example, an error or response logging). 

## File Structure/Naming Conventions
- root
  
- node_modules/ 
      contains external dependencies, automatically managed by node 
      **DO NOT ALTER YOURSELF**.
  
- src/ 
    contains the overall application  - src/args-types/ [**.arg.ts]

    contains input arguments for graphql queries

    **must tag with type-graphql decorators to build schema.gql**

    **optionally tag with class-validator decorators for additional validation**

    - config/ [**.config.ts]

        contains configuration information that doesn't need to be hidden (like .env)
    - entities/ [**.entity.ts]

        contains the base database models in the application

        typeORM uses this to construct the postgres tables, columns, and relations

        type-graphql and apollo-server use this to generate some of your basic types on the schema.gql file

        **must tag with both type-graphql and typeorm decorators**
    - enums/ [**.enum.ts]

        contains predefined enum-types

        **must register with type-graphql**
    - input-types/ [**.input.ts]

        contains input arguments for graphql mutations

        **must tag with type-graphql decorators to build schema.gql**

        **optionally tag with class-validator decorators for additional validation**
    - interfaces/ [**.interface.ts]

        contains interfaces used within the backend

        not tied to typeorm

        most of the time, not tied to type-graphql, unless also returning this type

        **only tag with type-graphql decorators if returning this object to client**
    - middlewares/ [**.middleware.ts]

        contains middlewares for the application 
    - migrations/ [filename is autogenerated by typeorm]

        contains all the information to run migrations to update our database schema
    - plugins/ [**.plugin.ts]

        contains apollo-server plugins for the application
    - repositories/ [**.repository.ts]

        contains typeorm custom repositories used to connect to the database

        these should be the only places where you directly hit our postgres database
    - resolvers/ [**.resolver.ts]

        contains the gateway and field resolvers for all of our backend entities (similar to controllers in a REST system)

        **must tag with type-graphql decorators to build schema.gql**

        **must inject services and repositories at this level, to be used by utility functions**
    - scopes / [**.scope.ts]

        contains functions that are used purely to scope requests

        scope is a type of authorization that is based off of more than just a role (this is already checked separately)

        a user is scoped for a request if they are allowed to perform that action. 

        for example, as an admin, I should be scoped to only be able to update businesses, or add items to businesses, for which I am admins of
        for most requests, super admins will pass scope automatically
    - services/ [**.service.ts]

        contains functions that allow connection with 3rd party dependencies

        these should be the only places where you directly hit external services (outside of cuzi)

        **must tag with typedi decorator to allow for DI in resolvers**
        examples: stripe, square, aws, etc. 
    - utilities/ [**.utility.ts]

        contains utility/helper functions for the rest of the application
        designed to be reusable for other utility/resolver functions
    - validations/ [**.validation.ts]

        contains helper functions solely to validate input arguments
        these should only do complex validations that are beyond the scope of class validator

        for example: I should only be able to add a password when creating a super_admin, if the super_admin does not already exist
        by all purposes, utility functions should be able to alter data without worrying about validation issues after passing through this
    - server.ts

        this is the main starting place of our app

        initializes our express and apollo-server instances so our frontend(s) can begin to make requests
  
- .env 
      contains environment variables (mainly for local development)

      *must obtain this from admin*

      **DO NOT ADD THIS FILE TO GIT**
  
- .gitignore

      contains files that should not be added to the git repository
  
- .prettierignore

      contains files that should be ignored by prettierJS
  
- .prettierrc

      contains instructions for how to prettify-code after every commit
  
- ormconfig.json

      contains instructions for typeorm - specifically the typeorm cli - to connect to the database instance

      *must obtain this from admin*

      **DO NOT ADD THIS FILE TO GIT**
  
- package-lock.json

      stores an exact, versioned tree of your dependencies. 

      **DO NOT ALTER YOURSELF**.
  
- package.json

      contains various metadata relevant to the project, including scripts to initiate running and building the application, dependencies, etc.
  
- README.md

      contains overall instructions for developers on this project
  
- schema.gql

      autogenerated graphQL schema file (generates after starting server) 

      add this file to your postman-api for instant validation

      **DO NOT ADD THIS FILE TO GIT**
  
- tsconfig.json

      contains instructions for typescript to compile this project
