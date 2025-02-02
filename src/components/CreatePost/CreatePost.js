import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import db from "../../firebase";
import "./CreatePost.css";

function CreatePost() {
  const [postText, setPostText] = useState("");
  const [imageURL, setImageURL] = useState("");

  // ★ 追加: タグ入力用のステート
  const [tagsInput, setTagsInput] = useState("");

  const submitPost = async (e) => {
    e.preventDefault();

    if (!postText.trim()) {
      alert("投稿内容を入力してください");
      return;
    }

    try {
      // ★ 追加: タグ入力欄から配列を作る
      // カンマ区切りで入力された文字列を分解し、
      // 空白を除去し、# が先頭になければ付与
      const tagList = tagsInput
        .split(",") // カンマで分割
        .map((tag) => tag.trim()) // 前後の空白を削除
        .filter(Boolean) // 空文字を除去
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

      await addDoc(collection(db, "posts"), {
        text: postText,
        image: imageURL || null,
        timestamp: serverTimestamp(),
        displayName: "ユーザー名",
        username: "ユーザーID",
        avatar: "https://example.com/avatar.png",
        verified: true,

        // ★ 追加: タグを保存
        tags: tagList.length > 0 ? tagList : [], // 🔥 `tags` が常に配列になる
      });

      // フォームリセット
      setPostText("");
      setImageURL("");
      setTagsInput(""); // ★ 追加: タグ入力欄もクリア
    } catch (error) {
      console.error("投稿の保存中にエラーが発生しました:", error);
    }
  };

  return (
    <div className="create-post">
      <form onSubmit={submitPost}>
        <textarea
          placeholder="今どうしている？"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
        />
        <input
          type="text"
          placeholder="画像のURLを入力してください"
          value={imageURL}
          onChange={(e) => setImageURL(e.target.value)}
        />

        {/* ★ 追加: タグ入力欄を用意 */}
        <input
          type="text"
          placeholder="タグをカンマ区切りで入力 (例: React, Firebase)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        <button type="submit">投稿する</button>
      </form>
    </div>
  );
}

export default CreatePost;
