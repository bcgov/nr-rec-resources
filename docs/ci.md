# CI/CD pipeline with GitHub Actions

## E2E Testing

### Visual Regression Testing with Happo

[Happo](https://happo.io/) is a cross browser screenshot testing library used to
test for visual regressions. It is integrated with Playwright to capture
screenshots of your application and compare them against a baseline to detect
any visual changes and will upload the screenshots to the happo servers.

To view and approve Happo diffs, open a pull request with your changes and let
the e2e tests run. Once the tests are complete, the Happo report will appear in
the list of CI jobs. If there are differences, you can approve or reject them.
If you approve them, the new screenshots will be used as the baseline for future
tests once merged.

Read more about Happo and how to review diffs here:
[Reviewing Happo Diffs](https://docs.happo.io/docs/reviewing-diffs)
