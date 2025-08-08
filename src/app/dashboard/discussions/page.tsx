'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Plus, Send, Search, Clock, Sprout, AlertCircle } from 'lucide-react';
import { getDiscussions, createDiscussion, createReply, Discussion, updateDiscussion, deleteDiscussion } from '@/lib/discussion';
import { getSession, User as AuthUser } from '@/lib/auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreVertical, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

const ForumDiskusi = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [showReplyForms, setShowReplyForms] = useState<Record<string, boolean>>({});
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [newReplies, setNewReplies] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  // State untuk edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDiscussion, setEditingDiscussion] = useState<Discussion | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const router = useRouter();

  // Fetch current user session
  useEffect(() => {
    const fetchSession = async () => {
      const user = await getSession();
      if (!user) {
        router.push("/auth/login");
      } else {
        setCurrentUser(user);
      }
    };
    fetchSession();
  }, [router]); 


  const fetchDiscussions = async () => {
    try {
      setIsLoading(true);
      const data = await getDiscussions();
      setDiscussions(data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat diskusi. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (username: string | null | undefined) => {
    if (!username) return '?';
    return username
      .split(' ')
      .filter(Boolean)
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredDiscussions = discussions.filter((discussion) => {
    const title = discussion.title?.toLowerCase() || '';
    const content = discussion.content?.toLowerCase() || '';
    return title.includes(searchTerm.toLowerCase()) || content.includes(searchTerm.toLowerCase());
  });

  const handleSubmitDiscussion = async () => {
    if (newDiscussion.title && newDiscussion.content) {
      try {
        setIsSubmitting(true);
        await createDiscussion(newDiscussion.title, newDiscussion.content);
        await fetchDiscussions();
        setNewDiscussion({ title: '', content: '' });
        setShowNewDiscussion(false);
      } catch (err) {
        setError('Gagal membuat diskusi. Silakan coba lagi.');
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmitReply = async (discussionId: string) => {
    if (newReplies[discussionId]?.trim()) {
      try {
        setIsSubmitting(true);
        await createReply(discussionId, newReplies[discussionId]);
        await fetchDiscussions();
        setNewReplies((prev) => ({ ...prev, [discussionId]: '' }));
        setShowReplyForms((prev) => ({ ...prev, [discussionId]: false }));
      } catch (err) {
        setError('Gagal mengirim balasan. Silakan coba lagi.');
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleReplyForm = (discussionId: string) => {
    setShowReplyForms((prev) => ({
      ...prev,
      [discussionId]: !prev[discussionId],
    }));
  };

  const toggleExpandReplies = (discussionId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [discussionId]: !prev[discussionId],
    }));
  };

  const isCurrentUserPost = (username?: string | null) => {
    return currentUser && username && username.toLowerCase() === currentUser.username.toLowerCase();
  };

  // Fungsi untuk membuka dialog edit
  const handleEditDiscussion = (discussion: Discussion) => {
    setEditingDiscussion(discussion);
    setEditTitle(discussion.title);
    setEditContent(discussion.content);
    setEditDialogOpen(true);
  };

  // Fungsi untuk submit edit
  const handleSubmitEdit = async () => {
    if (!editingDiscussion || !editTitle || !editContent) return;

    try {
      setIsSubmitting(true);
      await updateDiscussion(editingDiscussion.id, editTitle, editContent);
      await fetchDiscussions();
      setEditDialogOpen(false);
    } catch (err) {
      setError('Gagal mengupdate diskusi. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk hapus diskusi
  const handleDeleteDiscussion = async (discussionId: string) => {
    try {
      setIsSubmitting(true);
      await deleteDiscussion(discussionId);
      await fetchDiscussions();
    } catch (err) {
      setError('Gagal menghapus diskusi. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && discussions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Memuat diskusi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Forum CekTani</h1>
                <p className="text-sm text-gray-600">Komunitas petani Indonesia</p>
              </div>
            </div>
            <Button onClick={() => setShowNewDiscussion(true)} className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">
              <Plus className="h-4 w-4 mr-2" />
              Diskusi Baru
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input placeholder="Cari diskusi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400" />
          </div>
        </div>

        {/* New Discussion Form */}
        {showNewDiscussion && (
          <Card className="mb-6 shadow-lg border-green-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-green-200">
              <h3 className="text-lg font-semibold text-green-800">Buat Diskusi Baru</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Input placeholder="Judul diskusi..." value={newDiscussion.title} onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })} className="border-green-200 focus:border-green-400 focus:ring-green-400" />
                <Textarea
                  placeholder="Tulis pertanyaan atau topik diskusi Anda..."
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                  rows={4}
                  className="border-green-200 focus:border-green-400 focus:ring-green-400"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSubmitDiscussion} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengirim...
                      </span>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Posting
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewDiscussion(false)} disabled={isSubmitting} className="border-gray-300 text-gray-600 hover:bg-gray-50">
                    Batal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Discussion List */}
        <div className="space-y-4">
          {filteredDiscussions.map((discussion) => (
            <Card key={discussion.id} className={`shadow-lg border-2 ${isCurrentUserPost(discussion.username) ? 'border-green-400' : 'border-gray-200'} bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200`}>
              <CardContent className="p-6">
                {/* Discussion Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className={`w-10 h-10 ${isCurrentUserPost(discussion.username) ? 'bg-green-200' : 'bg-green-100'} border-2 ${isCurrentUserPost(discussion.username) ? 'border-green-500' : 'border-green-200'}`}>
                      <AvatarFallback className={`${isCurrentUserPost(discussion.username) ? 'text-green-800 font-bold' : 'text-green-700 font-medium'}`}>{getInitials(discussion.username || 'Anonymous')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className={`font-semibold ${isCurrentUserPost(discussion.username) ? 'text-green-800' : 'text-gray-900'} capitalize`}>
                        {discussion.username || 'Pengguna'}
                        {isCurrentUserPost(discussion.username) && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Anda</span>}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(discussion.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {discussion.replies.length} balasan
                    </Badge>

                    {/* Dropdown Menu */}
                    {isCurrentUserPost(discussion.username) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0">
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleEditDiscussion(discussion)} className="cursor-pointer">
                            <Edit className="h-4 w-4 mr-2 text-gray-600" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              handleDeleteDiscussion(discussion.id);
                            }}
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span>Hapus</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Discussion Content */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">{discussion.title}</h2>
                  <p className="text-gray-700 leading-relaxed">{discussion.content}</p>
                </div>

                {/* Replies Toggle Button */}
                {discussion.replies.length > 0 && (
                  <div className="border-t border-green-100 pt-4 mt-4">
                    <Button variant="ghost" onClick={() => toggleExpandReplies(discussion.id)} className="text-green-600 hover:bg-green-50 px-0">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {expandedReplies[discussion.id] ? 'Sembunyikan' : 'Lihat'} balasan ({discussion.replies.length})
                      <svg className={`ml-2 h-4 w-4 transition-transform ${expandedReplies[discussion.id] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                  </div>
                )}

                {/* Replies Section */}
                {expandedReplies[discussion.id] && discussion.replies.length > 0 && (
                  <div className="border-t border-green-100 pt-4">
                    <div className="space-y-3">
                      {discussion.replies.map((reply, index) => (
                        <div key={index} className={`rounded-lg p-4 ${isCurrentUserPost(reply.username) ? 'bg-green-100 border-l-4 border-green-500' : 'bg-gray-50 border-l-4 border-gray-200'}`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <Avatar className={`w-8 h-8 ${isCurrentUserPost(reply.username) ? 'bg-green-300' : 'bg-green-200'}`}>
                              <AvatarFallback className={`text-sm ${isCurrentUserPost(reply.username) ? 'text-green-800 font-bold' : 'text-green-700'}`}>{getInitials(reply.username || 'Anonymous')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <span className={`font-medium ${isCurrentUserPost(reply.username) ? 'text-green-800' : 'text-gray-900'} capitalize`}>
                                {reply.username || 'Pengguna'}
                                {isCurrentUserPost(reply.username) && <span className="ml-2 text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full">Anda</span>}
                              </span>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(reply.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 ml-10">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                {showReplyForms[discussion.id] ? (
                  <div className="border-t border-green-100 pt-4 mt-4">
                    <div className="flex space-x-3">
                      <Avatar className="w-8 h-8 bg-blue-100 flex-shrink-0">
                        <AvatarFallback className="text-blue-700 text-sm">{currentUser ? getInitials(currentUser.username) : '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Tulis balasan Anda..."
                          value={newReplies[discussion.id] || ''}
                          onChange={(e) => setNewReplies((prev) => ({ ...prev, [discussion.id]: e.target.value }))}
                          rows={3}
                          className="border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button onClick={() => handleSubmitReply(discussion.id)} size="sm" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                            {isSubmitting ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Mengirim...
                              </span>
                            ) : (
                              <>
                                <Send className="h-3 w-3 mr-1" />
                                Kirim
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => toggleReplyForm(discussion.id)} disabled={isSubmitting} className="border-gray-300 text-gray-600 hover:bg-gray-50">
                            Batal
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-green-100 pt-4 mt-4">
                    <Button variant="outline" onClick={() => toggleReplyForm(discussion.id)} className="border-green-200 text-green-700 hover:bg-green-50">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Balas
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Discussion Dialog */}
        <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Diskusi</AlertDialogTitle>
              <AlertDialogDescription>Silakan edit judul dan konten diskusi Anda</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <Input placeholder="Judul diskusi" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="border-green-200 focus:border-green-400 focus:ring-green-400" />
              <Textarea placeholder="Konten diskusi" value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={5} className="border-green-200 focus:border-green-400 focus:ring-green-400" />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmitEdit} disabled={!editTitle || !editContent || isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </span>
                ) : (
                  'Simpan Perubahan'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {filteredDiscussions.length === 0 && !isLoading && (
          <Card className="text-center py-12 bg-white/80 backdrop-blur-sm">
            <CardContent>
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada diskusi</h3>
              <p className="text-gray-600 mb-4">Jadilah yang pertama untuk memulai diskusi!</p>
              <Button onClick={() => setShowNewDiscussion(true)} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Buat Diskusi Baru
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ForumDiskusi;
