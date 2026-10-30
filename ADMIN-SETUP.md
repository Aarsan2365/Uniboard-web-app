# Set up an administrator

There is no administrator registration form on the website. Students register at `/register`; administrators are created by a person who controls the backend and database.

## Recommended: interactive setup

1. Configure the correct MONGODB_URI in backend/.env and install backend dependencies.
2. In a terminal in `backend`, run:

   ```powershell
   npm run setup-admin
   ```

3. Enter the name and email of the administrator.
4. Enter a unique password with at least 12 characters, then confirm it. The password is hidden while typing.
5. Wait for `Administrator created successfully`.
6. Start the backend/frontend and open `/admin/login`. Sign in using that email and password.

Existing administrator accounts keep their passwords and can sign in immediately. If the entered email belongs to a student, setup asks for the word PROMOTE before changing the role. This preserves the existing password. Use a separate email to keep separate student and administrator accounts.

## Alternative: PowerShell environment variables

Run from `backend`:

```powershell
$env:ADMIN_NAME = "Campus Administrator"
$env:ADMIN_EMAIL = Read-Host "Administrator email"
$secure = Read-Host "Administrator password (12+ characters)" -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $secure).Password
try {
    npm run create-admin
} finally {
    Remove-Item Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:ADMIN_EMAIL -ErrorAction SilentlyContinue
    Remove-Item Env:ADMIN_NAME -ErrorAction SilentlyContinue
    Remove-Item Env:ADMIN_PROMOTE -ErrorAction SilentlyContinue
    $secure.Dispose()
}
```

To explicitly promote an existing student using this alternative, set `$env:ADMIN_PROMOTE = "true"` before running the command. Existing account passwords are preserved.

## If setup fails

- `bad auth : authentication failed`: reset/check the Atlas database user's password and update MONGODB_URI. Your Atlas database credentials are separate from the new administrator credentials.
- `MONGODB_URI` missing: create backend/.env from .env.example and configure it.
- Administrator already exists: open Admin Login and use the existing account password.
- Invalid name/email, weak password or mismatched confirmation: rerun setup with valid values. An incomplete new account is not created.

Do not include your real .env or passwords when sharing the project.
