import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Send, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommentModal({ post, user, onClose, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        students ( nama, avatar_url )
      `)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (!error) setComments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [post.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase.from('post_comments').insert({
        post_id: post.id,
        student_id: user.id,
        comment_text: newComment
      });

      if (error) throw error;
      setNewComment('');
      fetchComments();
      onCommentAdded(); // Update jumlah komen di GalleryPage
    } catch (error) {
      toast.error("Gagal mengirim komentar");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await supabase.from('post_comments').delete().eq('id', commentId);
      fetchComments();
      onCommentAdded();
    } catch (error) {
      toast.error("Gagal menghapus komentar");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b-4 border-black bg-yellow-400 flex justify-between items-center">
          <h3 className="font-black uppercase italic text-lg">// KOMENTAR_SQUAD</h3>
          <button onClick={onClose} className="bg-white border-2 border-black p-1 hover:bg-red-500 transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* List Komentar */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="text-center font-bold animate-pulse">MEMUAT_KOMEN...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-black font-bold text-gray-400 uppercase">
              Belum ada komentar. Jadi yang pertama!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-3">
                <img 
                  src={comment.students?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${comment.students?.nama}`} 
                  className="w-8 h-8 rounded-full border-2 border-black bg-purple-200"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black uppercase text-purple-700">{comment.students?.nama}</span>
                    {comment.student_id === user.id && (
                      <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 hover:scale-110 transition-transform">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-bold leading-tight mt-1">{comment.comment_text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSubmit} className="p-4 border-t-4 border-black bg-white flex gap-2">
          <input 
            type="text"
            placeholder="Tulis komentar..."
            className="flex-1 border-2 border-black p-2 font-bold focus:outline-none focus:bg-yellow-50"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white border-2 border-black px-4 py-2 font-black hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}