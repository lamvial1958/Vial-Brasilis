import { test, expect } from "@playwright/test";
import { loginComEmail } from "./helpers/login";

test.describe("Autenticação", () => {
  test("login com e-mail redireciona para /licoes", async ({ page }) => {
    await loginComEmail(page);

    await expect(page).toHaveURL(/\/licoes/);
    await expect(page.getByRole("heading", { name: "Lições" })).toBeVisible();
  });

  test("página /licoes sem login redireciona para /login", async ({ page }) => {
    await page.goto("/licoes");
    await expect(page).toHaveURL(/\/login/);
  });

  test("página de login é acessível sem autenticação", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Entrar com e-mail" })).toBeVisible();
  });
});
