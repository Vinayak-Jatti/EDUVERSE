import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../../../services/apiClient";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

import { ConfirmModal } from "../../../components/shared";

const CommentSection = ({ postId, targetType }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchComments = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/feed/${postId}/comments`);
      setComments(data?.data || []);
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

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await apiClient.delete(`/feed/comments/${deleteTargetId}`);
      setComments(comments.filter((c) => c.id !== deleteTargetId));
      toast.info("Comment deleted");
    } catch (err) {
      toast.error("Could not delete comment");
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-black/5 space-y-4">
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {(!comments || comments.length === 0) ? (
            <p className="text-[10px] text-center text-gray-300 font-bold uppercase tracking-[0.2em] py-4">
              Zero Engagement Logs
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onDelete={(id) => setDeleteTargetId(id)} 
              />
            ))
          )}
        </div>
      )}
      
      <div className="pt-2">
        <CommentInput onSend={handleAddComment} loading={submitting} />
      </div>

      <ConfirmModal 
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Delete Comment?"
        message="This removal is final and will be reflected in the EDUVERSE ledger."
        confirmText="Confirm Delete"
      />
    </div>
  );
};

export default CommentSection;
