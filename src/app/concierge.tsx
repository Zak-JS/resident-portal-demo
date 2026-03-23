import React, { useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAiConcierge } from "../hooks/useAiConcierge";
import type { IMessage } from "react-native-gifted-chat";

const QUICK_QUESTIONS = [
  {
    icon: "calendar",
    text: "What events are coming up?",
    shortText: "Events",
    color: "#E91E63",
    bg: "#E91E63",
  },
  {
    icon: "construct",
    text: "How do I report a maintenance issue?",
    shortText: "Report Issue",
    color: "#E91E63",
    bg: "#E91E63",
  },
  {
    icon: "ticket",
    text: "What's the status of my tickets?",
    shortText: "My Tickets",
    color: "#E91E63",
    bg: "#E91E63",
  },
  {
    icon: "add-circle",
    text: "RSVP me to the next event",
    shortText: "RSVP",
    color: "#E91E63",
    bg: "#E91E63",
  },
];

function ChatBubble({
  message,
  isUser,
}: {
  message: IMessage;
  isUser: boolean;
}) {
  const time = new Date(message.createdAt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (message.system) {
    return (
      <View className="px-4 py-2 my-1">
        <Text
          className="text-xs italic text-center text-slate-400"
          style={{ fontFamily: "Inter_400Regular" }}
        >
          {message.text}
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`flex-row ${isUser ? "justify-end" : "justify-start"} mb-3 px-4`}
    >
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser ? "bg-primary rounded-br-sm" : "bg-white rounded-bl-sm"
        }`}
        style={
          !isUser
            ? {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }
            : undefined
        }
      >
        {!isUser && (
          <Text
            className="mb-1 text-xs text-primary"
            style={{ fontFamily: "Inter_600SemiBold" }}
          >
            Concierge AI
          </Text>
        )}
        <Text
          className={`text-base ${isUser ? "text-white" : "text-slate-800"}`}
          style={{ fontFamily: "Inter_400Regular", lineHeight: 22 }}
        >
          {message.text}
        </Text>
        <Text
          className={`text-xs mt-1.5 ${isUser ? "text-white/60" : "text-slate-400"}`}
          style={{ fontFamily: "Inter_400Regular" }}
        >
          {time}
        </Text>
      </View>
    </View>
  );
}

function TypingIndicator() {
  return (
    <View className="flex-row justify-start px-4 mb-3">
      <View
        className="px-4 py-3 bg-white rounded-2xl rounded-bl-sm"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <Text
          className="mb-1 text-xs text-primary"
          style={{ fontFamily: "Inter_600SemiBold" }}
        >
          Concierge AI
        </Text>
        <View className="flex-row gap-1.5 items-center py-1">
          <View className="w-2 h-2 bg-slate-300 rounded-full" />
          <View className="w-2 h-2 bg-slate-300 rounded-full" />
          <View className="w-2 h-2 bg-slate-300 rounded-full" />
        </View>
      </View>
    </View>
  );
}

function QuickQuestions({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <View className="px-4 py-6">
      <View className="items-center mb-6">
        <View
          className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4"
          style={{
            shadowColor: "#E91E63",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Ionicons name="sparkles" size={32} color="#FFFFFF" />
        </View>
        <Text
          className="text-lg text-slate-900 mb-1"
          style={{ fontFamily: "Inter_700Bold" }}
        >
          How can I help you?
        </Text>
        <Text
          className="text-sm text-slate-500 text-center"
          style={{ fontFamily: "Inter_400Regular" }}
        >
          Tap a question or type your own
        </Text>
      </View>
      <View className="gap-3">
        {QUICK_QUESTIONS.map((q, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSelect(q.text)}
            activeOpacity={0.7}
          >
            <View
              className="flex-row items-center bg-white rounded-2xl px-4 py-3.5"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: q.bg }}
              >
                <Ionicons name={q.icon as any} size={20} color="#FFFFFF" />
              </View>
              <Text
                className="text-sm text-slate-700 flex-1"
                style={{ fontFamily: "Inter_500Medium" }}
              >
                {q.text}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ConciergeScreen() {
  const router = useRouter();
  const { messages, isTyping, onSend, user } = useAiConcierge();
  const [inputText, setInputText] = React.useState("");

  const handleSend = useCallback(
    (text?: string) => {
      const messageText = text || inputText.trim();
      if (!messageText) return;

      const newMessage: IMessage = {
        _id: Math.random().toString(36).substring(2, 15),
        text: messageText,
        createdAt: new Date(),
        user: user,
      };

      onSend([newMessage]);
      setInputText("");
    },
    [inputText, onSend, user],
  );

  const handleQuickQuestion = useCallback(
    (text: string) => {
      handleSend(text);
    },
    [handleSend],
  );

  const renderItem = useCallback(
    ({ item }: { item: IMessage }) => {
      const isUser = item.user._id === user._id;
      return <ChatBubble message={item} isUser={isUser} />;
    },
    [user._id],
  );

  const showQuickQuestions = messages.length <= 1 && !isTyping;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["bottom"]}>
      {/* Custom Header */}
      <View
        className="px-5 pt-3 pb-4 bg-white"
        style={{
          shadowColor: "#E91E63",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <LinearGradient
              colors={["#E91E63", "#C2185B"]}
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
              style={{
                shadowColor: "#E91E63",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Ionicons name="sparkles" size={24} color="#FFFFFF" />
            </LinearGradient>
            <View className="flex-1">
              <Text
                className="text-primary text-xs"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                AI Assistant
              </Text>
              <Text
                className="text-slate-900 text-xl"
                style={{ fontFamily: "Inter_700Bold" }}
              >
                Concierge
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="#E91E63" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item._id.toString()}
          inverted
          contentContainerStyle={{ paddingVertical: 16 }}
          ListHeaderComponent={isTyping ? <TypingIndicator /> : null}
          ListFooterComponent={
            showQuickQuestions ? (
              <QuickQuestions onSelect={handleQuickQuestion} />
            ) : null
          }
        />

        {/* Quick Action Chips - Always visible */}
        <View className="px-4 py-2 bg-white border-t border-slate-100">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {QUICK_QUESTIONS.map((q, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleQuickQuestion(q.text)}
                activeOpacity={0.7}
                className="flex-row items-center bg-primary/10 px-3 py-2 rounded-full"
              >
                <Ionicons name={q.icon as any} size={16} color="#E91E63" />
                <Text
                  className="text-primary text-sm ml-1.5"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  {q.shortText}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Area */}
        <View
          className="flex-row items-end px-4 py-3 bg-white"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <TextInput
            className="flex-1 px-4 py-3 max-h-24 text-base text-slate-800 bg-slate-100 rounded-2xl"
            placeholder="Ask about events, maintenance..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            style={{ fontFamily: "Inter_400Regular" }}
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            className="ml-3 rounded-xl p-3"
            style={{
              backgroundColor: inputText.trim() ? "#E91E63" : "#CBD5E1",
            }}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
