// Санҷишҳои танзимот, қулфи PIN ва пайвандҳои иҷтимоӣ
describe("TJK CHAT — Танзимот, қулф ва иҷтимоӣ", () => {
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

  it("⚙ танзимотро мекушояд: бахшҳо, свочҳо ва ҳолати пешфарз", () => {
    cy.get("#settingsBtn").click();
    cy.get("#settingsModal").should("be.visible");
    cy.get("#accentRow .color-swatch").should("have.length", 5);
    cy.get("#wpRow .wp-swatch").should("have.length", 4);
    cy.get("#fontSel").should("have.value", "14.5");
    cy.get("#soundToggle").should("be.checked");
    cy.get("#autoReplyToggle").should("be.checked");
    cy.get("#pinState").should("have.text", "Хомӯш");
    cy.get("#pinChangeBtn").should("have.text", "ГУЗОШТАНИ PIN");
  });

  it("ранги асосӣ --gold-ро иваз мекунад ва баъди reload боқӣ мемонад", () => {
    cy.get("#settingsBtn").click();
    cy.get("#accentRow [data-a='blue']").click();
    cy.get("body").type("{esc}");

    cy.window().then(win =>
      expect(win.document.documentElement.style.getPropertyValue("--gold")).to.eq("#4f8cff")
    );

    cy.reload();
    cy.get("#meName").should("have.text", "Сино Каримов");
    cy.window().then(win =>
      expect(win.document.documentElement.style.getPropertyValue("--gold")).to.eq("#4f8cff")
    );
  });

  it("ҳарфи паём ва заминаи чат иваз мешаванд ва боқӣ мемонанд", () => {
    cy.get("#settingsBtn").click();
    cy.get("#fontSel").select("16");
    cy.get("#wpRow [data-w='wp-gold']").click();
    cy.get("body").type("{esc}");

    cy.window().then(win =>
      expect(win.document.documentElement.style.getPropertyValue("--msg-font")).to.eq("16px")
    );
    cy.get("#messages").should("have.class", "wp-gold");

    cy.reload();
    cy.get("#meName").should("have.text", "Сино Каримов");
    cy.window().then(win =>
      expect(win.document.documentElement.style.getPropertyValue("--msg-font")).to.eq("16px")
    );
    cy.get("#messages").should("have.class", "wp-gold");
  });

  it("ҷавоби корбари дуюмро хомӯш кардан мумкин аст", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#settingsBtn").click();
    cy.get("#autoReplyToggle").uncheck({ force: true });
    cy.get("body").type("{esc}");

    cy.get("#input").type("бе ҷавоб");
    cy.get("#composer").submit();

    cy.get("#messages .msg").last().should("contain.text", "бе ҷавоб");
    cy.wait(4500);
    // паёми нави «them» намеояд
    cy.get("#messages .msg.them").should("have.length", 1);
  });

  it("садо ва ҷавоб дар localStorage нигоҳ дошта мешаванд", () => {
    cy.get("#settingsBtn").click();
    cy.get("#soundToggle").uncheck({ force: true });
    cy.window().then(win => {
      const s = JSON.parse(win.localStorage.getItem("tjkchat_settings"));
      expect(s.sound, "sound off saved").to.be.false;
    });

    cy.reload();
    cy.get("#settingsBtn").click();
    cy.get("#soundToggle").should("not.be.checked");
  });

  it("PIN гузошта мешавад; қулф фавран ва баъди reload кор мекунад", () => {
    cy.get("#settingsBtn").click();
    cy.get("#pinChangeBtn").click();
    cy.get("#pinNew").type("1234");
    cy.get("#pinConfirm").type("1234");
    cy.get("#pinSetBtn").click();
    cy.get("#pinState").should("have.text", "Фаъол");
    cy.get("body").type("{esc}");

    // қулфи фавран
    cy.get("#lockBtn").click();
    cy.get("#lockScreen").should("be.visible");
    cy.get("#lockName").should("have.text", "Сино Каримов");

    // PIN-и нодуруст
    for (let i = 0; i < 4; i++) cy.get("#lockPad [data-k='9']").click();
    cy.get("#lockErr").should("contain.text", "нодуруст");
    cy.get("#lockScreen").should("be.visible");

    // PIN-и дуруст
    ["1", "2", "3", "4"].forEach(k => cy.get(`#lockPad [data-k='${k}']`).click());
    cy.get("#lockScreen").should("not.be.visible");

    // баъди reload қулф боз фаъол аст
    cy.reload();
    cy.get("#lockScreen").should("be.visible");
    ["1", "2", "3", "4"].forEach(k => cy.get(`#lockPad [data-k='${k}']`).click());
    cy.get("#lockScreen").should("not.be.visible");

    // хомӯш кардани қулф
    cy.get("#settingsBtn").click();
    cy.get("#pinOffBtn").should("be.visible").click();
    cy.get("#pinState").should("have.text", "Хомӯш");
    cy.reload();
    cy.get("#lockScreen").should("not.be.visible");
  });

  it("PIN-и номувофиқ ё кӯтоҳ радд мешавад", () => {
    cy.get("#settingsBtn").click();
    cy.get("#pinChangeBtn").click();
    cy.get("#pinNew").type("12");
    cy.get("#pinConfirm").type("12");
    cy.get("#pinSetBtn").click();
    cy.get("#pinErr").should("contain.text", "4 рақам");

    cy.get("#pinNew").clear().type("1234");
    cy.get("#pinConfirm").clear().type("9999");
    cy.get("#pinSetBtn").click();
    cy.get("#pinErr").should("contain.text", "мувофиқ нестанд");
    cy.get("#pinState").should("have.text", "Хомӯш");
  });

  it("Instagram ва Telegram дар профил нигоҳ дошта мешаванд", () => {
    cy.get("#profileBtn").click();
    cy.get("#pInstagram").type("sino.tj");
    cy.get("#pTelegram").type("sino_tj");
    cy.get("#profileSave").click();

    cy.get("#meSocial").find("a[href='https://instagram.com/sino.tj']").should("exist");
    cy.get("#meSocial").find("a[href='https://t.me/sino_tj']").should("exist");

    cy.reload();
    cy.get("#meSocial").find("a[href='https://instagram.com/sino.tj']").should("exist");
  });
});
