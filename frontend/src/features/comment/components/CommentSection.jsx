import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../../../services/apiClient";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

const CommentSection = ({ postId, targetType }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const response = await apiClient.get(`/feed/${postId}/comments`);
      setComments(response.data?.data || []);
    } catch (err) {
      toast.error("Could not load comments");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async (body) => {
    setSubmitting(true);
    try {
      await apiClient.post(`/feed/${postId}/comments`, { body, targetType });
      fetchComments();
      toast.success("Comment posted");
    } catch (err) {
      toast.error("Could not post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await apiClient.delete(`/feed/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
      toast.info("Comment deleted");
    } catch (err) {
      toast.error("Could not delete comment");
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-50 space-y-4">
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin text-gray-300" size={20} />
        </div>
      ) : (
        <div className="space-y-4">
          {(!comments || comments.length === 0) ? (
            <p className="text-[11px] text-center text-gray-400 font-bold uppercase tracking-widest py-2">
              No intelligence logs found
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onDelete={handleDeleteComment} 
              />
            ))
          )}
        </div>
      )}
      
      <CommentInput onSend={handleAddComment} loading={submitting} />
    </div>
  );
};

export default CommentSection;
