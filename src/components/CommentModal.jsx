import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Send, Trash2, Heart, Reply } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommentModal({ post, user, onClose, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // Menyimpan objek komentar yang sedang dibalas
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        students ( nama, avatar_url ),
        comment_likes ( student_id )
      `)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (!error) setComments(data);
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, [post.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase.from('post_comments').insert({
        post_id: post.id,
        student_id: user.id,
        comment_text: newComment,
        parent_id: replyingTo ? replyingTo.id : null
      });

      if (error) throw error;
      setNewComment('');
      setReplyingTo(null);
      fetchComments();
      onCommentAdded();
    } catch (error) {
      toast.error("Gagal mengirim komentar");
    }
  };

  const handleLikeComment = async (commentId, hasLiked) => {
    if (hasLiked) {
      await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('student_id', user.id);
    } else {
      await supabase.from('comment_likes').insert({ comment_id: commentId, student_id: user.id });
    }
    fetchComments();
  };

  // Filter komentar utama dan balasan
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Container Modal Besar */}
      <div className="relative w-full max-w-6xl h-full md:h-[85vh] bg-white border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row overflow-hidden">
        
        {/* KOLOM KIRI: Media (Hanya tampil di Desktop) */}
        <div className="hidden md:flex flex-[1.5] bg-black items-center justify-center border-r-4 border-black relative">
          {post.media_url ? (
            post.media_type === 'image' ? (
              <img src={post.media_url} className="w-full h-full object-contain" />
            ) : (
              <video src={post.media_url} controls className="w-full max-h-full" />
            )
          ) : (
            <div className="text-white font-black text-2xl uppercase italic p-10 text-center">
              "{post.content_text}"
            </div>
          )}
        </div>

        {/* KOLOM KANAN: Komentar */}
        <div className="flex flex-1 flex-col h-full bg-gray-50">
          {/* Header */}
          <div className="p-4 border-b-4 border-black bg-green-400 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="font-black uppercase italic text-lg">Postingan</h3>
            </div>
            <button onClick={onClose} className="bg-white border-2 border-black p-1 hover:bg-red-500 transition-colors">
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          {/* List Komentar */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {rootComments.map((comment) => {
              const hasLiked = comment.comment_likes?.some(l => l.student_id === user.id);
              const replies = getReplies(comment.id);

              return (
                <div key={comment.id} className="space-y-4">
                  {/* Komentar Utama */}
                  <div className="flex gap-3 group">
                    <img 
                      src={comment.students?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${comment.students?.nama}`} 
                      className="w-10 h-10 rounded-full border-2 border-black bg-purple-200 shrink-0"
                    />
                    <div className="flex-1">
                      <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
                        <span className="text-xs font-black uppercase text-purple-700 block mb-1">{comment.students?.nama}</span>
                        <p className="text-sm font-bold leading-tight">{comment.comment_text}</p>
                      </div>
                      
                      {/* Action Komentar */}
                      <div className="flex gap-4 mt-2 ml-1 items-center">
                        <button 
                          onClick={() => handleLikeComment(comment.id, hasLiked)}
                          className={`flex items-center gap-1 text-[10px] font-black uppercase transition-colors ${hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-black'}`}
                        >
                          <Heart size={14} fill={hasLiked ? "currentColor" : "none"} /> {comment.comment_likes?.length || 0} LIKE
                        </button>
                        <button 
                          onClick={() => {
                            setReplyingTo(comment);
                            document.getElementById('comment-input').focus();
                          }}
                          className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-500 hover:text-black"
                        >
                          <Reply size={14} /> BALAS
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rendering Balasan (Nested) */}
                  {replies.map(reply => {
                    const replyHasLiked = reply.comment_likes?.some(l => l.student_id === user.id);
                    return (
                      <div key={reply.id} className="ml-12 flex gap-3">
                         <img 
                          src={reply.students?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${reply.students?.nama}`} 
                          className="w-7 h-7 rounded-full border-2 border-black bg-green-200 shrink-0"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-100 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <span className="text-[10px] font-black uppercase text-blue-700 block">{reply.students?.nama}</span>
                            <p className="text-xs font-bold leading-tight">{reply.comment_text}</p>
                          </div>
                          <button 
                            onClick={() => handleLikeComment(reply.id, replyHasLiked)}
                            className={`mt-1 text-[9px] font-black uppercase ${replyHasLiked ? 'text-red-500' : 'text-gray-500'}`}
                          >
                            {reply.comment_likes?.length || 0} LIKE
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Input Footer */}
          <div className="shrink-0">
            {replyingTo && (
              <div className="bg-blue-100 border-t-4 border-black px-4 py-1 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase">Membalas @{replyingTo.students?.nama}</span>
                <button onClick={() => setReplyingTo(null)} className="text-red-500 font-bold text-xs">BATAL</button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="p-4 border-t-4 border-black bg-white flex gap-2">
              <input 
                id="comment-input"
                type="text"
                placeholder={replyingTo ? "Tulis balasan..." : "Tulis komentar..."}
                className="flex-1 border-2 border-black p-3 font-bold focus:outline-none focus:bg-yellow-50 text-sm"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-green-500 text-white border-2 border-black px-6 py-2 font-black hover:bg-green-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
              >
                KIRIM
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}