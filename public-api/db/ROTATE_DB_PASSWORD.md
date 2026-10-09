# Rotating Cloud SQL passwords

Rotate the MySQL passwords every 2 months with `rotate-db-password.sh` (in this folder).
Each password lives in `gs://<project>-credentials/vars.env` and on the Cloud SQL user;
the script changes both together.

Passwords are rotated in two groups:

- **`app`**: `databrowser`, `liquibase` and `public`. These always share **one**
  password (`DATABROWSER_DB_PASSWORD`, `LIQUIBASE_DB_PASSWORD`, `PUBLIC_DB_PASSWORD`).
  The script sets the same new password on all three and in all three keys.
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

2. **Rotate `root`**, for example on test (no redeploy needed):
   ```bash
   ./rotate-db-password.sh --project aou-db-test --group root
   ```
   Type `y` when it asks. When it prints `Done.`, finish with:
   ```bash
   ./rotate-db-password.sh --project aou-db-test --group root --discard-old
   ```

   Both commands end with `Login check OK: root`. That login also refills MySQL's
   password cache, which the API needs after any password change.

3. **Rotate the `app` group** (`databrowser`, `liquibase`, `public` together), for
   example on test:
   ```bash
   ./rotate-db-password.sh --project aou-db-test --group app
   ```
   Type `y` when it asks and wait for `Done.`

4. **Redeploy the API(s)** from your machine (see [Redeploying](#redeploying) below).
   For `app` on test, that is test, staging **and** stable.

5. **Turn off the old password**, back in Cloud Shell, once every API from step 4 is
   healthy:
   ```bash
   ./rotate-db-password.sh --project aou-db-test --group app --discard-old
   ```

The uploaded file stays in your Cloud Shell home folder between sessions, so next time
just run `cd ~` and continue from step 2.

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

Run these **on your machine**, from `public-api/` in an up-to-date checkout of `master`.
The deploy copies the new password from the bucket into the app, so always use
`./project.rb deploy-public-api`, never a bare `gcloud app deploy`.

```bash
cd data-browser/public-api
git checkout master && git pull

# Use a new version name each time, e.g. pw-rotation-20261201
./project.rb deploy-public-api --project aou-db-test --version pw-rotation-YYYYMMDD --promote
```

For `app` on test, run the deploy three times, once per project:

```bash
for p in aou-db-test aou-db-staging aou-db-stable; do
  ./project.rb deploy-public-api --project "$p" --version pw-rotation-YYYYMMDD --promote
done
```

For prod, the same command with `--project aou-db-prod`.

**Check each deploy** before running `--discard-old`:

```bash
P=aou-db-test           # repeat for each project you deployed
V=pw-rotation-YYYYMMDD

# The version points at this project's database (not another environment's).
gcloud app versions describe "$V" --project="$P" --service=api \
  --format="yaml(envVariables.CLOUD_SQL_INSTANCE_NAME)"

# Load the site once, then look for a clean connection.
gcloud logging read 'resource.type="gae_app" AND resource.labels.module_id="api" AND (textPayload:"Access denied" OR textPayload:"HikariPool")' \
  --project="$P" --freshness=15m --limit=10 --format="value(timestamp, textPayload)"
```

You want `CLOUD_SQL_INSTANCE_NAME: <same project>:us-central1:databrowsermaindb` and
`HikariPool-1 - Start completed` with no `Access denied`.

If you hit "Your app may not have more than 210 versions", delete old unused versions
first (`gcloud app versions list --project=<project> --service=api`).

## If something goes wrong

- **API shows `Access denied` even though the password is right**: after any password
  change (or a Cloud SQL restart) MySQL's `caching_sha2_password` cache is empty, and the
  API's connector can't log in until one full login refills it. The script does that login
  for you (it prints `Login check OK: <user>` per user). If you still see it, log in once
  from Cloud Shell and restart the API's instances:
  ```bash
  cloud-sql-proxy <project>:us-central1:databrowsermaindb --port 9475 &
  PW=$(gsutil cat gs://<project>-credentials/vars.env | sed -n 's/^DATABROWSER_DB_PASSWORD=//p')
  for u in databrowser liquibase public; do
    MYSQL_PWD="$PW" mysql --get-server-public-key -h127.0.0.1 -P9475 -u$u -N -e "SELECT CURRENT_USER();"
  done
  unset PW; pkill -f cloud-sql-proxy
  # then delete the serving version's instances (gcloud app instances delete ...) and load the site
  ```
- **`WARNING: login failed for <user>`** from the script: that user's password in the
  database doesn't match the bucket. Fix it before redeploying or running `--discard-old`.
- **Need the previous `vars.env`**: every run backs it up to
  `gs://<project>-credentials/backups/vars.env.<timestamp>`; copy it back with
  `gsutil cp`.
- Run the script in Cloud Shell (it uses Linux `sed -i`), and never with `bash -x`.
