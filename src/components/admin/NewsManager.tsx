import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Newspaper, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  author: string;
  category: string;
  is_published: boolean;
  image_url: string | null;
  created_at: string;
}

const categories = ['announcement', 'achievement', 'event', 'academic', 'sports', 'general'];

export const NewsManager = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: 'Admin',
    category: 'announcement',
    is_published: true,
    image_url: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({ title: 'Error', description: 'Failed to load news.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setSelectedNews(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      author: 'Admin',
      category: 'announcement',
      is_published: true,
      image_url: '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: NewsItem) => {
    setSelectedNews(item);
    setFormData({
      title: item.title,
      content: item.content,
      excerpt: item.excerpt || '',
      author: item.author,
      category: item.category,
      is_published: item.is_published,
      image_url: item.image_url || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({ title: 'Error', description: 'Title and content are required.', variant: 'destructive' });
      return;
    }

    try {
      const newsData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || null,
        author: formData.author.trim() || 'Admin',
        category: formData.category,
        is_published: formData.is_published,
        image_url: formData.image_url.trim() || null,
      };

      if (selectedNews) {
        const { error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', selectedNews.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'News updated successfully.' });
      } else {
        const { error } = await supabase.from('news').insert([newsData]);
        if (error) throw error;
        toast({ title: 'Success', description: 'News created successfully.' });
      }

      setDialogOpen(false);
      fetchNews();
    } catch (error) {
      console.error('Error saving news:', error);
      toast({ title: 'Error', description: 'Failed to save news.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!selectedNews) return;

    try {
      const { error } = await supabase.from('news').delete().eq('id', selectedNews.id);
      if (error) throw error;
      toast({ title: 'Success', description: 'News deleted successfully.' });
      setDeleteDialogOpen(false);
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({ title: 'Error', description: 'Failed to delete news.', variant: 'destructive' });
    }
  };

  const togglePublish = async (item: NewsItem) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({ is_published: !item.is_published })
        .eq('id', item.id);
      if (error) throw error;
      setNews((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_published: !n.is_published } : n)));
      toast({ title: 'Success', description: `News ${item.is_published ? 'unpublished' : 'published'}.` });
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>News Management</CardTitle>
            <CardDescription>Create, edit, and manage news articles</CardDescription>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add News
          </Button>
        </CardHeader>
        <CardContent>
          {news.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No news articles yet. Create your first article!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Author</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Published</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {news.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <p className="font-medium line-clamp-1">{item.title}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">{item.category}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{item.author}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Switch
                          checked={item.is_published}
                          onCheckedChange={() => togglePublish(item)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedNews(item);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedNews ? 'Edit News' : 'Create News'}</DialogTitle>
            <DialogDescription>
              {selectedNews ? 'Update article details below.' : 'Fill in the article details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Article title"
                required
              />
            </div>
            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary of the article"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Article content"
                rows={6}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <Label htmlFor="is_published">Published</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{selectedNews ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete News</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedNews?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
