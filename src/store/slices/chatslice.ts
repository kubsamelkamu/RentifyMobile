import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import socket from '../../utils/socket';

export interface Message {
  id: string;
  propertyId: string;
  senderId: string;
  senderName?: string;
  content: string;
  createdAt: string;
  editedAt?: string;
  deleted?: boolean;
}

export interface TypingStatus {
  userId: string;
  isTyping: boolean;
}

interface ChatState {
  messages: Record<string, Message[]>;
  typing: Record<string, TypingStatus[]>; 
  presence: Record<string, 'online' | 'offline'>;
  loading: boolean;
  error?: string;
}

const initialState: ChatState = {
  messages: {},
  typing: {},
  presence: {},
  loading: false,
  error: undefined,
};

export const sendMessage = createAsyncThunk<
  Message,
  { propertyId: string; content: string }
>('chat/sendMessage', async ({ propertyId, content }, { rejectWithValue }) => {
  return new Promise<Message>((resolve, reject) => {
    socket.emit('sendMessage', { propertyId, content }, (res) => {
      if (res && typeof res === 'object') resolve(res as Message);
      else reject('Failed to send message');
    });
  }).catch((err) => rejectWithValue(err));
});

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      const msg = action.payload;
      if (!state.messages[msg.propertyId]) state.messages[msg.propertyId] = [];
      const exists = state.messages[msg.propertyId].some((m) => m.id === msg.id);
      if (!exists) state.messages[msg.propertyId].push(msg);
    },
    editMessage: (
      state,
      action: PayloadAction<{ propertyId: string; messageId: string; newContent: string }>
    ) => {
      const { propertyId, messageId, newContent } = action.payload;
      const msgs = state.messages[propertyId];
      if (msgs) {
        const msg = msgs.find((m) => m.id === messageId);
        if (msg) {
          msg.content = newContent;
          msg.editedAt = new Date().toISOString();
        }
      }
    },
    deleteMessage: (state, action: PayloadAction<{ propertyId: string; messageId: string }>) => {
      const { propertyId, messageId } = action.payload;
      const msgs = state.messages[propertyId];
      if (msgs) {
        const msg = msgs.find((m) => m.id === messageId);
        if (msg) msg.deleted = true;
      }
    },
    setTyping: (state, action: PayloadAction<{ propertyId: string; typing: TypingStatus }>) => {
      const { propertyId, typing } = action.payload;
      if (!state.typing[propertyId]) state.typing[propertyId] = [];
      const idx = state.typing[propertyId].findIndex((t) => t.userId === typing.userId);
      if (idx > -1) state.typing[propertyId][idx] = typing;
      else state.typing[propertyId].push(typing);
    },
    setPresence: (state, action: PayloadAction<{ userId: string; status: 'online' | 'offline' }>) => {
      state.presence[action.payload.userId] = action.payload.status;
    },
    setMessages: (state, action: PayloadAction<{ propertyId: string; messages: Message[] }>) => {
      const uniqueMessages = Array.from(new Map(action.payload.messages.map(m => [m.id, m])).values());
      state.messages[action.payload.propertyId] = uniqueMessages;
    },
    clearChat: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(sendMessage.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.loading = false;
      const msg = action.payload;
      if (!state.messages[msg.propertyId]) state.messages[msg.propertyId] = [];
      const exists = state.messages[msg.propertyId].some((m) => m.id === msg.id);
      if (!exists) state.messages[msg.propertyId].push(msg);
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  addMessage,
  editMessage,
  deleteMessage,
  setTyping,
  setPresence,
  setMessages,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
