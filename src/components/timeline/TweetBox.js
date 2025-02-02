import { Avatar, Button } from "@mui/material";
import React, { useState } from "react";
import "./TweetBox.css";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import db from "../../firebase";

function TweetBox() {
  const [tweetMessage, setTweetMessage] = useState("");
  const [tweetImage, setTweetImage] = useState("");
  const [tags, setTags] = useState("");

  const sendTweet = (e) => {
    e.preventDefault();

    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag) // 空のタグを除去
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)); // 自動で # を追加

    addDoc(collection(db, "posts"), {
      displayName: "プログラミングチュートリアル",
      username: "Shin_Engineer",
      verified: true,
      text: tweetMessage,
      avatar: "http://shincode.info/wp-content/uploads/2021/12/icon.png",
      image: tweetImage,
      tags: tagList, // タグリストを追加
      timestamp: serverTimestamp(),
    });

    setTweetMessage("");
    setTweetImage("");
    setTags(""); // 入力フィールドをリセット
  };

  return (
    <div className="tweetBox">
      <form>
        <div className="tweetBox--input">
          <Avatar />
          <input
            value={tweetMessage}
            placeholder="いまどうしてる？"
            type="text"
            onChange={(e) => setTweetMessage(e.target.value)}
          />
        </div>
        <input
          value={tweetImage}
          className="tweetBox--imageInput"
          placeholder="画像のURLを入力してください"
          type="text"
          onChange={(e) => setTweetImage(e.target.value)}
        />
        <input
          value={tags}
          className="tweetBox--tagsInput"
          placeholder="タグをカンマ区切りで入力してください (例: React, JavaScript)"
          type="text"
          onChange={(e) => setTags(e.target.value)}
        />

        <Button
          className="tweetBox--tweetButton"
          type="submit"
          onClick={sendTweet}
        >
          ツイートする
        </Button>
      </form>
    </div>
  );
}

export default TweetBox;
