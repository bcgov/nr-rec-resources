# Shared library for admin and public apps

## Installation

Run `npm install` in the shared directory to install the necessary dependencies.

```bash
npm install
```

## Using the Shared Library

The shared library is located in the `shared` directory. You can import
components, hooks, and utilities from this library in both the admin and public
applications. For example, to use a shared component in the admin app, you can
do:

```typescript
import { SharedComponent } from "@shared/components/SharedComponent";
```

## Creating new components

When creating new components in the shared library, install the necessary
packages in the shared package.json as well as the project that will use the
component.

Tests should be added in the `shared/src/test` directory and match the structure
of the shared library folder.
