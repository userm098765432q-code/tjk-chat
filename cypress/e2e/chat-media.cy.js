// Санҷишҳои расона: фиристодани сурат, панели эмодзи, бекоркунии ҷавоб

const RED_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

// сурат бевосита ба маълумот ворид мешавад (реал-FileReader дар headless ишкол медиҳад);
// пас аз reload `loadChats()` онро аз storage мехонад.
function seedImage() {
  cy.window().then(win => {
    const saved = JSON.parse(win.localStorage.getItem("tjkchat_chats") || "{}");
    saved.daler = saved.daler || [];
    saved.daler.push({ from: "me", img: RED_PIXEL, text: "", time: "12:00" });
    win.localStorage.setItem("tjkchat_chats", JSON.stringify(saved));
  });
  cy.reload();
  cy.get("#meName").should("have.text", "Сино Каримов");
  cy.contains(".chat-item", "Далер Назаров").click();
  cy.get("#messages .msg-img").should("have.length", 1);
}

describe("TJK CHAT — расона ва панели эмодзи", () => {
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

  it("сурат фиристода мешавад: bubble бо `<img>`, тик ✓, input-и файл тоза мешавад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    // users click 📎 which opens the hidden fileInput — force is the standard pattern
    cy.get("#fileInput").selectFile(
      { contents: Cypress.Buffer.from("fake-image-bytes"), mimeType: "image/png", lastModified: Date.now() },
      { force: true }
    );

    cy.get("#messages .msg:has(.msg-img)").should("have.length", 1);
    cy.get("#messages .msg-img").should("have.attr", "src").and("match", /^data:image\//);
    cy.get("#messages .msg:has(.msg-img)").find(".tick").should("contain.text", "✓");
    cy.get("#fileInput").should("have.value", "");
  });

  it("сурати фиристодашуда баъди reload боқӣ мемонад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#fileInput").selectFile(
      { contents: Cypress.Buffer.from("fake-image-bytes"), mimeType: "image/png" },
      { force: true }
    );
    cy.get("#messages .msg-img").should("have.length", 1);

    cy.reload();
    cy.get("#meName").should("have.text", "Сино Каримов");
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#messages .msg-img").should("have.length", 1);
    cy.get("#messages .msg-img").should("have.attr", "src").and("match", /^data:image\//);
  });

  it("ҷавоб ба сурат «📷 Сурат» менависад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    seedImage();

    cy.get("#messages .msg").last().find('[data-act="reply"]').click();
    cy.get("#replyText").should("contain.text", "Сурат");
    cy.get("#cancelReply").click();
  });

  it("бекоркунии ҷавоб: панел пӯшида мешавад, паёми нав иқтибос надорад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#input").type("барои ҷавоб");
    cy.get("#composer").submit();

    cy.get('#messages .msg [data-act="reply"]').last().click();
    cy.get("#replyBar").should("be.visible");

    cy.get("#cancelReply").click();
    cy.get("#replyBar").should("not.be.visible");

    cy.get("#input").type("бе иқтибос");
    cy.get("#composer").submit();
    cy.get("#messages .quote").should("not.exist");
  });

  it("Escape панели эмодзи-ро мепӯшад, баъд ҷавобро бекор мекунад (як қабат дар як бор)", () => {
    cy.contains(".chat-item", "Далер Назаров").click();

    cy.get('#messages .msg [data-act="reply"]').last().click();
    cy.get("#replyBar").should("be.visible");
    cy.get("#emojiBtn").click();
    cy.get("#emojiPanel").should("be.visible");

    // Escape №1 — танҳо панели эмодзи
    cy.get("body").type("{esc}");
    cy.get("#emojiPanel").should("not.be.visible");
    cy.get("#replyBar").should("be.visible");

    // Escape №2 — ҷавоб бекор мешавад
    cy.get("body").type("{esc}");
    cy.get("#replyBar").should("not.be.visible");

    cy.get("#input").type("бе иқтибос");
    cy.get("#composer").submit();
    cy.get("#messages .quote").should("not.exist");
  });

  it("гузариш ба чати дигар ҷавобро бекор мекунад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get('#messages .msg [data-act="reply"]').last().click();
    cy.get("#replyBar").should("be.visible");

    cy.contains(".chat-item", "Фирӯза Раҳимова").click();
    cy.get("#replyBar").should("not.be.visible");
  });

  it("панели эмодзи кушода мешавад, эмодзи ба input илова ва фиристода мешавад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();

    cy.get("#emojiPanel").should("not.be.visible");
    cy.get("#emojiBtn").click();
    cy.get("#emojiPanel").should("be.visible");

    cy.get("#emojiPanel button[data-e]").first().then($b => {
      const emoji = $b.text();
      cy.wrap($b).click();
      cy.get("#input").should("have.value", emoji);
      cy.get("#input").type(" аз панели эмодзи");
      cy.get("#composer").submit();
      cy.get("#messages .msg").last().should("contain.text", `${emoji} аз панели эмодзи`);
    });
  });

  it("дучоракардани панели эмодзи ҳолатро иваз мекунад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();

    cy.get("#emojiBtn").click();
    cy.get("#emojiPanel").should("be.visible");
    cy.get("#emojiBtn").click();
    cy.get("#emojiPanel").should("not.be.visible");
  });
});
