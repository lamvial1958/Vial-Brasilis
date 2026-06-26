import type { Page } from "@playwright/test";

/**
 * Faz login via UI com as credenciais em .env.test.local.
 * Aguarda o redirect para /licoes antes de retornar.
 */
export async function loginComEmail(page: Page): Promise<void> {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Credenciais ausentes. Crie platform/.env.test.local com:\n" +
      "  TEST_USER_EMAIL=aluno@exemplo.com\n" +
      "  TEST_USER_PASSWORD=senha123\n"
    );
  }

  await page.goto("/login");
  await page.getByPlaceholder("E-mail").fill(email);
  await page.getByPlaceholder("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar com e-mail" }).click();
  await page.waitForURL(/\/licoes/, { timeout: 15_000 });
}
