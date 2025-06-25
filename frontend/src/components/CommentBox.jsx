import { useState } from 'react';
// import { Meme } from "../../../api/models/meme";
import { getCommentsByMeme } from '../../../api/controllers/comments';

const CreateComment = (props) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (comment.length > 0) {
        await CreateComment(token, comment, props.Meme);
        setComment("");

        const data = await getCommentsByMeme(token, props.Meme);
        props.setComments(data.comments);
        props.updateCommentCount(+1);
      } else {
        throw new Error("Empty comment submitted");
      }
    } catch (error) {
      console.error(error);
    }

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


export default CreateComment;