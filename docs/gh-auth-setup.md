# Роҳнамо: воридшавӣ ба GitHub тавассути gh CLI (Windows)

GitHub CLI **насб шуд** (версия 2.101.0). Танҳо як қадам монд — воридшавӣ.

## Қадами ягона: воридшавӣ бо браузер

**PowerShell** ё **Windows Terminal**-ро кушоед ва иҷро кунед:

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" auth login --web --git-protocol https --scopes repo,workflow
```

### Ҳангоми иҷро чӣ мешавад:

1. **Коди яккафо** нишон дода мешавад (масалан: `XXXX-XXXX`) — **онро нусха кунед**, баъд Enter пахш кунед — браузер кушода мешавад
2. Дар браузер: **ба GitHub ворид шавед** (агар аллакай набошед) → кодро гузоред → **Authorize github**
3. Ба терминал баргардед — `✓ Logged in as YOUR_USERNAME` нишон дода мешавад

### Тасдиқи муваффақият:

```powershell
gh auth status
```

Интизор: `✓ Logged in to github.com account YOUR_USERNAME`

## Он гоҳ чӣ? (интихобӣ)

Пас аз воридшавӣ, ман метавонам дар як қадам:

```powershell
cd C:\Users\PC\Documents\messenger

# Вариант А: репозитории нав сохта, push кунед
gh repo create tjk-chat --public --source=. --remote=origin --push

# Вариант Б: push ба репозитории мавҷуда
git remote add origin https://github.com/YOUR_USERNAME/tjk-chat.git
git push -u origin main feature/tjkchat-fixes

# Сипас PR кушоед
gh pr create --base main --head feature/tjkchat-fixes --fill
```

## Нотаҳо

- **Scope-ҳо:** `repo` — push ва PR; `workflow` — агар GitHub Actions илова кунед
- **Бехатарӣ:** `gh auth login` токенро дар **Windows Credential Manager** нигоҳ медорад, на дар файлҳои git
- **Тафтиши HTTPS git:** баъди `auth login`, git push/pull бо HTTPS худкор бо gh аутентификатсия мешавад (`gh auth setup-git` инро мустаҳкам мекунад)
- **Баромадан:** `gh auth logout` — ҳар вақт хоҳед
- **SSH:** агар ба ҷои HTTPS SSH-ро интихоб кунед — `gh auth login --web --git-protocol ssh` (калиди ~\/.ssh/id_ed25519 аллакай ҳаст)
