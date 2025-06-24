import { useState } from 'react';

const CommentBox = () => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const handleSubmit = () => {
    if (!comment.trim()) return;
    
    const newComment = {
      id: Date.now(),
      text: comment
    };
    
    setComments([newComment, ...comments]);
    setComment('');
  };

  return (
    <div className="comments-container">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
      />
      <br />
      <button onClick={handleSubmit}>Submit</button>
      
      <div className="comments-list">
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            {c.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentBox;