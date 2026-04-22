import { Ionicons } from "@expo/vector-icons";
import {
  onAuthStateChanged,
  signInAnonymously
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebase/config";
import { db } from "../firebase/firestore";

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = async () => {
  const newValue = !isDark;
  setIsDark(newValue);

  await AsyncStorage.setItem("theme", JSON.stringify(newValue));
};

  const stickers = [
    "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif",
    "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif",
    "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif",
  ];

  useEffect(() => {
  const loadTheme = async () => {
    const savedTheme = await AsyncStorage.getItem("theme");

    if (savedTheme !== null) {
      setIsDark(JSON.parse(savedTheme));
    }
  };

  loadTheme();
}, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        await getOrCreateUsername(u.uid);
        setLoading(false);
      } else {
        signInAnonymously(auth).catch(console.error);
      }
    });

    return unsubscribe;
  }, []);

  const getOrCreateUsername = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      setUsername(userSnap.data().username);
    } else {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newUsername = `User_${randomNum}`;

      await setDoc(userRef, {
        username: newUsername,
        createdAt: serverTimestamp(),
      });

      setUsername(newUsername);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    await addDoc(collection(db, "messages"), {
      type: "text",
      text: input.trim(),
      userId: user.uid,
      username,
      createdAt: serverTimestamp(),
    });

    setInput("");
  };

  const sendSticker = async (sticker) => {
    if (!user) return;

    await addDoc(collection(db, "messages"), {
      type: "sticker",
      sticker,
      userId: user.uid,
      username,
      createdAt: serverTimestamp(),
    });

    setShowStickers(false);
  };

  const renderItem = ({ item }) => {
    const isMyMessage = user && item.userId === user.uid;

    const isSticker = item.type === "sticker" && item.sticker;
    const isText = item.type === "text" || !item.type;

    return (
      <View>

        

        <View style={[isMyMessage ? styles.messageRight : styles.messageLeft, item.sticker && isMyMessage ? styles.messageRightSticker : null, item.sticker && !isMyMessage ? styles.messageLeftSticker : null, isDark && !item.sticker && isMyMessage? styles.darkTheme : null, isDark && !item.sticker && !isMyMessage ? styles.lightTheme : null]}>
          <Text style={[
          isMyMessage ? styles.usernameRight : styles.usernameLeft,
          {
            marginLeft: isMyMessage ? 0 : 0,
            marginRight: isMyMessage ? 0 : 0
          }
        ]}>
          {item.username || "Anonymous"}
        </Text>

          {isText && item.text && (
            <Text style={isMyMessage ? styles.messageTextRight : styles.messageText}>
              {item.text}
            </Text>
          )}

          {isSticker && (
            <Image
              source={{ uri: item.sticker }}
              style={{ width: 80, height: 80, borderRadius: 10 }}
            />
          )}

        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, isDark ?   styles.dark : styles.light]}>
        <Text style={[{ textAlign: "center", marginTop: "50%" , fontSize: 25, fontFamily: "Roboto", fontWeight: "700" }, { color: isDark ? "#fff" : "#000" }]}>
          Connecting...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark ?   styles.dark : styles.light]}>

      <View style={styles.header}>
        <View style={styles.headerProfile}>
          <View style={styles.avatar} />
          <Text style={[styles.name, { color: isDark ? "#fff" : "#000" }]}>ChatChat</Text>
        </View>
        <Switch
        value={isDark}
        onValueChange={toggleTheme}
      />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted
          contentContainerStyle={styles.chatArea}
        />

        {showStickers && (
          <View style={{ flexDirection: "row", padding: 10 }}>
            {stickers.map((s, i) => (
              <TouchableOpacity key={i} onPress={() => sendSticker(s)}>
                <Image
                  source={{ uri: s }}
                  style={{ width: 50, height: 50, marginRight: 10 }}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={[styles.inputContainer, isDark ? styles.dark : styles.light]}>

          <TouchableOpacity onPress={() => setShowStickers(!showStickers)}>
            <Ionicons name="happy-outline" size={25} color="#ffea00" />
          </TouchableOpacity>

          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            style={styles.input}
          />

          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
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
    
    paddingBottom: 50,
  },
  light: {
    backgroundColor: "#bdbdbd",
  },

  dark: {
    backgroundColor: "#000000",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    backgroundColor: "#a50ce7",
  },
  name: { fontSize: 21, fontWeight: "600", color: "#000000" },

  chatArea: {
    padding: 15,
    flexGrow: 1,
  },

  messageLeft: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(47, 117, 237,1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: "75%",
  },

  
  messageRight: {
    alignSelf: "flex-end",
    backgroundColor: 'rgba(117, 122, 131, 1)',
    
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: "75%",
  },

  darkTheme: {
    backgroundColor: "rgba(117, 122, 131, 0.25)",
  },

 lightTheme: {
    backgroundColor: "rgba(47, 117, 237, 0.23)",
  },

messageRightSticker: {
    backgroundColor: "transparent",
    
  },

  messageLeftSticker: {
    backgroundColor: "transparent",},

  usernameLeft: {
    fontSize: 9,
    color: "#000303",
    marginBottom: 4,
    fontWeight: "500",
    fontStyle: "italic",
    color: "#00ffff",
  },
  usernameRight: {
    fontSize: 8,
    marginBottom: 4,
    fontWeight: "500",
    textAlign: "right",
    fontStyle: "italic",
    color: "#00ffff",
  },

  messageText: { color: "#ffffff", fontSize: 13, lineHeight: 23 },
  messageTextRight: { color: "#fff", fontSize: 13, lineHeight: 23 }, 

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#bdbdbd",
   
  
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