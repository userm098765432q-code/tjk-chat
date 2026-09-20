// Санҷишҳои профил: ном, сурат, ранг, тасдиқ ва Escape
const RED_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("TJK CHAT — Профил", () => {
  beforeEach(() => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.clear();
        win.localStorage.setItem(
          "tjkchat_user",
          JSON.stringify({ firstName: "Сино", lastName: "Каримов", phone: "+992 93 555 0101", email: "sino@example.tj" })
        );
      }
    });
    cy.get("#meName").should("have.text", "Сино Каримов");
  });

  it("модал аз сорбар кушода мешавад ва маълумот пур мекунад", () => {
    cy.get("#profileBtn").click();
    cy.get("#profileModal").should("be.visible");
    cy.get("#pFirstName").should("have.value", "Сино");
    cy.get("#pLastName").should("have.value", "Каримов");
    cy.get("#pPhone").should("have.value", "+992 93 555 0101");
    cy.get("#pEmail").should("have.value", "sino@example.tj");
  });

  it("ном иваз мешавад, аватар ва нигоҳдорӣ дуруст кор мекунанд", () => {
    cy.get("#profileBtn").click();
    cy.get("#pFirstName").clear().type("Сафар");
    cy.get("#pLastName").clear().type("Юсупов");
    cy.get("#profileSave").click();

    cy.get("#profileModal").should("not.be.visible");
    cy.get("#meName").should("have.text", "Сафар Юсупов");
    cy.get("#meAvatar").should("have.text", "СЮ");

    cy.reload();
    cy.get("#meName").should("have.text", "Сафар Юсупов");
    cy.get("#meAvatar").should("have.text", "СЮ");
  });

  it("номи кӯтоҳ радд мешавад ва захира намешавад", () => {
    cy.get("#profileBtn").click();
    cy.get("#pFirstName").clear().type("С");
    cy.get("#profileSave").click();

    cy.get("#err-pFirstName").should("contain.text", "2 ҳарф");
    cy.get("#profileModal").should("be.visible");

    cy.reload();
    cy.get("#meName").should("have.text", "Сино Каримов");
  });

  it("ранг интихоб мешавад ва баъди reload боқӣ мемонад", () => {
    cy.get("#profileBtn").click();
    cy.get("#colorRow .color-swatch").should("have.length", 8);
    cy.get("#colorRow .color-swatch").eq(2).click();
    cy.get("#colorRow .color-swatch.selected").should("have.length", 1);
    cy.get("#profileSave").click();

    // браузер gradient-ро ба rgb() меорад
    cy.get("#meAvatar").should("have.attr", "style").and("contain", "rgb(34, 211, 238)");

    cy.reload();
    cy.get("#meAvatar").should("have.attr", "style").and("contain", "rgb(34, 211, 238)");
  });

  it("сурат гузошта, нигоҳдорӣ ва нест кардан мумкин аст", () => {
    cy.get("#profileBtn").click();
    cy.get("#profilePhotoInput").selectFile(
      { contents: Cypress.Buffer.from(RED_PIXEL.split(",")[1], "base64"), mimeType: "image/png", lastModified: Date.now() },
      { force: true }
    );

    cy.get("#profileAvatar img").should("exist");
    cy.get("#removePhotoBtn").should("be.visible");
    cy.get("#profileSave").click();

    cy.get("#meAvatar img").should("exist");
    cy.window().then(win => {
      const u = JSON.parse(win.localStorage.getItem("tjkchat_user"));
      expect(u.avatar).to.match(/^data:image\/jpeg/);
    });

    cy.reload();
    cy.get("#meAvatar img").should("exist");

    // нест кардани сурат → боз интихолҳо
    cy.get("#profileBtn").click();
    cy.get("#removePhotoBtn").click();
    cy.get("#profileSave").click();
    cy.get("#meAvatar img").should("not.exist");
    cy.get("#meAvatar").should("have.text", "СК");
  });

  it("телефон ва email низ тасдиқ мешаванд", () => {
    cy.get("#profileBtn").click();
    cy.get("#pEmail").clear().type("бедомен");
    cy.get("#profileSave").click();
    cy.get("#err-pEmail").should("contain.text", "Email");

    cy.get("#pEmail").clear().type("sino@tj.tj");
    cy.get("#profileSave").click();
    cy.get("#profileModal").should("not.be.visible");
  });

  it("Escape модалро бе захира мепӯшад", () => {
    cy.get("#profileBtn").click();
    cy.get("#pLastName").clear().type("Тағйирёфта");
    cy.get("body").type("{esc}");

    cy.get("#profileModal").should("not.be.visible");
    cy.get("#meName").should("have.text", "Сино Каримов");
  });
});
