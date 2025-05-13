# Fundacion Manos Unidas Por Autismo: Connected Care, a Comprehensive Therapy Management Platform

## Project Overview

The purpose of the platform is to:

- Allow for the intake of new patients into the foundation
- Allow user service to manage, add, edit, delete appointments
- Display a user's schedule
- Allow therapists to create and view notes regarding sessions
- Store client/patient information

## Documentation

Refer to overall and semester documentation in [GitHub Wiki](https://github.com/UTDallasEPICS/manos-unidas-for-autismo/wiki)

## Running the Project

### Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

#### Setup
Ensure Node.js, npm, Visual Studio Code, Git are installed. Ensure that everyone is working on the latest Long-Term-Support (LTS) Node.js version.

Usually, you can get away with using Git Bash (on its own or within VS Code) as your terminal.

#### Database Setup
```bash
# Initialize the database and test data seeding
npx prisma migrate dev --name init
```

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

#### Development Server
Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
# -o flag will automatically open a new tab
npm run dev -- -o

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

#### Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Useful dev tips
#### Prettier formatting
```bash
npm run checker
```
#### Prisma
```bash
# Prisma GUI to view database
npx prisma studio
```
