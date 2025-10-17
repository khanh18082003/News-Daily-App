import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  actions,
  RichEditor,
  RichToolbar,
} from "react-native-pell-rich-editor";

type EditorProps = {
  value?: string;
  placeholder?: string;
  initialHeight?: number;
  fixedHeight?: boolean;
  onChange?: (html: string) => void;
};

const Editor: React.FC<EditorProps> = ({
  value,
  placeholder = "Write Articles...",
  initialHeight = 220,
  fixedHeight = false,
  onChange,
}) => {
  const richRef = useRef<RichEditor>(null);
  const lastHtmlRef = useRef<string>("");
  const isFocusedRef = useRef<boolean>(false);

  const normalizeHtml = (s: string | undefined | null) =>
    (s ?? "")
      .replace(/&nbsp;/g, " ")
      .replace(/>\s+</g, "><")
      .replace(/\s+/g, " ")
      .trim();
  const [showLink, setShowLink] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep content in sync if parent provides value, but avoid feedback loop
  useEffect(() => {
    if (typeof value !== "string") return;
    // Do not override content while user is typing
    if (isFocusedRef.current) return;
    const incoming = normalizeHtml(value);
    const current = normalizeHtml(lastHtmlRef.current);
    if (incoming !== current) {
      richRef.current?.setContentHTML(value);
      lastHtmlRef.current = value;
    }
  }, [value]);

  const handleInsertLink = () => setShowLink(true);
  const applyLink = () => {
    if (linkUrl.trim()) {
      richRef.current?.insertLink(linkTitle || linkUrl, linkUrl);
    }
    setShowLink(false);
    setLinkTitle("");
    setLinkUrl("");
  };

  return (
    <View style={styles.container}>
      <RichToolbar
        editor={richRef}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.insertLink,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.undo,
          actions.redo,
        ]}
        iconTint="#4B5563"
        selectedIconTint="#19A7FE"
        style={styles.toolbar}
        iconMap={{
          [actions.insertLink]: ({ tintColor }: any) => (
            <Ionicons name="link-outline" size={18} color={tintColor} />
          ),
          [actions.insertBulletsList]: ({ tintColor }: any) => (
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={18}
              color={tintColor}
            />
          ),
          [actions.insertOrderedList]: ({ tintColor }: any) => (
            <MaterialCommunityIcons
              name="format-list-numbered"
              size={18}
              color={tintColor}
            />
          ),
          [actions.alignLeft]: ({ tintColor }: any) => (
            <MaterialCommunityIcons
              name="format-align-left"
              size={18}
              color={tintColor}
            />
          ),
          [actions.alignCenter]: ({ tintColor }: any) => (
            <MaterialCommunityIcons
              name="format-align-center"
              size={18}
              color={tintColor}
            />
          ),
          [actions.alignRight]: ({ tintColor }: any) => (
            <MaterialCommunityIcons
              name="format-align-right"
              size={18}
              color={tintColor}
            />
          ),
          [actions.undo]: ({ tintColor }: any) => (
            <Ionicons name="arrow-undo-outline" size={18} color={tintColor} />
          ),
          [actions.redo]: ({ tintColor }: any) => (
            <Ionicons name="arrow-redo-outline" size={18} color={tintColor} />
          ),
        }}
        onPressAddLink={handleInsertLink}
      />

      <RichEditor
        ref={richRef}
        placeholder={placeholder}
        // WebView style
        style={[
          styles.editor,
          fixedHeight
            ? { height: initialHeight }
            : { minHeight: initialHeight },
        ]}
        // Outer RN container style (borders/radius)
        containerStyle={styles.editorContainer}
        initialHeight={initialHeight}
        editorStyle={{
          backgroundColor: "#fff",
          color: "#111827",
          placeholderColor: "#9CA3AF",
          contentCSSText: "font-size: 16px; padding: 10px;",
        }}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={() => {
          isFocusedRef.current = false;
        }}
        onChange={(html) => {
          lastHtmlRef.current = html ?? "";
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            onChange?.(lastHtmlRef.current);
          }, 120);
        }}
      />

      {/* Simple link dialog (cross-platform) */}
      <Modal
        visible={showLink}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLink(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Insert Link</Text>
            <TextInput
              placeholder="Title (optional)"
              value={linkTitle}
              onChangeText={setLinkTitle}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="https://example.com"
              value={linkUrl}
              onChangeText={setLinkUrl}
              autoCapitalize="none"
              keyboardType="url"
              style={styles.modalInput}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 10,
              }}
            >
              <Pressable onPress={() => setShowLink(false)}>
                <Text style={{ color: "#6b7280" }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={applyLink}>
                <Text style={{ color: "#19A7FE", fontWeight: "700" }}>
                  Insert
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  toolbar: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  editor: {
    // WebView area; keep minimal styling and let container handle borders
  },
  editorContainer: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
});

export default Editor;
