// Atualiza a seção "Mexi recentemente" do README com os repos públicos mais recentes.
// Roda no GitHub Actions (ver .github/workflows/atualizar-readme.yml). Só lê repos públicos.
import { readFile, writeFile } from "node:fs/promises";

const USUARIO = "CorreaJhow";
const IGNORAR = new Set([USUARIO]);
const QTD = 4;

const resp = await fetch(
  `https://api.github.com/users/${USUARIO}/repos?type=owner&sort=pushed&per_page=30`,
  { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } },
);
if (!resp.ok) throw new Error(`GitHub API respondeu ${resp.status}`);

const repos = (await resp.json())
  .filter((r) => !r.fork && !r.archived && !r.private && !IGNORAR.has(r.name))
  .slice(0, QTD);

const data = (iso) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
const linhas = repos.map(
  (r) => `- [**${r.name}**](${r.html_url})${r.description ? `: ${r.description}` : ""} · <sub>${data(r.pushed_at)}</sub>`,
);

const readme = await readFile("README.md", "utf8");
const novo = readme.replace(
  /(<!-- RECENTES:INICIO -->)[\s\S]*?(<!-- RECENTES:FIM -->)/,
  `$1\n${linhas.join("\n")}\n$2`,
);

if (novo !== readme) {
  await writeFile("README.md", novo);
  console.log("README atualizado.");
} else {
  console.log("Nada mudou.");
}
