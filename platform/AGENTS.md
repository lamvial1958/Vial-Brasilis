<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Escrita de arquivos via PowerShell — OBRIGATÓRIO

Nunca usar `[System.Text.Encoding]::UTF8` para escrever arquivos. No .NET esse encoding inclui BOM (`\xEF\xBB\xBF`), que quebra `JSON.parse` no Node.js e causou 404 em todas as lições do projeto.

Sempre usar:

```powershell
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
```
