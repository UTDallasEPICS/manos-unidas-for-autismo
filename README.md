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

### Setup
Ensure Node.js, npm, Visual Studio Code, Git are installed. Ensure that everyone is working on the latest Long-Term-Support (LTS) Node.js version.

Usually, you can get away with using Git Bash (on its own or within VS Code) as your terminal.

### Install the Repo
```bash
git clone https://github.com/UTDallasEPICS/manos-unidas-for-autismo.git
cd manos-unidas-for-autismo
npm install
```
### Set up environment variables
```bash
# Fill out the environment variables accordingly
cp .env.example .env
```

### Running the Application
```bash
# Pick your favorite way to run (-o flag will automatically open a new tab)
npx nuxt dev -o
npm run dev
npm run dev -- -o
```

### Database Setup
```bash
# Initialize the database and test data seeding
npx prisma migrate dev --name init
```

## Useful dev tips
### Prettier formatting
```bash
npm run checker
```
### Prisma
```bash
# Prisma GUI to view database
npx prisma studio
```
