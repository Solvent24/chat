import React, { useState, useRef, useEffect } from "react";
import "./BlogFeature.css";

const initialPosts = [
  {
    id: 1,
    author: "John Doe",
    content: "This is my first blog post! I'm excited to share my thoughts with everyone. The journey of blogging begins here!",
    likes: 0,
    comments: [],
    timestamp: new Date('2024-01-15'),
  },
  {
    id: 2,
    author: "Jane Smith",
    content: "Hello everyone, welcome to my blog! I'll be sharing my experiences and insights about technology and design.",
    likes: 0,
    comments: [],
    timestamp: new Date('2024-01-16'),
  },
  {
    id: 3,
    author: "Mike Johnson",
    content: "Just launched my new project! It's been an incredible journey building this from scratch. Can't wait to share more details soon.",
    likes: 0,
    comments: [],
    timestamp: new Date('2024-01-17'),
  },
  {
    id: 4,
    author: "Sarah Wilson",
    content: "The future of web development is here! Exploring new frameworks and tools that are changing how we build applications.",
    likes: 0,
    comments: [],
    timestamp: new Date('2024-01-18'),
  },
  {
    id: 5,
    author: "Alex Chen",
    content: "Machine learning insights: How AI is transforming everyday applications. From recommendation systems to natural language processing.",
    likes: 0,
    comments: [],
    timestamp: new Date('2024-01-19'),
  },
];

const BlogFeature = () => {
  const [posts, setPosts] = useState(initialPosts);
  const [commentInputs, setCommentInputs] = useState({});
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const postRefs = useRef([]);
  const containerRef = useRef(null);

  // Initialize refs
  useEffect(() => {
    postRefs.current = postRefs.current.slice(0, posts.length);
  }, [posts]);

  // Scroll to post function
  const scrollToPost = (index) => {
    if (postRefs.current[index]) {
      setIsScrolling(true);
      postRefs.current[index].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      setCurrentPostIndex(index);
      
      // Reset scrolling state after animation
      setTimeout(() => setIsScrolling(false), 1000);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isScrolling) return;
      
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (currentPostIndex + 1) % posts.length;
        scrollToPost(nextIndex);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = (currentPostIndex - 1 + posts.length) % posts.length;
        scrollToPost(prevIndex);
      } else if (e.key === 'Home') {
        e.preventDefault();
        scrollToPost(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollToPost(posts.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPostIndex, posts.length, isScrolling]);

  // Auto-scroll to current post when it changes
  useEffect(() => {
    if (!isScrolling && postRefs.current[currentPostIndex]) {
      postRefs.current[currentPostIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentPostIndex, isScrolling]);

  const handleLike = (id) => {
    setPosts(
      posts.map((post) =>
        post.id === id ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleComment = (id) => {
    const commentText = commentInputs[id];
    if (!commentText) return;

    setPosts(
      posts.map((post) =>
        post.id === id
          ? { ...post, comments: [...post.comments, commentText] }
          : post
      )
    );

    setCommentInputs({ ...commentInputs, [id]: "" });
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="blog-container" ref={containerRef}>
      {/* Navigation Header */}
      <div className="blog-navigation">
        <h2>Blog Posts</h2>
        <div className="nav-controls">
          <button 
            className="nav-btn prev"
            onClick={() => scrollToPost((currentPostIndex - 1 + posts.length) % posts.length)}
            disabled={isScrolling}
          >
            ← Previous
          </button>
          
          <div className="post-indicator">
            {posts.map((_, index) => (
              <button
                key={index}
                className={`indicator-dot ${index === currentPostIndex ? 'active' : ''}`}
                onClick={() => scrollToPost(index)}
                disabled={isScrolling}
              />
            ))}
          </div>
          
          <button 
            className="nav-btn next"
            onClick={() => scrollToPost((currentPostIndex + 1) % posts.length)}
            disabled={isScrolling}
          >
            Next →
          </button>
        </div>
        
        <div className="scroll-hint">
          <span>Use arrow keys or click dots to navigate</span>
        </div>
      </div>

      {/* Posts */}
      <div className="posts-container">
        {posts.map((post, index) => (
          <div 
            key={post.id}
            ref={el => postRefs.current[index] = el}
            className={`post-card ${index === currentPostIndex ? 'active' : ''}`}
          >
            <div className="post-header">
              <h3>{post.author}</h3>
              <span className="post-date">{formatDate(post.timestamp)}</span>
            </div>
            
            <p>{post.content}</p>
            
            <div className="actions">
              <button 
                className={`like-btn ${post.likes > 0 ? 'liked' : ''}`}
                onClick={() => handleLike(post.id)}
              >
                ❤️ Like ({post.likes})
              </button>
            </div>
            
            <div className="comments-section">
              <h4>Comments ({post.comments.length})</h4>
              {post.comments.length === 0 ? (
                <p className="no-comments">No comments yet. Be the first to comment!</p>
              ) : (
                <ul>
                  {post.comments.map((comment, idx) => (
                    <li key={idx}>{comment}</li>
                  ))}
                </ul>
              )}
              <div className="add-comment">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[post.id] || ""}
                  onChange={(e) =>
                    setCommentInputs({
                      ...commentInputs,
                      [post.id]: e.target.value,
                    })
                  }
                  onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                />
                <button onClick={() => handleComment(post.id)}>Post</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Navigation Footer */}
      <div className="blog-footer">
        <div className="quick-nav">
          <span>Jump to:</span>
          {posts.map((post, index) => (
            <button
              key={post.id}
              className={`quick-nav-btn ${index === currentPostIndex ? 'active' : ''}`}
              onClick={() => scrollToPost(index)}
            >
              Post {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogFeature;