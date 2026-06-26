import { test, expect } from "@playwright/test";
import { loginComEmail } from "./helpers/login";

test.describe("Navegação de lições", () => {
  test.beforeEach(async ({ page }) => {
    await loginComEmail(page);
  });

  test("página /licoes mostra os cinco níveis", async ({ page }) => {
    await page.goto("/licoes");

    await expect(page.getByRole("heading", { name: "Lições" })).toBeVisible();
    for (const nivel of ["PRE-A1", "A1", "A2", "B1", "B2"]) {
      await expect(page.getByText(nivel).first()).toBeVisible();
    }
  });

  test("lista de unidades do PRE-A1 mostra cards de lição", async ({ page }) => {
    await page.goto("/licoes/pre-a1");

    await expect(page.getByText("PRE-A1").first()).toBeVisible();
    // Deve haver pelo menos um card de lição
    const cards = page.locator("a[href*='/licoes/pre-a1/']");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("lição PRE-A1 abre e exibe seções", async ({ page }) => {
    await page.goto("/licoes/pre-a1");

    // Clica na primeira lição da lista
    const primeiraLicao = page.locator("a[href*='/licoes/pre-a1/']").first();
    await primeiraLicao.click();
    await page.waitForLoadState("networkidle");

    // O hero da lição deve aparecer com o badge PRE-A1
    await expect(page.getByText("PRE-A1").first()).toBeVisible();

    // Deve haver pelo menos uma seção com heading numérico
    await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
  });
});

test.describe("Exercícios", () => {
  test.beforeEach(async ({ page }) => {
    await loginComEmail(page);
    await page.goto("/licoes/pre-a1");
    await page.locator("a[href*='/licoes/pre-a1/']").first().click();
    await page.waitForLoadState("networkidle");
  });

  test("botão 'ver gabarito' revela resposta do exercício", async ({ page }) => {
    // Localiza a seção de exercícios
    const exercSection = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: /exerc/i }) });

    await exercSection.scrollIntoViewIfNeeded();

    const gabaritoBtns = exercSection.getByRole("button", { name: "ver gabarito" });
    const total = await gabaritoBtns.count();

    expect(total).toBeGreaterThan(0);

    // Clica no primeiro gabarito
    await gabaritoBtns.first().click();

    // Após revelar, um botão a menos diz "ver gabarito"
    await expect(gabaritoBtns).toHaveCount(total - 1);
  });

  test("clicar duas vezes no gabarito fecha e reabre", async ({ page }) => {
    const exercSection = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: /exerc/i }) });

    const gabaritoBtns = exercSection.getByRole("button", { name: "ver gabarito" });
    const total = await gabaritoBtns.count();
    expect(total).toBeGreaterThan(0);

    // Abre
    await gabaritoBtns.first().click();
    await expect(gabaritoBtns).toHaveCount(total - 1);

    // Fecha — clica no botão que agora mostra a resposta (não tem texto "ver gabarito")
    const todosOsBotoes = exercSection.getByRole("button").filter({ hasNot: page.getByText("ver gabarito") });
    await todosOsBotoes.first().click();

    // Volta ao total original
    await expect(gabaritoBtns).toHaveCount(total);
  });
});

test.describe("Produção escrita", () => {
  test.beforeEach(async ({ page }) => {
    await loginComEmail(page);
    await page.goto("/licoes/pre-a1");
    await page.locator("a[href*='/licoes/pre-a1/']").first().click();
    await page.waitForLoadState("networkidle");
  });

  test("seção 'Tarefa de Produção Final' existe na lição", async ({ page }) => {
    const producaoSection = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: /produção/i }) });

    await expect(producaoSection).toBeVisible();
  });

  /**
   * Aguarda o ProducaoEscritaForm hidratar e o Firebase Auth inicializar.
   * O formulário renderiza null durante SSR (estado "carregando"); após hidratação
   * e onIdTokenChanged, transita para "vazio" e exibe o textarea.
   * Se já houver submissão anterior, entra em modo de edição.
   */
  async function aguardarFormulario(page: import("@playwright/test").Page) {
    const producaoSection = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: /produção/i }) });

    await producaoSection.scrollIntoViewIfNeeded();

    // 1. Aguarda hidratação React: o h3 "Sua produção escrita" aparece quando
    //    o componente sai do estado "carregando" (renderiza algo).
    await producaoSection
      .getByText("Sua produção escrita")
      .waitFor({ state: "visible", timeout: 20_000 });

    // 2. Aguarda Firebase Auth completar: textarea aparece quando user != null.
    //    Se o usuário já enviou algo, aparece o badge "Aguardando correção" em vez do textarea.
    const textarea = producaoSection.getByPlaceholder("Escreva aqui sua produção…");
    const statusPendente = producaoSection.getByText(/aguardando correção/i);

    // Espera por qualquer um dos dois (whichever appears first)
    await Promise.race([
      textarea.waitFor({ state: "visible", timeout: 15_000 }),
      statusPendente.waitFor({ state: "visible", timeout: 15_000 }),
    ]).catch(() => {
      // Se nenhum apareceu, o expect abaixo vai falhar com mensagem clara
    });

    // Se há submissão anterior, entra em modo de edição
    const btnEditar = producaoSection.getByRole("button", { name: /reenviar|nova versão/i });
    if (await btnEditar.isVisible({ timeout: 500 }).catch(() => false)) {
      await btnEditar.click();
      await expect(textarea).toBeVisible({ timeout: 5_000 });
    }

    return { producaoSection, textarea };
  }

  test("formulário de produção aceita texto e atualiza contador de palavras", async ({ page }) => {
    const { producaoSection, textarea } = await aguardarFormulario(page);

    await expect(textarea).toBeVisible();
    await textarea.fill("Olá mundo hoje está bom");
    await expect(producaoSection.getByText("5 palavras")).toBeVisible();
  });

  test("botão 'Enviar para correção' está presente e desabilitado sem texto", async ({ page }) => {
    const { producaoSection, textarea } = await aguardarFormulario(page);

    const btnEnviar = producaoSection.getByRole("button", { name: /enviar para correção/i });
    await expect(btnEnviar).toBeVisible();
    await expect(btnEnviar).toBeDisabled();

    // Após digitar, o botão habilita
    await textarea.fill("Olá");
    await expect(btnEnviar).toBeEnabled();
  });
});
