// Санҷишҳои чат: фиристодани паём, ҷавоб, паёми овозӣ, нест кардан, нигоҳдорӣ
const VOICE_DURL =
  "data:audio/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSrmcIA/yJyagcEA9ElU1kYm5QJCEpkogAAAAAAAAAAAAAAAAAAAAAAC0mV0mV0mggAAgAAgAA";

// паёми овозӣ бевосита ба маълумот илова мешавад (реал-сабт дар headless имконнопазир).
// CONTACTS/appendBubble бо const эълон шудаанд — тавассути localStorage + reload ворид мекунем,
// зеро loadChats() онҳоро аз storage мехонад.
function seedVoice() {
  cy.window().then(win => {
    const saved = JSON.parse(win.localStorage.getItem("tjkchat_chats") || "{}");
    saved.daler = saved.daler || [];
    saved.daler.push({ from: "me", audio: VOICE_DURL, dur: 7, text: "", time: "12:00" });
    win.localStorage.setItem("tjkchat_chats", JSON.stringify(saved));
  });
  cy.reload();
  cy.get("#meName").should("have.text", "Сино Каримов");
  cy.contains(".chat-item", "Далер Назаров").click();
  cy.get("#messages .voice").should("have.length", 1);
}

describe("TJK CHAT — Ҷараёни чат (smoke)", () => {
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

  it("паём фиристода мешавад: push, тозаи input, тик ✓", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#input").type("Салом, Далер!");
    cy.get("#composer").submit();

    cy.get("#input").should("have.value", "");
    cy.get("#messages .msg").should("have.length", 3); // 2 demo + 1 нав
    cy.get("#messages .msg").last().should("contain.text", "Салом, Далер!");
    cy.get("#messages .msg").last().find(".tick").should("contain.text", "✓");
  });

  it("ҷавоби худкор меояд ва тикҳо ✓✓ кабуд мешаванд", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#input").type("тик-тест");
    cy.get("#composer").submit();

    // autoReply баъди ~2-3.5s: паёми нави "them"
    cy.get("#messages .msg.them", { timeout: 6000 }).should("have.length.at.least", 1);
    // тикҳои паёми мо хондашуда (кабуд) мешаванд
    cy.get("#messages .tick.read", { timeout: 6000 }).should("have.length.at.least", 1);
    // индикатори typing нест шудааст
    cy.get("#typing").should("not.exist");
  });

  it("ҷавоб (reply) бо иқтибос кор мекунад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#input").type("Паёми аввал");
    cy.get("#composer").submit();

    // ба паёми худи худ ҷавоб медиҳем — иқтибос бояд «Паёми аввал»-ро нишон диҳад
    cy.get('#messages .msg [data-act="reply"]').last().click();
    cy.get("#replyBar").should("be.visible");
    cy.get("#replyText").should("contain.text", "Паёми аввал");

    cy.get("#input").type("Ин ҷавоб аст");
    cy.get("#composer").submit();

    cy.get("#messages .quote").should("contain.text", "Паёми аввал");
    cy.get("#messages .msg").last().should("contain.text", "Ин ҷавоб аст");
    cy.get("#replyBar").should("be.hidden");
    cy.get("#replyBar").should("not.be.visible");
  });

  it("паёми овозӣ render мешавад: play, мавҷҳо, давомнокӣ", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    seedVoice();

    cy.get("#messages .voice").should("have.length", 1);
    cy.get(".voice-play").should("exist");
    cy.get(".voice-wave i").should("have.length", 18);
    cy.get(".voice-time").should("have.text", "0:07");
  });

  it("ҷавоб ба овоз «🎙 Овоз» менависад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    seedVoice();

    cy.get("#messages .msg").last().find('[data-act="reply"]').click();
    cy.get("#replyText").should("contain.text", "Овоз");
    cy.get("#cancelReply").click();
  });

  it("нест кардани паём: placeholder ва тозаи audio", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    seedVoice();

    cy.get("#messages .msg").last().find('[data-act="del"]').click();

    cy.get("#messages .deleted").should("contain.text", "нест карда шуд");
    cy.get("#messages .voice").should("not.exist");
    cy.get("#messages .msg").last().find(".acts").should("not.exist");
  });

  it("паёмҳо дар localStorage нигоҳ дошта мешаванд ва баъди reload боқӣ мемонанд", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#input").type("паёми мондагор");
    cy.get("#composer").submit();

    cy.window().then(win => {
      const saved = JSON.parse(win.localStorage.getItem("tjkchat_chats"));
      expect(saved.daler.some(m => m.text === "паёми мондагор"), "message saved").to.be.true;
    });

    cy.reload();
    cy.get("#meName").should("have.text", "Сино Каримов");
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#messages .msg").last().should("contain.text", "паёми мондагор");
  });

  it("нестшудан баъди reload ҳамсоно «нестшуда» мемонад", () => {
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#input").type("партоф");
    cy.get("#composer").submit();
    cy.get("#messages .msg").last().find('[data-act="del"]').click();

    cy.reload();
    cy.contains(".chat-item", "Далер Назаров").click();
    cy.get("#messages .deleted").should("exist");
  });
});
