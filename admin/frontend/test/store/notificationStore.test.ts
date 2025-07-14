import {
  notificationStore,
  addNotification,
  removeNotification,
  addSuccessNotification,
  addErrorNotification,
} from "@/store/notificationStore";

describe("notificationStore", () => {
  beforeEach(() => {
    notificationStore.setState({ messages: [] });
  });

  it("adds a notification", () => {
    addNotification("Test message", "info", 1, false, 5000);
    const { messages } = notificationStore.state;
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 1,
      message: "Test message",
      variant: "info",
      autoDismiss: false,
      timeout: 5000,
    });
  });

  it("deduplicates notifications by id", () => {
    addNotification("First", "info", 2);
    addNotification("Second", "info", 2);
    const { messages } = notificationStore.state;
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toBe("First");
  });

  it("removes a notification by id", () => {
    addNotification("To remove", "info", 3);
    removeNotification(3);
    expect(notificationStore.state.messages).toHaveLength(0);
  });

  it("addSuccessNotification sets variant to success", () => {
    addSuccessNotification("Success!", 4);
    const msg = notificationStore.state.messages.find((m) => m.id === 4);
    expect(msg).toBeTruthy();
    expect(msg?.variant).toBe("success");
  });

  it("addErrorNotification sets variant to danger", () => {
    addErrorNotification("Error!", 5);
    const msg = notificationStore.state.messages.find((m) => m.id === 5);
    expect(msg).toBeTruthy();
    expect(msg?.variant).toBe("danger");
  });

  it("generates a unique id if not provided", () => {
    addNotification("No id");
    const { messages } = notificationStore.state;
    expect(messages[0].id).toBeDefined();
  });
});
