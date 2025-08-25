import {
  addErrorNotification,
  addInfoNotification,
  addSpinnerNotification,
  addStatusNotification,
  addSuccessNotification,
  notificationStore,
  removeNotification,
} from '@/store/notificationStore';

describe('notificationStore', () => {
  beforeEach(() => notificationStore.setState({ messages: [] }));

  it('adds a status notification', () => {
    addStatusNotification('Test', 'success', 'id1', true, 1000);
    expect(notificationStore.state.messages).toEqual([
      {
        id: 'id1',
        type: 'status',
        message: 'Test',
        variant: 'success',
        autoDismiss: true,
        timeout: 1000,
      },
    ]);
  });

  it('does not add duplicate status notification with same id', () => {
    addStatusNotification('Test', 'success', 'id1');
    addStatusNotification('Test2', 'danger', 'id1');
    expect(notificationStore.state.messages).toEqual([
      expect.objectContaining({ message: 'Test' }),
    ]);
  });

  it('adds a spinner notification', () => {
    addSpinnerNotification('Loading', 'spin1');
    expect(notificationStore.state.messages).toEqual([
      {
        id: 'spin1',
        type: 'spinner',
        message: 'Loading',
        autoDismiss: false,
      },
    ]);
  });

  it('adds a spinner notification without id and generates unique id', () => {
    addSpinnerNotification('Loading');
    const msg = notificationStore.state.messages[0];
    expect(msg.type).toBe('spinner');
    expect(msg.message).toBe('Loading');
    expect(msg.autoDismiss).toBe(false);
    expect(['string', 'number']).toContain(typeof msg.id);
  });

  it('removes a notification by id', () => {
    addStatusNotification('Test', 'success', 'id1');
    removeNotification('id1');
    expect(notificationStore.state.messages).toHaveLength(0);
  });

  it.each([
    [addSuccessNotification, 'success'],
    [addInfoNotification, 'info'],
    [addErrorNotification, 'danger'],
  ])('adds a %s notification', (fn, variant) => {
    fn('Msg', 'id');
    const msg = notificationStore.state.messages[0];
    expect(msg.type).toBe('status');
    if (msg.type === 'status') {
      expect(msg.variant).toBe(variant);
    }
  });

  it.each([
    [addSpinnerNotification, 'Loading', 'spin1'],
    [addSpinnerNotification, 'Loading again', 'spin1'],
  ])(
    'does not add duplicate spinner notification with same id',
    (fn, msg, id) => {
      fn(msg, id);
      fn(msg + ' again', id);
      const messages = notificationStore.state.messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].message).toBe(msg);
    },
  );

  it('does not add status notification if id already exists (early return branch)', () => {
    addStatusNotification('First', 'success', 'id1');
    addStatusNotification('Second', 'danger', 'id1');
    const msg = notificationStore.state.messages[0];
    expect(notificationStore.state.messages).toHaveLength(1);
    expect(msg.message).toBe('First');
    if (msg.type === 'status') {
      expect(msg.variant).toBe('success');
    }
  });
});
