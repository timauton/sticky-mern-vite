import { useState, useEffect } from 'react';
import { getComments, createComment } from '../services/commentsService';

export const Comments = (props) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {

    updateComments(props.meme._id);
    
  }, [props.meme]);

  const updateComments = async (meme_id) => {
    //console.log("Getting comments for meme id " + meme_id);
    const data = await getComments(meme_id);
    //console.log("Comments for meme are: " + data);
    setComments(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (comment.length > 0) {
        const newComment = await createComment(props.meme._id, comment);
        setComments([newComment.comment, ...comments]);
        setComment('');
      } else {
        throw new Error("Empty comment submitted");
      }
    } catch (error) {
      console.error(error);
    }

    if (!comment.trim()) return;
     
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
            {c.comment}, #{c.user_id.username}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;