# Rotating Cloud SQL passwords

Rotate the MySQL passwords every 2 months with `rotate-db-password.sh` (in this folder).
Each password lives in `gs://<project>-credentials/vars.env` and on the Cloud SQL user;
the script changes both together.

Passwords are rotated in two groups:

- **`app`**: `databrowser`, `liquibase` and `public`. These always share **one**
  password (`DATABROWSER_DB_PASSWORD`, `LIQUIBASE_DB_PASSWORD`, `PUBLIC_DB_PASSWORD`).
  The script refuses to run if they don't already match in the bucket.
- **`root`**: `MYSQL_ROOT_PASSWORD`, on its own.

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
   ./rotate-db-password.sh --project aou-db-test --group root
   ```
   Type `y` when it asks. When it prints `Verified: ...`, finish with:
   ```bash
   ./rotate-db-password.sh --project aou-db-test --group root --discard-old
   ```

4. **Rotate the `app` group** (`databrowser`, `liquibase`, `public` together), for
   example on test:
   ```bash
   ./rotate-db-password.sh --project aou-db-test --group app
   ```
   Type `y` when it asks. When it prints `Verified: ...`, redeploy the APIs it lists from
   your machine or CircleCI (the deploy needs your local repo); for test that is test,
   staging **and** stable. Check the logs, then come back to Cloud Shell and finish with:
   ```bash
   ./rotate-db-password.sh --project aou-db-test --group app --discard-old
   ```

The uploaded file stays in your Cloud Shell home folder between sessions, so next time
just run `cd ~` and step 3.

## What to rotate

Run the script for each group and environment
(`--project aou-db-test|aou-db-staging|aou-db-stable|aou-db-prod`):

| Group  | Redeploy needed?                                            | When to run `--discard-old`    |
|--------|-------------------------------------------------------------|--------------------------------|
| `root` | No                                                          | Right away                     |
| `app` on test | Test, staging **and** stable APIs                    | After all three are redeployed |
| `app` on staging / stable / prod | That environment's API            | After the redeploy             |

Staging and stable connect to the `public` database on the **test** instance with the
`PUBLIC_DB_PASSWORD` from test's bucket, so rotating `app` on test reaches them too.
Their own buckets have no `PUBLIC_DB_PASSWORD`; the script updates whichever of the
three keys each bucket has.

## Redeploying

Always redeploy with `./project.rb deploy-public-api --project <project> ...` (or the
CircleCI job), never a bare `gcloud app deploy`: the deploy copies the new password from
the bucket into the app. Afterwards check the API logs show
`HikariPool-1 - Start completed` and no `Access denied`.

## If something goes wrong

- **"differs from ... they must match"**: the bucket holds different passwords for the
  `app` users. Make them the same (bucket and database) before rotating.
- **"does not log in ... nothing changed"**: the password in the bucket differs from the
  database for that user. Fix that mismatch before rotating.
- **Need the previous `vars.env`**: every run backs it up to
  `gs://<project>-credentials/backups/vars.env.<timestamp>`.
- The script never prints passwords. Don't run it with `bash -x`.
