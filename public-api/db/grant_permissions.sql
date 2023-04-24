-- Give permission for cdr_version and config only in workbench DB to public user
GRANT SELECT ON `${DB_NAME}`.`config` TO '${DATABROWSER_DB_USER}'@'%';
GRANT SELECT ON `${DB_NAME}`.`cdr_version` TO '${DATABROWSER_DB_USER}'@'%';
