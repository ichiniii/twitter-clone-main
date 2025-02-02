import React, { useState, useEffect } from "react";
import Post from "./Post";
import "./Timeline.css";
import TweetBox from "./TweetBox";
import db from "../../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import FlipMove from "react-flip-move";
import SearchBar from "../search/SearchBar";

function Timeline() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 検索キーワードのステート

  useEffect(() => {
    const postData = collection(db, "posts");
    const q = query(postData, orderBy("timestamp", "desc"));

    /* リアルタイムでデータを取得 */
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setPosts(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      ); // ✅ id を含める
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, []);

  // 検索キーワードに基づいてフィルタリング
  const filteredPosts = posts.filter((post) =>
    (post.tags || []).some((tag) =>
      tag.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
  );

  return (
    <div className="timeline">
      {/* Header */}
      <div className="timeline--header">
        <h2>ホーム</h2>
      </div>

      {/* 検索バー */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* TweetBox */}
      <TweetBox />

      {/* Post */}
      <FlipMove>
        {filteredPosts.map((post, index) => (
          <Post
            key={index} // 一意のキーを使用
            displayName={post.displayName}
            username={post.username}
            verified={post.verified}
            text={post.text}
            avatar={post.avatar}
            image={post.image}
            tags={post.tags} // タグを渡す
          />
        ))}
      </FlipMove>
    </div>
  );
}

export default Timeline;
