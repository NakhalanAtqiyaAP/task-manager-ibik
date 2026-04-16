import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, MessageSquare, Trash2 } from 'lucide-react';
import CreatePost from './CreatePost'; // Impor form yang tadi

export default function GalleryPage({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-center p-10 font-black text-white animate-pulse">MEMUAT_MEMORI_SQUAD...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-12 border-b-8 border-black pb-4">
        <h1 className="text-5xl font-black text-white uppercase italic">TI-25-KA GALLERY</h1>
        <p className="bg-yellow-400 border-2 border-black inline-block px-3 py-1 font-bold uppercase mt-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Abadikan Momen Kuliah Kita
        </p>
      </header>

      <CreatePost user={user} onPostCreated={fetchPosts} />

      <div className="grid grid-cols-1 gap-12">
        {posts.map((post) => {
          const hasLiked = post.post_likes.some(l => l.student_id === user.id);
          
          return (
            <div key={post.id} className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden group">
              {/* Header Post */}
              <div className="p-4 border-b-4 border-black flex items-center justify-between bg-purple-100">
                <div className="flex items-center gap-3">
                  <img 
                    src={post.students.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${post.students.nama}`} 
                    className="w-10 h-10 rounded-full border-2 border-black bg-white"
                  />
                  <span className="font-black uppercase text-sm">{post.students.nama}</span>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Media Content */}
              {post.media_url && (
                <div className="border-b-4 border-black bg-black flex justify-center max-h-[500px] overflow-hidden">
                  {post.media_type === 'image' ? (
                    <img src={post.media_url} className="w-full h-auto object-contain" />
                  ) : (
                    <video src={post.media_url} controls className="w-full" />
                  )}
                </div>
              )}

              {/* Teks Content */}
              <div className="p-6">
                <p className="font-bold text-lg leading-tight">{post.content_text}</p>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t-4 border-black flex gap-6 bg-gray-50">
                <button 
                  onClick={() => handleLike(post.id, hasLiked)}
                  className={`flex items-center gap-2 font-black transition-transform active:scale-125 ${hasLiked ? 'text-red-500' : 'text-black'}`}
                >
                  <Heart fill={hasLiked ? 'currentColor' : 'none'} size={24} strokeWidth={3} />
                  <span>{post.post_likes.length}</span>
                </button>
                
                <div className="flex items-center gap-2 font-black">
                  <MessageSquare size={24} strokeWidth={3} />
                  <span>{post.post_comments.length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}