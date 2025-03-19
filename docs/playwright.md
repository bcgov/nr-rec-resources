# Playwright

Automated e2e testing with [Playwright](https://playwright.dev/)

## Running e2e tests

Ensure the frontend and backend are running locally on port 3000 and 8000
respectively before running the e2e tests.

For headless mode:

```bash
npm run e2e
```

For UI mode:

```bash
npm run e2e:ui
```

## Writing tests

### POM (Page Object Model)

[https://playwright.dev/docs/pom](https://playwright.dev/docs/pom)

Page object models (POM) simplify authoring by creating a higher-level API which
suits your application and helps to simplify maintenance by capturing element
selectors in one place andcreate reusable code to avoid repetition.

All actions and assertions should be encapsulated in page objects to keep tests
clean and maintainable.
