import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, MessageSquare, Trash2, Edit3, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import CreatePost from '../components/Form/FormGallery'; 
import CommentModal from '../components/CommentModal'

export default function GalleryPage({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPost, setSelectedPost] = useState(null);

  // State untuk mode edit
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        students ( nama, avatar_url ),
        post_likes ( student_id ),
        post_comments ( id )
      `)
      .order('created_at', { ascending: false });

    if (!error) setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleLike = async (postId, hasLiked) => {
    if (hasLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('student_id', user.id);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, student_id: user.id });
    }
    fetchPosts();
  };

  // FUNGSI HAPUS POSTINGAN
  const handleDelete = async (postId) => {
    if (!window.confirm('Yakin ingin menghapus postingan ini?')) return;

    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      
      toast.success('Postingan berhasil dihapus!');
      fetchPosts();
    } catch (error) {
      toast.error('Gagal menghapus postingan: ' + error.message);
    }
  };

  // FUNGSI MULAI EDIT
  const startEdit = (post) => {
    setEditingPostId(post.id);
    setEditContent(post.content_text || '');
  };

  // FUNGSI SIMPAN EDIT
  const saveEdit = async (postId) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content_text: editContent })
        .eq('id', postId);

      if (error) throw error;

      toast.success('Postingan diperbarui!');
      setEditingPostId(null);
      fetchPosts();
    } catch (error) {
      toast.error('Gagal mengedit: ' + error.message);
    }
  };

  if (loading) return <div className="text-center p-10 font-black text-green-400 animate-pulse">MEMUAT GALLERY...</div>;

  return (
    <>
      <div className="max-w-4xl mx-auto pb-20">
        <header className="mb-12 border-b-8 border-black pb-4">
          <h1 className="text-5xl font-black text-white uppercase italic">TI-25-KA GALLERY</h1>
          <p className="bg-green-400 border-2 border-black inline-block px-3 py-1 font-bold uppercase mt-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Abadikan Momen Kuliah Kita
          </p>
        </header>

        <CreatePost user={user} onPostCreated={fetchPosts} />

        <div className="grid grid-cols-1 gap-12">
          {posts.map((post) => {
            const hasLiked = post.post_likes.some(l => l.student_id === user.id);
            const isOwner = post.student_id === user.id;
            const isEditing = editingPostId === post.id;
            
            return (
              <div key={post.id} className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden group">
                {/* ... Header Post ... */}
                <div className="p-4 border-b-4 border-black flex items-center justify-between bg-purple-100">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.students?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${post.students?.nama}`} 
                      className="w-10 h-10 rounded-full border-2 border-black bg-white"
                    />
                    <div>
                      <span className="font-black uppercase text-sm block leading-none">{post.students?.nama}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {isOwner && !isEditing && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(post)} className="p-1.5 bg-green-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Edit3 size={16} strokeWidth={3} /></button>
                      <button onClick={() => handleDelete(post.id)} className="p-1.5 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Trash2 size={16} strokeWidth={3} /></button>
                    </div>
                  )}
                </div>

                {/* ... Media & Text Content ... */}
                {post.media_url && (
                  <div className="border-b-4 border-black bg-black flex justify-center max-h-[500px] overflow-hidden">
                    {post.media_type === 'image' ? <img src={post.media_url} className="w-full h-auto object-contain" /> : <video src={post.media_url} controls className="w-full" />}
                  </div>
                )}

                <div className="p-6">
                  {isEditing ? (
                    /* ... Form Edit ... */
                    <div className="flex flex-col gap-3">
                      <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full border-4 border-black p-3 font-bold focus:bg-yellow-50 min-h-[100px]" />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingPostId(null)} className="bg-gray-200 border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Batal</button>
                        <button onClick={() => saveEdit(post.id)} className="bg-green-400 border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Simpan</button>
                      </div>
                    </div>
                  ) : (
                    <p className="font-bold text-lg leading-tight whitespace-pre-wrap">{post.content_text}</p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="p-4 border-t-4 border-black flex gap-6 bg-gray-50">
                  <button onClick={() => handleLike(post.id, hasLiked)} className={`flex items-center gap-2 font-black ${hasLiked ? 'text-red-500' : 'text-black'}`}>
                    <Heart fill={hasLiked ? 'currentColor' : 'none'} size={24} strokeWidth={3} />
                    <span>{post.post_likes.length}</span>
                  </button>
                  
                  <button onClick={() => setSelectedPost(post)} className="flex items-center gap-2 font-black hover:text-blue-600">
                    <MessageSquare size={24} strokeWidth={3} />
                    <span>{post.post_comments.length}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PINDAHKAN KE SINI (Di dalam Return, di bawah Div utama) */}
      {selectedPost && (
        <CommentModal 
          post={selectedPost} 
          user={user} 
          onClose={() => setSelectedPost(null)} 
          onCommentAdded={fetchPosts} 
        />
      )}
    </>
  );
}