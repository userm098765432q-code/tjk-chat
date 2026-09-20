// Санҷишҳои иловагӣ: мавзӯъ, санаҳо, паёмнавис, пешфиристодан, нусха, мут, экспорт, тозакунӣ, ҷустуҷӯ
describe("TJK CHAT — Вазифаҳои иловагӣ", () => {
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

  it("мавзӯъи равшан фаъол мешавад ва баъди reload боқӣ мемонад", () => {
    cy.get("#settingsBtn").click();
    cy.get("#themeToggle").check({ force: true });
    cy.get("html").should("have.class", "light");
    cy.get("body").type("{esc}");

    cy.reload();
    cy.get("#meName").should("have.text", "Сино Каримов");
    cy.get("html").should("have.class", "light");
  });

  it("ҷудокунандаи сана «Бугун» барои паёми нав нишон дода мешавад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#input").type("паёми имрӯза");
    cy.get("#composer").submit();

    cy.get(".day-divider").should("have.length", 1);
    cy.get(".day-divider").should("have.text", "Бугун");
  });

  it("паёмнавис ба ҳар чат алоҳида нигоҳ дошта мешавад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#input").type("сабти барои Далер");

    cy.contains(".chat-item", "Фирӯза Раҳимова").click();
    cy.get("#input").should("have.value", "");

    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#input").should("have.value", "сабти барои Далер");

    // баъди reload ҳам боқӣ мемонад
    cy.reload();
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#input").should("have.value", "сабти барои Далер");

    // баъди фиристодан тоза мешавад
    cy.get("#composer").submit();
    cy.get("#input").should("have.value", "");
    cy.reload();
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#input").should("have.value", "");
  });

  it("паём ба чати дигар пеш фиристода мешавад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#messages .msg").last().find('[data-act="fwd"]').click();
    cy.get("#forwardModal").should("be.visible");

    cy.contains(".forward-item", "Фирӯза Раҳимова").click();
    cy.get("#forwardModal").should("not.be.visible");
    cy.get("#toast").should("contain.text", "Фирӯза");

    // unread ба чати қабулкунанда (Фирӯза: 2 демо + 1 нав) афзоиш мекунад
    cy.contains(".chat-item", "Фирӯза Раҳимова").find(".badge").should("have.text", "3");

    cy.contains(".chat-item", "Фирӯза Раҳимова").click();
    cy.get("#messages .msg").last().should("contain.text", "Китобро фиристодам 📚");
  });

  it("нусха гирифтани матни паём кор мекунад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.window().then(win => cy.stub(win.navigator.clipboard, "writeText").resolves());

    cy.get('#messages .msg [data-act="copy"]').first().click();
    cy.get("#toast").should("contain.text", "Нусха гирифт шуд");
  });

  it("хомӯш кардани чат нигоҳ дошта мешавад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#muteBtn").click();
    cy.get("#muteBtn").should("have.text", "🔕");
    cy.contains(".chat-item", "Далер Назаров").find(".mute-mark").should("exist");

    cy.reload();
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#muteBtn").should("have.text", "🔕");
    cy.window().then(win => {
      const flags = JSON.parse(win.localStorage.getItem("tjkchat_chatflags"));
      expect(flags.daler.muted, "muted persisted").to.be.true;
    });
  });

  it("экспорти чат файл месозад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.window().then(win => {
      cy.stub(win.URL, "createObjectURL").returns("blob:fake");
      cy.stub(win.URL, "revokeObjectURL");
    });
    cy.get("#exportBtn").click();
    cy.window().then(win => {
      expect(win.URL.createObjectURL).to.have.been.calledOnce;
    });
    cy.get("#toast").should("contain.text", "Экспорт");
  });

  it("тозакунӣ бо тасдиқи ду-клика кор мекунад ва баъди reload чат холӣ мемонад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#clearBtn").click();
    cy.get("#clearBtn").should("have.text", "Тасдиқ?");

    cy.wait(400);
    cy.get("#clearBtn").click();
    cy.get("#toast").should("contain.text", "тоза шуд");
    cy.get("#messages .empty-chat").should("exist");

    cy.reload();
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#messages .empty-chat").should("exist");
    cy.get("#messages .msg").should("have.length", 0);
  });

  it("ҷустуҷӯ матни паёмҳоро ҳам меёбад", () => {
    cy.get("#search").type("машғулият");
    cy.get("#chatList .chat-item").should("have.length", 1);
    cy.get("#chatList .chat-item").should("contain.text", "Мадина");

    cy.get("#search").clear();
    cy.get("#chatList .chat-item").should("have.length", 5);
  });

  it("унвони қуттии шумораи хонда нашударо нишон медиҳад", () => {
    cy.title().should("eq", "TJK CHAT (3)"); // Фирӯза 2 + Мадина 1

    cy.contains(".chat-item", "Фирӯза Раҳимова").click();
    cy.title().should("eq", "TJK CHAT (1)");
  });
});
