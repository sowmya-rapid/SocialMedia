// import React, { useState, useEffect } from "react";
// import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
// import { postJSON, getAuth, patchAuth } from "./api";

// /* ------------------ AuthPage ------------------ */
// function AuthPage({ onAuthSuccess }) {
//   const [mode, setMode] = useState("login"); // login | register
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState({ email: "", username: "", password: "" });

//   function onChange(e) {
//     setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
//   }

//   async function handleRegister(e) {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const body = { email: form.email, username: form.username, password: form.password };
//       const res = await postJSON("/auth/register", body);
//       alert("Register response: " + JSON.stringify(res));
//       // After successful signup, navigate to /post (no auto-login here)
//       onAuthSuccess({ token: null, navigateTo: "/post" });
//     } catch (err) {
//       alert("Register failed: " + (err.message || err));
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleLogin(e) {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const body = { identifier: form.email || form.username, password: form.password };
//       const res = await postJSON("/auth/login", body);
//       if (res.access_token) {
//         alert("Login success — token saved");
//         onAuthSuccess({ token: res.access_token, navigateTo: "/post" });
//       } else {
//         alert("Login failed: " + JSON.stringify(res));
//       }
//     } catch (err) {
//       alert("Login error: " + (err.message || err));
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="auth-root" style={{ color: "#000" }}>
//       <div className="auth-toggle">
//         <button
//           className={`btn-outline ${mode === "login" ? "active" : ""}`}
//           onClick={() => setMode("login")}
//           disabled={mode === "login"}
//         >
//           Login
//         </button>
//         <button
//           className={`btn-outline ${mode === "register" ? "active" : ""}`}
//           onClick={() => setMode("register")}
//           disabled={mode === "register"}
//         >
//           Sign up
//         </button>
//       </div>

//       {mode === "register" && (
//         <form onSubmit={handleRegister} className="card form-card">
//           <h2>Create account</h2>

//           <label className="field">
//             <div className="field-label">Email</div>
//             <input name="email" value={form.email} onChange={onChange} required />
//           </label>

//           <label className="field">
//             <div className="field-label">Username</div>
//             <input name="username" value={form.username} onChange={onChange} required />
//           </label>

//           <label className="field">
//             <div className="field-label">Password</div>
//             <input name="password" value={form.password} onChange={onChange} type="password" required />
//           </label>

//           <div className="form-actions">
//             <button className="btn-primary" type="submit" disabled={loading}>
//               {loading ? "Registering..." : "Register"}
//             </button>
//           </div>
//         </form>
//       )}

//       {mode === "login" && (
//         <form onSubmit={handleLogin} className="card form-card">
//           <h2>Login</h2>

//           <label className="field">
//             <div className="field-label">Email or username</div>
//             <input name="email" value={form.email} onChange={onChange} required />
//           </label>

//           <label className="field">
//             <div className="field-label">Password</div>
//             <input name="password" value={form.password} onChange={onChange} type="password" required />
//           </label>

//           <div className="form-actions">
//             <button className="btn-primary" type="submit" disabled={loading}>
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </div>
//         </form>
//       )}
//     </div>
//   );
// }

// /* ------------------ PostPage (backend-ready UI) ------------------ */
// function PostPage({ token, onLogout }) {
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // for top-right Add Post button
//   const [showAdd, setShowAdd] = useState(false);
//   const [newTitle, setNewTitle] = useState("");
//   const [newContent, setNewContent] = useState("");

//   // liked set (store post ids user liked). persisted to localStorage for this demo.
//   const [likedIds, setLikedIds] = useState(() => {
//     try {
//       const raw = localStorage.getItem("liked_posts");
//       return raw ? new Set(JSON.parse(raw)) : new Set();
//     } catch {
//       return new Set();
//     }
//   });

//   useEffect(() => {
//     // initial load: fetch posts from backend
//     let cancelled = false;
//     async function load() {
//       try {
//         const res = await fetch("http://127.0.0.1:8000/api/posts");
//         const data = await res.json();
//         if (!cancelled) setPosts(data);
//       } catch (err) {
//         console.error("Load posts failed:", err);
//         // fallback: keep local dummy posts so UI is visible
//         if (!cancelled) {
//           setPosts([
//             {
//               id: "1",
//               author_username: "john_doe",
//               content: "Check out this cool AI image! https://unsplash.com/photos/JmuyB_LibRo",
//               image: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=600",
//               likes: 4,
//               comments: ["Awesome!", "Looks great"],
//               created_at: new Date().toISOString(),
//             },
//             {
//               id: "2",
//               author_username: "sowmya123",
//               content: "My morning coffee ☕✨ — https://unsplash.com/photos/7okkFhxrxNw",
//               image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600",
//               likes: 10,
//               comments: ["So aesthetic!", "I want this!"],
//               created_at: new Date().toISOString(),
//             },
//           ]);
//         }
//       }
//     }
//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   useEffect(() => {
//     // persist liked ids to localStorage
//     try {
//       localStorage.setItem("liked_posts", JSON.stringify(Array.from(likedIds)));
//     } catch {}
//   }, [likedIds]);

//   // Add post (calls backend when token present; otherwise alert)
//   async function handleAddPost(e) {
//     e.preventDefault();
//     if (!token) return alert("You must be logged in to create a post.");
//     setLoading(true);
//     try {
//       // call backend create post
//       const payload = { title: newTitle || null, content: newContent || "" };
//       const res = await postJSON("/posts", payload); // postJSON attaches Authorization automatically from localStorage
//       // server returns created post; prepend to feed
//       setPosts((p) => [res, ...p]);
//       setNewTitle("");
//       setNewContent("");
//       setShowAdd(false);
//     } catch (err) {
//       alert("Create post failed: " + (err.message || err));
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Toggle like entirely frontend-only (no /like or /unlike calls)
//   function toggleLike(post) {
//     if (!token) return alert("Please login to like posts.");
//     const isLiked = likedIds.has(post.id);

//     setPosts((prev) =>
//       prev.map((p) => {
//         if (p.id !== post.id) return p;
//         const currentLikes = Number(p.likes || 0);
//         return { ...p, likes: isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1 };
//       })
//     );

//     setLikedIds((prev) => {
//       const next = new Set(prev);
//       if (isLiked) next.delete(post.id);
//       else next.add(post.id);
//       return next;
//     });
//   }

//   // Comment (requires login)
//   async function addComment(postId) {
//     if (!token) return alert("Please login to comment.");
//     const text = prompt("Write a comment:");
//     if (!text) return;
//     try {
//       const res = await postJSON(`/posts/${postId}/comments`, { text });
//       setPosts((prev) => prev.map((p) => (p.id === postId ? res : p)));
//     } catch (err) {
//       alert("Add comment failed: " + (err.message || err));
//     }
//   }

//   return (
//     <div className="page-root" style={{ color: "#000" }}>
//       {/* Add small CSS here so whole page gets styled without extra files */}
//       <style>{globalStyles}</style>

//       <div className="page-header">
//         <h2 className="page-title">Feed</h2>

//         <div className="header-actions">
//           <button className="btn-comment" onClick={() => setShowAdd((s) => !s)}>
//             + Add post
//           </button>
//           <button className="btn-ghost danger" onClick={onLogout}>
//             Logout
//           </button>
//         </div>
//       </div>

//       {showAdd && (
//         <form onSubmit={handleAddPost} className="card add-panel">
//           <div className="add-row">
//             <input
//               placeholder="Title (optional)"
//               value={newTitle}
//               onChange={(e) => setNewTitle(e.target.value)}
//               className="input"
//             />
//             <textarea
//               placeholder="Write something..."
//               value={newContent}
//               onChange={(e) => setNewContent(e.target.value)}
//               className="textarea"
//             />
//           </div>

//           <div className="form-actions">
//             <button className="btn-primary" type="submit" disabled={loading}>
//               {loading ? "Creating..." : "Create post"}
//             </button>
//             <button type="button" className="btn-outline" onClick={() => setShowAdd(false)}>
//               Cancel
//             </button>
//           </div>
//         </form>
//       )}

//       <div className="feed">
//         {posts.map((post) => (
//           <article key={post.id} className="card post-card">
//             <div className="post-top">
//               <div className="author">@{post.author_username || post.username || "anon"}</div>
//               <div className="timestamp">{post.created_at ? new Date(post.created_at).toLocaleString() : ""}</div>
//             </div>

//             <div className="post-content">
//               <p>{post.content}</p>
//               {post.image && <img src={post.image} alt="" className="post-image" />}
//             </div>

//             <div className="post-actions">
//               <div className="likes">
//                 <span className="like-count">❤️ {post.likes || 0}</span>
//                 <button className="btn-like" onClick={() => toggleLike(post)}>
//                   {likedIds.has(post.id) ? "Unlike" : "Like"}
//                 </button>
//               </div>

//               <div>
//                 <button className="btn-comment" onClick={() => addComment(post.id)}>
//                   Comment
//                 </button>
//               </div>
//             </div>

//             <div className="comments">
//               {(post.comments || []).map((c, i) => (
//                 <div key={i} className="comment">
//                   <span className="comment-icon">💬</span> <span className="comment-text">{c}</span>
//                 </div>
//               ))}
//             </div>
//           </article>
//         ))}
//       </div>

//       <div className="page-footer">
//         <Link to="/">Back to auth</Link>
//       </div>
//     </div>
//   );
// }

// /* ------------------ App (Router) ------------------ */
// export default function App() {
//   // global state kept here
//   const [token, setToken] = useState(localStorage.getItem("access") || "");

//   useEffect(() => {
//     if (token) localStorage.setItem("access", token);
//     else localStorage.removeItem("access");
//   }, [token]);

//   // centralized logout that clears token + liked posts + localStorage and navigates to "/"
//   function handleLogout(navigate) {
//     setToken("");
//     try {
//       localStorage.removeItem("access");
//       localStorage.removeItem("liked_posts");
//     } catch {}
//     if (navigate) navigate("/");
//   }

//   return (
//     <BrowserRouter>
//       <div className="app-shell" style={{ color: "#000" }}>
//         <style>{globalStyles}</style>
//         <header className="topbar">
//           <div className="brand">SocialMedia APP</div>
//           <div className="top-actions" />
//         </header>

//         <main className="main-container">
//           <Routes>
//             <Route path="/" element={<AuthEntry token={token} setToken={setToken} onGlobalLogout={handleLogout} />} />
//             <Route
//               path="/post"
//               element={
//                 <PostPage
//                   token={token}
//                   onLogout={() => {
//                     // navigate programmatically after logout
//                     setToken("");
//                     try {
//                       localStorage.removeItem("access");
//                       localStorage.removeItem("liked_posts");
//                     } catch {}
//                     window.location.href = "/";
//                   }}
//                 />
//               }
//             />
//           </Routes>
//         </main>
//       </div>
//     </BrowserRouter>
//   );
// }

// /* ------------------ AuthEntry wrapper ------------------ */
// function AuthEntry({ token, setToken, onGlobalLogout }) {
//   const navigate = useNavigate();

//   function handleAuthSuccess({ token: newToken, navigateTo }) {
//     if (newToken) setToken(newToken);
//     if (navigateTo) navigate(navigateTo);
//   }

//   function logout() {
//     setToken("");
//     try {
//       localStorage.removeItem("access");
//       localStorage.removeItem("liked_posts");
//     } catch {}
//     navigate("/");
//   }

//   return (
//     <div className="auth-page" style={{ color: "#000" }}>
//       <div className="auth-top">
        
//         {token && (
//           <button className="btn-ghost danger" onClick={logout}>
//             Logout
//           </button>
//         )}
//       </div>

//       <AuthPage onAuthSuccess={handleAuthSuccess} />
//     </div>
//   );
// }

// /* ------------------ Styles ------------------ */
// const globalStyles = `
// :root{
//   --bg: #f6f7fb;
//   --card: #ffffff;
//   --muted: #6b7280;
//   --accent: #2563eb;
//   --danger: #dc2626;
//   --glass: rgba(255,255,255,0.6);
//   font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
// }

// *{box-sizing:border-box}
// body,html,#root{height:100%;margin:0;background:white !important;color:#000}

// .app-shell{min-height:100vh;display:flex;flex-direction:column}
// .topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 28px;background:linear-gradient(90deg, #fff, #fbfbff);box-shadow:0 1px 0 rgba(0,0,0,0.04)}
// .brand{font-weight:700;font-size:18px;color:#111}
// .site-footer{text-align:center;padding:18px 0;color:var(--muted);font-size:13px}

// .main-container{flex:1;display:flex;justify-content:center;padding:28px}
// .page-root{width:100%;max-width:920px}

// /* auth styles */
// .auth-top{display:flex;justify-content:flex-end;align-items:center;margin-bottom:12px}
// .token-indicator{font-size:14px;color:var(--muted)}
// .auth-root{display:block}
// .auth-toggle{display:flex;gap:8px;margin-bottom:16px}
// .btn-outline{background:transparent;border:1px solid #e6e9ef;padding:8px 12px;border-radius:8px;cursor:pointer;color:#111}
// .btn-outline.active{border-color:var(--accent);box-shadow:0 4px 12px rgba(37,99,235,0.08)}
// .card{background:var(--card);padding:16px;border-radius:12px;box-shadow:0 6px 18px rgba(17,24,39,0.06);border:1px solid rgba(15,23,42,0.03)}
// .form-card{max-width:640px}
// .field{display:block;margin-bottom:10px}
// .field-label{font-size:13px;color:var(--muted);margin-bottom:6px}
// .input,input,textarea{width:100%;padding:10px;border-radius:8px;border:1px solid #e6e9ef;font-size:14px}
// .textarea{min-height:96px;resize:vertical}
// .form-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}

// /* page header */
// .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
// .page-title{margin:0;font-size:20px}

// /* header actions */
// .header-actions{display:flex;gap:8px;align-items:center}
// .btn-ghost{background:transparent;border:1px solid rgba(15,23,42,0.06);padding:8px 12px;border-radius:10px;cursor:pointer}
// .btn-ghost.danger{border-color:var(--danger);color:var(--danger)}

// /* add panel */
// .add-panel{margin-bottom:18px}
// .add-row{display:flex;flex-direction:column;gap:8px}

// /* feed */
// .feed{display:grid;grid-template-columns:1fr;gap:14px}
// .post-card{padding:14px}
// .post-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
// .author{font-weight:600}
// .timestamp{font-size:12px;color:var(--muted)}
// .post-content p{margin:0 0 8px 0;line-height:1.5}
// .post-image{width:100%;border-radius:10px;margin-top:6px;max-height:420px;object-fit:cover}

// /* actions */
// .post-actions{display:flex;justify-content:space-between;align-items:center;margin-top:12px}
// .likes{display:flex;align-items:center;gap:10px}
// .like-count{font-weight:600;color:#111}
// .btn-like{background:var(--accent);color:#fff;border:none;padding:8px 10px;border-radius:8px;cursor:pointer}
// .btn-comment{
//   background: #f0f8ff;        /* light blue tint */
//   border: 1px solid #d0e7ff;
//   color: #007bff;
//   cursor: pointer;
//   font-size: 1rem;
//   padding: 6px 12px;
//   border-radius: 10px;
//   transition: background 0.2s, transform 0.1s;
// }

// /* comments */
// .comments{margin-top:12px;padding-left:6px}
// .comment{display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;color:#111}
// .comment-icon{font-size:14px}
// .comment-text{font-size:14px;color:#111}

// /* utilities */
// .btn-primary{background:var(--accent);color:white;padding:10px 14px;border-radius:10px;border:none;cursor:pointer;font-weight:600}
// .btn-primary:disabled{opacity:0.6;cursor:not-allowed}
// .danger{color:var(--danger)}
// `;







// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { postJSON, getAuth, patchAuth, deleteJSON } from "./api";

/* ------------------ AuthPage ------------------ */
function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // login | register
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", username: "", password: "" });

  function onChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { email: form.email, username: form.username, password: form.password };
      const res = await postJSON("/auth/register", body);
      alert("Register response: " + JSON.stringify(res));
      // After successful signup, navigate to /post (no auto-login here)
      onAuthSuccess({ token: null, navigateTo: "/post" });
    } catch (err) {
      alert("Register failed: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { identifier: form.email || form.username, password: form.password };
      const res = await postJSON("/auth/login", body);
      if (res.access_token) {
        alert("Login success — token saved");
        onAuthSuccess({ token: res.access_token, navigateTo: "/post" });
      } else {
        alert("Login failed: " + JSON.stringify(res));
      }
    } catch (err) {
      alert("Login error: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-root" style={{ color: "#000" }}>
      <div className="auth-toggle">
        <button
          className={`btn-outline ${mode === "login" ? "active" : ""}`}
          onClick={() => setMode("login")}
          disabled={mode === "login"}
        >
          Login
        </button>
        <button
          className={`btn-outline ${mode === "register" ? "active" : ""}`}
          onClick={() => setMode("register")}
          disabled={mode === "register"}
        >
          Sign up
        </button>
      </div>

      {mode === "register" && (
        <form onSubmit={handleRegister} className="card form-card">
          <h2>Create account</h2>

          <label className="field">
            <div className="field-label">Email</div>
            <input name="email" value={form.email} onChange={onChange} required />
          </label>

          <label className="field">
            <div className="field-label">Username</div>
            <input name="username" value={form.username} onChange={onChange} required />
          </label>

          <label className="field">
            <div className="field-label">Password</div>
            <input name="password" value={form.password} onChange={onChange} type="password" required />
          </label>

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      )}

      {mode === "login" && (
        <form onSubmit={handleLogin} className="card form-card">
          <h2>Login</h2>

          <label className="field">
            <div className="field-label">Email or username</div>
            <input name="email" value={form.email} onChange={onChange} required />
          </label>

          <label className="field">
            <div className="field-label">Password</div>
            <input name="password" value={form.password} onChange={onChange} type="password" required />
          </label>

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ------------------ PostPage (backend-ready UI) ------------------ */
function PostPage({ token, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // for top-right Add Post button
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  // liked set (store post ids user liked). persisted to localStorage for this demo.
  const [likedIds, setLikedIds] = useState(() => {
    try {
      const raw = localStorage.getItem("liked_posts");
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  // currentUser fetched from backend (so we can show delete only to author)
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // initial load: fetch posts from backend
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/posts");
        const data = await res.json();
        if (!cancelled) setPosts(data);
      } catch (err) {
        console.error("Load posts failed:", err);
        // fallback: keep local dummy posts so UI is visible
        if (!cancelled) {
          setPosts([
            {
              id: "1",
              author_username: "john_doe",
              content: "Check out this cool AI image! https://unsplash.com/photos/JmuyB_LibRo",
              image: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=600",
              likes: 4,
              comments: ["Awesome!", "Looks great"],
              created_at: new Date().toISOString(),
              author_id: "user-john",
            },
            {
              id: "2",
              author_username: "sowmya123",
              content: "My morning coffee ☕✨ — https://unsplash.com/photos/7okkFhxrxNw",
              image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600",
              likes: 10,
              comments: ["So aesthetic!", "I want this!"],
              created_at: new Date().toISOString(),
              author_id: "user-sowmya",
            },
          ]);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // persist liked ids to localStorage
    try {
      localStorage.setItem("liked_posts", JSON.stringify(Array.from(likedIds)));
    } catch {}
  }, [likedIds]);

  // fetch current user info when token changes (so we can know who is logged in)
  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      if (!token) {
        setCurrentUser(null);
        return;
      }
      try {
        // your API helper: getAuth(path, token)
        const me = await getAuth("/auth/me", token);
        if (!cancelled) setCurrentUser(me);
      } catch (err) {
        console.warn("Could not load current user:", err);
        if (!cancelled) setCurrentUser(null);
      }
    }
    loadMe();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Add post (calls backend when token present; otherwise alert)
  async function handleAddPost(e) {
    e.preventDefault();
    if (!token) return alert("You must be logged in to create a post.");
    setLoading(true);
    try {
      // call backend create post
      const payload = { title: newTitle || null, content: newContent || "" };
      const res = await postJSON("/posts", payload); // postJSON attaches Authorization automatically from localStorage
      // server returns created post; prepend to feed
      setPosts((p) => [res, ...p]);
      setNewTitle("");
      setNewContent("");
      setShowAdd(false);
    } catch (err) {
      alert("Create post failed: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  // Toggle like entirely frontend-only (no /like or /unlike calls)
  function toggleLike(post) {
    if (!token) return alert("Please login to like posts.");
    const isLiked = likedIds.has(post.id);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== post.id) return p;
        const currentLikes = Number(p.likes || 0);
        return { ...p, likes: isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1 };
      })
    );

    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(post.id);
      else next.add(post.id);
      return next;
    });
  }

  // Comment (requires login)
  async function addComment(postId) {
    if (!token) return alert("Please login to comment.");
    const text = prompt("Write a comment:");
    if (!text) return;
    try {
      const res = await postJSON(`/posts/${postId}/comments`, { text });
      setPosts((prev) => prev.map((p) => (p.id === postId ? res : p)));
    } catch (err) {
      alert("Add comment failed: " + (err.message || err));
    }
  }

  // Delete handler: calls DELETE /posts/{post_id} and removes from UI
  async function handleDeletePost(postId) {
    if (!token) return alert("You must be logged in to delete a post.");
    if (!confirm("Delete this post? This cannot be undone.")) return;

    try {
      await deleteJSON(`/posts/${postId}`);
      // remove from UI
      setPosts((p) => p.filter((x) => x.id !== postId));
      // clear liked if present
      setLikedIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    } catch (err) {
      // show useful message
      if (err && err.status === 403) {
        alert("You are not authorized to delete this post.");
      } else if (err && err.status === 404) {
        alert("Post not found (already deleted).");
      } else {
        alert("Delete failed: " + (err.message || JSON.stringify(err.body || err)));
      }
    }
  }

  return (
    <div className="page-root" style={{ color: "#000" }}>
      {/* Add small CSS here so whole page gets styled without extra files */}
      <style>{globalStyles}</style>

      <div className="page-header">
        <h2 className="page-title">Feed</h2>

        <div className="header-actions">
          <button className="btn-comment" onClick={() => setShowAdd((s) => !s)}>
            + Add post
          </button>
          <button className="btn-ghost danger" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleAddPost} className="card add-panel">
          <div className="add-row">
            <input
              placeholder="Title (optional)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="input"
            />
            <textarea
              placeholder="Write something..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="textarea"
            />
          </div>

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create post"}
            </button>
            <button type="button" className="btn-outline" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="feed">
        {posts.map((post) => (
          <article key={post.id} className="card post-card">
            <div className="post-top">
              <div className="author">@{post.author_username || post.username || "anon"}</div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="timestamp">{post.created_at ? new Date(post.created_at).toLocaleString() : ""}</div>

                {/* show delete only if we know current user and they are the author */}
                {currentUser && currentUser.id === post.author_id && (
                  <button
                    aria-label="Delete post"
                    title="Delete post"
                    className="btn-ghost danger"
                    onClick={() => handleDeletePost(post.id)}
                    style={{ padding: "6px 8px", borderRadius: 8 }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>

            <div className="post-content">
              <p>{post.content}</p>
              {post.image && <img src={post.image} alt="" className="post-image" />}
            </div>

            <div className="post-actions">
              <div className="likes">
                <span className="like-count">❤️ {post.likes || 0}</span>
                <button className="btn-like" onClick={() => toggleLike(post)}>
                  {likedIds.has(post.id) ? "Unlike" : "Like"}
                </button>
              </div>

              <div>
                <button className="btn-comment" onClick={() => addComment(post.id)}>
                  Comment
                </button>
              </div>
            </div>

            <div className="comments">
              {(post.comments || []).map((c, i) => (
                <div key={i} className="comment">
                  <span className="comment-icon">💬</span> <span className="comment-text">{c}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="page-footer">
        <Link to="/">Back to auth</Link>
      </div>
    </div>
  );
}

/* ------------------ App (Router) ------------------ */
export default function App() {
  // global state kept here
  const [token, setToken] = useState(localStorage.getItem("access") || "");

  useEffect(() => {
    if (token) localStorage.setItem("access", token);
    else localStorage.removeItem("access");
  }, [token]);

  // centralized logout that clears token + liked posts + localStorage and navigates to "/"
  function handleLogout(navigate) {
    setToken("");
    try {
      localStorage.removeItem("access");
      localStorage.removeItem("liked_posts");
    } catch {}
    if (navigate) navigate("/");
  }

  return (
    <BrowserRouter>
      <div className="app-shell" style={{ color: "#000" }}>
        <style>{globalStyles}</style>
        <header className="topbar">
          <div className="brand">Social Frontend</div>
          <div className="top-actions" />
        </header>

        <main className="main-container">
          <Routes>
            <Route path="/" element={<AuthEntry token={token} setToken={setToken} onGlobalLogout={handleLogout} />} />
            <Route
              path="/post"
              element={
                <PostPage
                  token={token}
                  onLogout={() => {
                    // navigate programmatically after logout
                    setToken("");
                    try {
                      localStorage.removeItem("access");
                      localStorage.removeItem("liked_posts");
                    } catch {}
                    window.location.href = "/";
                  }}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

/* ------------------ AuthEntry wrapper ------------------ */
function AuthEntry({ token, setToken, onGlobalLogout }) {
  const navigate = useNavigate();

  function handleAuthSuccess({ token: newToken, navigateTo }) {
    if (newToken) setToken(newToken);
    if (navigateTo) navigate(navigateTo);
  }

  function logout() {
    setToken("");
    try {
      localStorage.removeItem("access");
      localStorage.removeItem("liked_posts");
    } catch {}
    navigate("/");
  }

  return (
    <div className="auth-page" style={{ color: "#000" }}>
      <div className="auth-top">
        {token && (
          <button className="btn-ghost danger" onClick={logout}>
            Logout
          </button>
        )}
      </div>

      <AuthPage onAuthSuccess={handleAuthSuccess} />
    </div>
  );
}

/* ------------------ Styles ------------------ */
const globalStyles = `
:root{
  --bg: #f6f7fb;
  --card: #ffffff;
  --muted: #6b7280;
  --accent: #2563eb;
  --danger: #dc2626;
  --glass: rgba(255,255,255,0.6);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

*{box-sizing:border-box}
body,html,#root{height:100%;margin:0;background:white !important;color:#000}

.app-shell{min-height:100vh;display:flex;flex-direction:column}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 28px;background:linear-gradient(90deg, #fff, #fbfbff);box-shadow:0 1px 0 rgba(0,0,0,0.04)}
.brand{font-weight:700;font-size:18px;color:#111}
.site-footer{text-align:center;padding:18px 0;color:var(--muted);font-size:13px}

.main-container{flex:1;display:flex;justify-content:center;padding:28px}
.page-root{width:100%;max-width:920px}

/* auth styles */
.auth-top{display:flex;justify-content:flex-end;align-items:center;margin-bottom:12px}
.token-indicator{font-size:14px;color:var(--muted)}
.auth-root{display:block}
.auth-toggle{display:flex;gap:8px;margin-bottom:16px}
.btn-outline{background:transparent;border:1px solid #e6e9ef;padding:8px 12px;border-radius:8px;cursor:pointer;color:#111}
.btn-outline.active{border-color:var(--accent);box-shadow:0 4px 12px rgba(37,99,235,0.08)}
.card{background:var(--card);padding:16px;border-radius:12px;box-shadow:0 6px 18px rgba(17,24,39,0.06);border:1px solid rgba(15,23,42,0.03)}
.form-card{max-width:640px}
.field{display:block;margin-bottom:10px}
.field-label{font-size:13px;color:var(--muted);margin-bottom:6px}
.input,input,textarea{width:100%;padding:10px;border-radius:8px;border:1px solid #e6e9ef;font-size:14px}
.textarea{min-height:96px;resize:vertical}
.form-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}

/* page header */
.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.page-title{margin:0;font-size:20px}

/* header actions */
.header-actions{display:flex;gap:8px;align-items:center}
.btn-ghost{background:transparent;border:1px solid rgba(15,23,42,0.06);padding:8px 12px;border-radius:10px;cursor:pointer}
.btn-ghost.danger{border-color:var(--danger);color:var(--danger)}

/* add panel */
.add-panel{margin-bottom:18px}
.add-row{display:flex;flex-direction:column;gap:8px}

/* feed */
.feed{display:grid;grid-template-columns:1fr;gap:14px}
.post-card{padding:14px}
.post-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.author{font-weight:600}
.timestamp{font-size:12px;color:var(--muted)}
.post-content p{margin:0 0 8px 0;line-height:1.5}
.post-image{width:100%;border-radius:10px;margin-top:6px;max-height:420px;object-fit:cover}

/* actions */
.post-actions{display:flex;justify-content:space-between;align-items:center;margin-top:12px}
.likes{display:flex;align-items:center;gap:10px}
.like-count{font-weight:600;color:#111}
.btn-like{background:var(--accent);color:#fff;border:none;padding:8px 10px;border-radius:8px;cursor:pointer}
.btn-comment{
  background: #f0f8ff;        /* light blue tint */
  border: 1px solid #d0e7ff;
  color: #007bff;
  cursor: pointer;
  font-size: 1rem;
  padding: 6px 12px;
  border-radius: 10px;
  transition: background 0.2s, transform 0.1s;
}

/* comments */
.comments{margin-top:12px;padding-left:6px}
.comment{display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;color:#111}
.comment-icon{font-size:14px}
.comment-text{font-size:14px;color:#111}

/* utilities */
.btn-primary{background:var(--accent);color:white;padding:10px 14px;border-radius:10px;border:none;cursor:pointer;font-weight:600}
.btn-primary:disabled{opacity:0.6;cursor:not-allowed}
.danger{color:var(--danger)}
`;
