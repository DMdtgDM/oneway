import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: "1", text: "Hey! How are you?", time: "10:32 AM", from: "left" },
    { id: "2", text: "I'm good! Just working on a new project", time: "10:33 AM", from: "right" },
    { id: "3", text: "Nice! What kind of project?", time: "10:33 AM", from: "left" },
    { id: "4", text: "A mobile chat app actually", time: "10:34 AM", from: "right" },
    { id: "5", text: "That sounds cool! Can I try it?", time: "10:35 AM", from: "left" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      text: input,
      time: "Now",
      from: "right",
    };
    setMessages((prev) => [newMsg, ...prev]);
    setInput("");
  };

  const renderItem = ({ item }) => (
    <View
      style={item.from === "left" ? styles.messageLeft : styles.messageRight}
    >
      <Text
        style={
          item.from === "left" ? styles.messageText : styles.messageTextRight
        }
      >
        {item.text}
      </Text>
      <Text style={item.from === "left" ? styles.time : styles.timeRight}>
        {item.time}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerProfile}>
          <View style={styles.avatar} />
          <Text style={styles.name}>OneWay</Text>
        </View>
        <MaterialIcons name="more-vert" size={22} color="#000" />
      </View>

      {/* KeyboardAvoidingView - Fixed for Android */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? -5 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted
          contentContainerStyle={styles.chatArea}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Area - No extra margin/padding */}
        <View style={styles.inputContainer}>
          <Ionicons name="happy-outline" size={25} color="#ffea00" />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            style={styles.input}
            placeholderTextColor="#999"
            multiline
            numberOfLines={1}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={15} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#bdbdbd" ,
    paddingBottom: 50, // Ensure no extra space at the bottom
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 40,
  },
  headerProfile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: "#008cff",
  },
  name: { fontSize: 21, fontWeight: "600", color: "#000000" },

  chatArea: {
    padding: 15,
    flexGrow: 1,
  },

  messageLeft: {
    alignSelf: "flex-start",
    backgroundColor:  "#757a83",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: "75%",
  },
  messageRight: {
    alignSelf: "flex-end",
    backgroundColor: "#2f75ed",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: "75%",
  },
  messageText: { color: "#000000", fontSize: 13 },
  messageTextRight: { color: "#fff", fontSize: 13 },
  time: { fontSize: 10, color: "#777" },
  timeRight: {
    fontSize: 10,
    color: "#ddd",
    marginTop: 4,
    textAlign: "right",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#bdbdbd",
    borderTopWidth: 1,
    borderColor: "#bdbdbd",
    
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 110,
  },
  sendButton: {
    backgroundColor: "#2F80ED",
    padding: 11,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});