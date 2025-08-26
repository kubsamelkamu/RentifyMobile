import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {View,Text,FlatList,TextInput,TouchableOpacity,StyleSheet,KeyboardAvoidingView,Platform,Alert,SafeAreaView,StatusBar,Modal,TouchableWithoutFeedback,Dimensions,} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import socket from '../../utils/socket';
import {addMessage,editMessage as editMessageAction,deleteMessage as deleteMessageAction,setTyping,setPresence,sendMessage,Message} from '../../store/slices/chatslice';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { TenantStackParamList } from '../../navigation/TenantTabNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PropertyChatRouteProp = RouteProp<TenantStackParamList, 'PropertyChat'>;

const { width } = Dimensions.get('window');

export default function PropertyChatScreen() {

  const route = useRoute<PropertyChatRouteProp>();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { propertyId, landlordId } = route.params;
  const {  user } = useSelector((state: RootState) => state.auth);
  const { messages, typing, presence } = useSelector((state: RootState) => state.chat);
  const propertyMessages = messages[propertyId] || [];
  const typingUsers = typing[propertyId] || [];
  const landlordStatus = presence[landlordId] || 'offline';
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!propertyId) return;

    socket.emit('joinRoom', propertyId);

    const onNewMessage = (msg: unknown) => {
      const message = msg as Message;
      if (message.propertyId === propertyId) {
        dispatch(addMessage(message));
      }
    };

    const onMessageEdited = (updatedMsg: unknown) => {
      const message = updatedMsg as Message;
      if (message.propertyId === propertyId) {
        dispatch(editMessageAction({
          propertyId: message.propertyId,
          messageId: message.id,
          newContent: message.content
        }));
      }
    };

    const onMessageDeleted = (data: { messageId: string }) => {
      dispatch(deleteMessageAction({
        propertyId,
        messageId: data.messageId
      }));
    };

    const onTypingStatus = (data: { userId: string; isTyping: boolean }) => {
      dispatch(setTyping({ propertyId, typing: data }));
    };

    const onPresenceUpdate = (data: { userId: string; status: 'online' | 'offline' }) => {
      dispatch(setPresence(data));
    };

    socket.on('newMessage', onNewMessage);
    socket.on('messageEdited', onMessageEdited);
    socket.on('messageDeleted', onMessageDeleted);
    socket.on('typingStatus', onTypingStatus);
    socket.on('presence', onPresenceUpdate);

    return () => {
      socket.emit('leaveRoom', propertyId);
      socket.off('newMessage', onNewMessage);
      socket.off('messageEdited', onMessageEdited);
      socket.off('messageDeleted', onMessageDeleted);
      socket.off('typingStatus', onTypingStatus);
      socket.off('presence', onPresenceUpdate);
    };
  }, [propertyId, dispatch]);

  useEffect(() => {
    if (!user?.id) return;
    const timeout = setTimeout(() => {
      socket.emit('typing', { propertyId, userId: user.id, isTyping });
    }, 500);
    return () => clearTimeout(timeout);
  }, [isTyping, propertyId, user?.id]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;
    if (editingMessageId) {
      handleEditSave();
      return;
    }
    try {
      await dispatch(sendMessage({ propertyId, content: newMessage })).unwrap();
      setNewMessage('');
      setIsTyping(false);
    } catch {
      Alert.alert('Error', 'Failed to send message');
    }
  }, [newMessage, propertyId, dispatch, editingMessageId]);

  const handleEdit = () => {
    if (!selectedMessageId) return;
    const message = propertyMessages.find(m => m.id === selectedMessageId);
    if (message) {
      setEditingMessageId(selectedMessageId);
      setEditText(message.content);
      setNewMessage(message.content);
      setShowActionModal(false);
    }
  };

  const handleEditSave = () => {
    if (!editingMessageId || !editText.trim()) return;
    socket.emit('editMessage', {
      propertyId,
      messageId: editingMessageId,
      newContent: editText
    }, (res: unknown) => {
      const response = res as { success: boolean; error?: string };
      if (response.success) {
        setEditingMessageId(null);
        setEditText('');
        setNewMessage('');
      } else {
        Alert.alert('Error', response.error || 'Failed to edit message');
      }
    });
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditText('');
    setNewMessage('');
  };

  const handleDelete = () => {
    if (!selectedMessageId) return;
    Alert.alert('Delete Message','Are you sure?', [
      { text: 'Cancel', style: 'cancel', onPress: () => setShowActionModal(false) },
      { text: 'Delete', style: 'destructive', onPress: () => {
          socket.emit('deleteMessage', { propertyId, messageId: selectedMessageId }, (res: unknown) => {
            const response = res as { success: boolean; error?: string };
            if (!response.success) Alert.alert('Error', response.error || 'Failed to delete message');
            setShowActionModal(false);
          });
        } 
      }
    ]);
  };

  const handleMessageLongPress = (messageId: string, event: any) => {
    const message = propertyMessages.find(m => m.id === messageId);
    if (message && message.senderId === user?.id && !message.deleted) {
      setSelectedMessageId(messageId);
      const { pageX, pageY } = event.nativeEvent;
      setModalPosition({ top: pageY - 100, left: pageX - 100 });
      setShowActionModal(true);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = typeof timestamp === 'string' && !isNaN(Number(timestamp)) 
        ? new Date(Number(timestamp)) 
        : new Date(timestamp);
      
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 48) {
        return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
    } catch {
      return '';
    }
  };

  const renderAvatar = (senderName?: string) => {
    if (!senderName) return null;
    const firstLetter = senderName.trim().charAt(0).toUpperCase();
    return (
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{firstLetter}</Text>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;
    const isEditing = editingMessageId === item.id;
    const senderName = isMe ? 'You' : (item.senderName || (item.senderId === landlordId ? 'Landlord' : 'User'));

    return (
      <View style={[styles.messageContainer, isMe ? styles.currentUser : styles.otherUser]}>
        {!isMe && renderAvatar(senderName)}

        <TouchableOpacity
          onLongPress={(event) => handleMessageLongPress(item.id, event)}
          delayLongPress={300}
          activeOpacity={0.7}
        >
          <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage, isEditing && styles.editingMessage]}>
            {!isMe && <Text style={styles.senderName}>{senderName}</Text>}
            {item.deleted ? (
              <Text style={styles.deletedText}>This message was deleted</Text>
            ) : (
              <>
                <Text style={isMe ? styles.myMessageText : styles.otherMessageText}>{item.content}</Text>
                <View style={styles.messageMeta}>
                  <Text style={isMe ? styles.myMetaText : styles.otherMetaText}>
                    {formatTime(item.createdAt)}
                    {item.editedAt && item.editedAt !== item.createdAt && (
                      <Text style={isMe ? styles.myMetaText : styles.otherMetaText}> • edited</Text>
                    )}
                  </Text>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>

        {isMe && renderAvatar(senderName)}
      </View>
    );
  };

  const typingIndicator = useMemo(() => {
    const othersTyping = typingUsers.filter((t) => t.userId !== user?.id && t.isTyping);
    if (othersTyping.length === 0) return null;
    const typingNames = othersTyping.map(t => t.userId === landlordId ? 'Landlord' : 'Someone');
    const typingText = typingNames.length === 1 ? `${typingNames[0]} is typing...` : 'Multiple people are typing...';
    return (
      <View style={styles.typingIndicator}>
        <Text style={styles.typingText}>{typingText}</Text>
      </View>
    );
  }, [typingUsers, user?.id, landlordId]);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.chatTitle}>Chat with Landlord</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: landlordStatus === 'online' ? '#4CAF50' : '#9E9E9E' }]} />
            <Text style={styles.statusText}>{landlordStatus === 'online' ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 + insets.top : 0}
      >
        <FlatList
          ref={flatListRef}
          data={propertyMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="chat" size={60} color="#CCCCCC" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation with your landlord!</Text>
            </View>
          }
        />

        {typingIndicator}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 12 }]}>
          {editingMessageId && (
            <View style={styles.editingIndicator}>
              <Text style={styles.editingText}>Editing message</Text>
              <TouchableOpacity onPress={handleEditCancel}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={(text) => { setNewMessage(text); setIsTyping(text.length > 0); }}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              onPress={handleSendMessage} 
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]} 
              disabled={!newMessage.trim()}
            >
              {editingMessageId ? 
                <Ionicons name="checkmark" size={22} color="#fff" /> : 
                <FontAwesome5 name="paper-plane" size={20} color="#fff" />
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showActionModal} transparent animationType="fade" onRequestClose={() => setShowActionModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowActionModal(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={[styles.actionModal, { top: modalPosition.top, left: modalPosition.left }]}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Ionicons name="pencil" size={20} color="#007AFF" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity style={[styles.actionButton, styles.deleteAction]} onPress={handleDelete}>
            <Ionicons name="trash" size={20} color="#FF3B30" />
            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 10,
  },
  currentUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  otherUser: {
    alignSelf: 'flex-start',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  myMessage: {
    backgroundColor: '#007AFF',
  },
  otherMessage: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  editingMessage: {
    borderColor: '#FFA000',
    borderWidth: 1,
  },
  senderName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
    color: '#555',
  },
  myMessageText: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 22,
  },
  otherMessageText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 22,
  },
  deletedText: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: 15,
  },
  messageMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  myMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  otherMetaText: {
    fontSize: 12,
    color: '#666',
  },
  typingIndicator: {
    padding: 12,
    alignItems: 'center',
  },
  typingText: {
    fontStyle: 'italic',
    color: '#666',
    fontSize: 14,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  editingIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
  },
  editingText: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  actionModal: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 160,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#007AFF',
  },
  deleteAction: {},
  deleteText: {
    color: '#FF3B30',
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
});