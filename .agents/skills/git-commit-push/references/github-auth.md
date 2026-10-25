# GitHub Authentication Guide for Volt

Target repository: `https://github.com/chansy-khuexonglue/volt.git`

## 1. Using GitHub CLI (`gh`) - Recommended

The fastest and most secure method to authenticate with GitHub on Linux:

```bash
# Check if GitHub CLI is logged in
gh auth status

# If not logged in, authenticate:
gh auth login
```
Follow the interactive prompt:
- Select **GitHub.com**
- Protocol: **HTTPS**
- Authenticate Git with your GitHub credentials: **Yes**
- Choose web browser or one-time code to authenticate.

Once authenticated, `git push -u origin main` works immediately without asking for passwords.

---

## 2. Using Personal Access Token (PAT) via HTTPS

GitHub discontinued password authentication for Git operations. You must use a Personal Access Token:

1. Visit [GitHub Tokens Settings](https://github.com/settings/tokens).
2. Generate a token (Classic or Fine-grained) with `repo` scope (`admin:repo_hook`, `repo:status`, `public_repo` / private repository access).
3. Copy the token.
4. When prompted by `git push`:
   - **Username**: `chansy-khuexonglue`
   - **Password**: *(Paste your Personal Access Token)*

### Storing Credentials locally:
To avoid re-typing your token:
```bash
git config --global credential.helper store
```

Or embed directly in the remote URL (only on secure, private developer machines):
```bash
git remote set-url origin https://<TOKEN>@github.com/chansy-khuexonglue/volt.git
```

---

## 3. Using SSH Keys

If you prefer SSH:

1. Check existing SSH keys:
   ```bash
   ls -la ~/.ssh
   ```
2. Generate a new SSH key (if needed):
   ```bash
   ssh-keygen -t ed25519 -C "www.ainy@gmail.com"
   ```
3. Add the public key (`~/.ssh/id_ed25519.pub`) to your GitHub account under **Settings > SSH and GPG keys**.
4. Test your connection:
   ```bash
   ssh -T git@github.com
   ```
5. Update repository remote to use SSH:
   ```bash
   git remote set-url origin git@github.com:chansy-khuexonglue/volt.git
   git push -u origin main
   ```
