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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const postData = collection(db, "posts");
    const q = query(postData, orderBy("timestamp", "desc"));

    // Firestore からリアルタイムでデータを取得
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setPosts(
        querySnapshot.docs.map((doc) => ({
          id: doc.id, // Firestore のドキュメント ID
          ...doc.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  // 🔥 タグ検索機能（タグが検索ワードを含む投稿のみを表示）
  const filteredPosts = searchTerm
    ? posts.filter((post) =>
        post.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : posts;

  return (
    <div className="timeline">
      {/* ヘッダー（固定） */}
      <div className="timeline--header">
        <h2>ホーム</h2>
      </div>

      {/* 検索バー（固定） */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* ツイート入力欄（固定） */}
      <TweetBox />

      {/* 投稿リスト（スクロール可能） */}
      <div className="timeline--posts">
        <FlipMove>
          {filteredPosts.map((post) => (
            <Post
              key={post.id}
              id={post.id}
              displayName={post.displayName}
              username={post.username}
              verified={post.verified}
              text={post.text}
              avatar={post.avatar}
              image={post.image}
              tags={post.tags || []}
              likes={post.likes || []}
              comments={post.comments || []}
            />
          ))}
        </FlipMove>
      </div>
    </div>
  );
}

export default Timeline;
