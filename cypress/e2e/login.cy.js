describe("TJK CHAT — Ҷараёни даромадан (smoke)", () => {
  beforeEach(() => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.clear();
      }
    });
  });

  it("пардаи даромадан бо ҳамаи майдонҳо намоён аст", () => {
    cy.contains(".auth-title", "TJK");
    cy.get("#authForm").should("be.visible");
    cy.get("#firstName").should("be.visible");
    cy.get("#lastName").should("be.visible");
    cy.get("#phone").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#app").should("not.be.visible");
  });

  it("формаи холӣ 4 паёми хато нишон медиҳад ва даромадан намешавад", () => {
    cy.get(".auth-btn").click();
    cy.get(".err").filter(":not(:empty)").should("have.length", 4);
    cy.get("#authScreen").should("be.visible");
  });

  it("тасдиқи майдонҳо: кӯтоҳ ном, телефон ва email-и нодуруст радд мешаванд", () => {
    cy.get("#firstName").type("А");
    cy.get("#lastName").type("Ш");
    cy.get("#phone").type("+992 92-123-4567");
    cy.get("#email").type("not-an-email");
    cy.get(".auth-btn").click();
    cy.get(".err").filter(":not(:empty)").should("have.length", 4);
  });

  it("бо маълумоти дуруст даромадан мумкин аст", () => {
    cy.get("#firstName").type("Сано");
    cy.get("#lastName").type("Шарипов");
    cy.get("#phone").type("+992 55 500 1122");
    cy.get("#email").type("sano@example.tj");
    cy.get(".auth-btn").click();

    cy.get("#authScreen").should("not.be.visible");
    cy.get("#app").should("be.visible");
    cy.get("#meName").should("have.text", "Сано Шарипов");
    cy.get("#meAvatar").should("have.text", "СШ");
    cy.get(".chat-item").should("have.length", 5);
  });

  it("корбар дар localStorage сабт мешавад ва баъди навсозӣ ҳамсоно даристемааст", () => {
    cy.get("#firstName").type("Сино");
    cy.get("#lastName").type("Каримов");
    cy.get("#phone").type("+992 93 555 0101");
    cy.get("#email").type("sino@example.tj");
    cy.get(".auth-btn").click();
    cy.get("#meName").should("have.text", "Сино Каримов");

    cy.window().then(win => {
      const u = JSON.parse(win.localStorage.getItem("tjkchat_user"));
      expect(u.firstName).to.eq("Сино");
      expect(u.phone).to.eq("+992 93 555 0101");
    });

    cy.reload();
    cy.get("#authScreen").should("not.be.visible");
    cy.get("#meName").should("have.text", "Сино Каримов");
  });

  it("корбари вайроншудаи localStorage бе crash ба пардаи даромадан бармегардад", () => {
    cy.window().then(win => {
      win.localStorage.setItem("tjkchat_user", JSON.stringify({ lastName: "Бе-ном" }));
    });
    cy.reload();
    cy.get("#authScreen").should("be.visible");
    cy.get("#app").should("not.be.visible");
  });

  it("JSON-и вайрон дар localStorage бе crash радд мешавад", () => {
    cy.window().then(win => {
      win.localStorage.setItem("tjkchat_user", "{broken");
    });
    cy.reload();
    cy.get("#authScreen").should("be.visible");
  });

  it("тугмаи баромадан ҳолатро тоза мекунад", () => {
    cy.get("#firstName").type("Далер");
    cy.get("#lastName").type("Назаров");
    cy.get("#phone").type("+992 92 111 2233");
    cy.get("#email").type("daler@example.tj");
    cy.get(".auth-btn").click();
    cy.get("#meName").should("have.text", "Далер Назаров");

    cy.get("#logoutBtn").click();
    cy.get("#authScreen").should("be.visible");
    cy.window().then(win => {
      expect(win.localStorage.getItem("tjkchat_user")).to.eq(null);
    });
  });
});
