import React, { forwardRef, useEffect, useState } from "react";
import {
  ChatBubbleOutline,
  FavoriteBorder,
  Favorite,
  PublishOutlined,
  Repeat,
  VerifiedUser,
} from "@mui/icons-material";
import { Avatar, Button } from "@mui/material";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import db from "../../firebase";
import "./Post.css";

/**
 * 仮のログインユーザー情報
 * ※ 本来は Firebase Auth などから取得してください
 */
const loggedInUserId = "testUserId";
const loggedInDisplayName = "ログインユーザー名";

const Post = forwardRef(
  (
    {
      id, // 親コンポーネントから受け取る投稿ID (ドキュメントID)
      displayName,
      username,
      verified,
      text,
      image,
      avatar,
      tags = [],
      likes = [],
    },
    ref
  ) => {
    // いいね判定（投稿に対する配列）
    const isLiked = likes.includes(loggedInUserId);

    // コメントの表示/非表示切り替え
    const [showComments, setShowComments] = useState(false);

    // サブコレクション「comments」から取得したコメント一覧
    const [comments, setComments] = useState([]);

    // 新規コメント入力欄
    const [commentText, setCommentText] = useState("");

    /**
     * ---------------------------
     *  1. サブコレクションからコメントをリアルタイム取得
     * ---------------------------
     */
    useEffect(() => {
      // 例: posts/{id}/comments をクエリ (timestamp 昇順 など)
      const commentsRef = collection(db, "posts", id, "comments");
      const q = query(commentsRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newComments = snapshot.docs.map((doc) => ({
          id: doc.id, // コメントドキュメントのID
          ...doc.data(),
        }));
        setComments(newComments);
      });

      // クリーンアップ
      return () => unsubscribe();
    }, [id]);

    /**
     * ---------------------------
     *  2. いいねのトグル
     * ---------------------------
     */
    const handleLike = async () => {
      const postRef = doc(db, "posts", id);

      if (isLiked) {
        // いいね済 → 削除
        await updateDoc(postRef, {
          likes: arrayRemove(loggedInUserId),
        });
      } else {
        // いいねしてない → 追加
        await updateDoc(postRef, {
          likes: arrayUnion(loggedInUserId),
        });
      }
    };

    /**
     * ---------------------------
     *  3. コメント投稿
     * ---------------------------
     */
    const handleCommentSubmit = async (e) => {
      e.preventDefault();
      if (!commentText.trim()) return;

      // サブコレクションへドキュメント追加
      const commentsRef = collection(db, "posts", id, "comments");
      await addDoc(commentsRef, {
        userId: loggedInUserId,
        displayName: loggedInDisplayName,
        text: commentText,
        timestamp: serverTimestamp(), // ここではサーバー時刻が使える
      });

      // 入力欄クリア
      setCommentText("");
    };

    /**
     * ---------------------------
     *  4. コメント削除
     *    (投稿者 or コメント投稿者のみ)
     * ---------------------------
     */
    const handleDeleteComment = async (commentDocId, commentUserId) => {
      // 投稿者 もしくは コメントの投稿者なら削除可
      const canDelete =
        commentUserId === loggedInUserId || username === loggedInUserId;
      if (!canDelete) return;

      await deleteDoc(doc(db, "posts", id, "comments", commentDocId));
    };

    // コメント削除権限判定
    const canDeleteComment = (commentUserId) => {
      return commentUserId === loggedInUserId || username === loggedInUserId;
    };

    return (
      <div className="post" ref={ref}>
        {/* 投稿の左側（アバター） */}
        <div className="post--avatar">
          <Avatar src={avatar} />
        </div>

        {/* 投稿本文 */}
        <div className="post--body">
          <div className="post--header">
            <div className="post--headerText">
              <h3>
                {displayName}{" "}
                <span className="post--headerSpecial">
                  {verified && <VerifiedUser className="post--badge" />}@
                  {username}
                </span>
              </h3>
            </div>
            <div className="post--headerDescription">
              <p>{text}</p>
            </div>
          </div>

          {/* 画像があれば表示 */}
          {image && <img src={image} alt="投稿画像" />}

          {/* タグ */}
          <div className="post--tags">
            {tags.map((tag, index) => (
              <span key={index} className="post--tag">
                {tag}
              </span>
            ))}
          </div>

          {/* フッターアイコン（いいね、コメント、リツイート、共有など） */}
          <div className="post--footer">
            {/* いいね */}
            <div onClick={handleLike} style={{ cursor: "pointer" }}>
              {isLiked ? (
                <Favorite style={{ color: "red" }} fontSize="small" />
              ) : (
                <FavoriteBorder fontSize="small" />
              )}
              <span style={{ marginLeft: "4px", fontSize: "12px" }}>
                {likes.length}
              </span>
            </div>

            {/* コメント一覧の表示/非表示切り替え */}
            <div
              style={{ cursor: "pointer" }}
              onClick={() => setShowComments((prev) => !prev)}
            >
              <ChatBubbleOutline fontSize="small" />
              <span style={{ marginLeft: "4px", fontSize: "12px" }}>
                {showComments ? "閉じる" : "コメント"}
              </span>
            </div>

            <Repeat fontSize="small" />
            <PublishOutlined fontSize="small" />
          </div>

          {/* showComments が true の場合だけコメントブロックを表示 */}
          {showComments && (
            <>
              {/* コメント一覧 */}
              <div className="post--comments">
                <h4>コメント一覧</h4>
                {comments.map((comment) => (
                  <div key={comment.id} className="post--comment">
                    <div className="post--commentHeader">
                      <span>
                        {comment.displayName} (
                        {comment.userId === username ? "投稿者" : "ユーザー"})
                      </span>
                      {canDeleteComment(comment.userId) && (
                        <button
                          className="post--commentDeleteBtn"
                          onClick={() =>
                            handleDeleteComment(comment.id, comment.userId)
                          }
                        >
                          削除
                        </button>
                      )}
                    </div>
                    <div className="post--commentBody">{comment.text}</div>
                  </div>
                ))}
              </div>

              {/* コメント投稿フォーム */}
              <form
                onSubmit={handleCommentSubmit}
                style={{ marginTop: "10px" }}
              >
                <textarea
                  placeholder="コメントを入力..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  maxLength={200} // 文字数上限の例
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    outline: "none",
                    border: "1px solid #ccc",
                    resize: "vertical",
                  }}
                />
                <Button
                  variant="contained"
                  type="submit"
                  style={{ marginTop: "8px" }}
                >
                  コメントする
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }
);

export default Post;
