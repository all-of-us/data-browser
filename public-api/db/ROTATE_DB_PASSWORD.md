# Rotating Cloud SQL passwords

Rotate the MySQL passwords every 2 months with `rotate-db-password.sh` (in this folder).
Each password lives in `gs://<project>-credentials/vars.env` and on the Cloud SQL user;
the script changes both together.

It uses MySQL dual passwords: the new password is set while the old one keeps working,
so nothing breaks before the API is redeployed. A second run with `--discard-old` then
turns the old password off.

## Steps (Cloud Shell)

1. **Open Cloud Shell and get the script**
   - In the Google Cloud console, click the **>_** icon at the top right.
   - In the Cloud Shell window, choose **⋮** (top right of the terminal) → **Upload** →
     select `public-api/db/rotate-db-password.sh` from your machine. It lands in your
     Cloud Shell home folder.
   - Then:
     ```bash
     cd ~
     chmod +x rotate-db-password.sh
     ```

2. **Clear old proxies**
   ```bash
   pkill -f cloud-sql-proxy
   ```

3. **Rotate**, for example `root` on test, which needs no redeploy:
   ```bash
   ./rotate-db-password.sh --project aou-db-test --user root
   ```
   Type `y` when it asks. When it prints `Verified: ...`, finish with:
   ```bash
   ./rotate-db-password.sh --project aou-db-test --user root --discard-old
   ```

For `databrowser` or `public`, run step 3 **without** `--discard-old` first. Next,
redeploy the APIs it lists from your machine or CircleCI (the deploy needs your local
repo). Then come back to Cloud Shell and run the `--discard-old` command.

The uploaded file stays in your Cloud Shell home folder between sessions, so next time
just run `cd ~` and step 3.

## What to rotate

Run the script once per user and environment
(`--project aou-db-test|aou-db-staging|aou-db-stable|aou-db-prod`):

| User          | Redeploy needed?                    | When to run `--discard-old`          |
|---------------|-------------------------------------|--------------------------------------|
| `root`        | No                                  | Right away                           |
| `liquibase`   | No                                  | Right away                           |
| `databrowser` | That environment's API              | After the redeploy                   |
| `public` (test) | Test, staging **and** stable APIs | After all three are redeployed       |
| `public` (prod) | Prod API                          | After the redeploy                   |

Staging and stable read `PUBLIC_DB_PASSWORD` from **test's** bucket and connect to the
test instance, so never rotate `public` with `--project aou-db-staging` or
`aou-db-stable`; rotate it on test and redeploy all three.

## Redeploying

Always redeploy with `./project.rb deploy-public-api --project <project> ...` (or the
CircleCI job), never a bare `gcloud app deploy`: the deploy copies the new password from
the bucket into the app. Afterwards check the API logs show
`HikariPool-1 - Start completed` and no `Access denied`.

## If something goes wrong

- **"does not log in ... nothing changed"**: the password in the bucket already differs
  from the database. Fix that mismatch before rotating.
- **Need the previous `vars.env`**: every run backs it up to
  `gs://<project>-credentials/backups/vars.env.<timestamp>`.
- The script never prints passwords. Don't run it with `bash -x`.
