import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_KEY = 'svetlana-web81';
const API_URL = `https://webdev-hw-api.vercel.app/api/v1/${API_KEY}/comments`;

interface Comment {
  id: number;
  text: string;
  author: {
    name: string;
  };
  likes: number;
  isLiked?: boolean;
}

const Index = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки комментариев');
      }

      const data = await response.json();
      const commentsWithLikes = data.comments.map((comment: Comment) => ({
        ...comment,
        isLiked: false
      }));
      
      setComments(commentsWithLikes);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить комментарии',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !text.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка добавления комментария');
      }

      await loadComments();
      
      setName('');
      setText('');
      
      toast({
        title: 'Успешно!',
        description: 'Комментарий добавлен',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить комментарий',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (id: number) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === id) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked,
          };
        }
        return comment;
      })
    );
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
            💬 Лента комментариев
          </h1>
          <p className="text-gray-600 text-lg">
            Делитесь своими мыслями с миром
          </p>
        </div>

        <Card className="p-6 md:p-8 mb-8 shadow-lg animate-scale-in">
          <h2 className="text-2xl font-heading font-semibold mb-6 text-gray-900">
            Добавить комментарий
          </h2>
          <form onSubmit={handleAddComment} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Ваше имя
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите ваше имя"
                disabled={isLoading}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                Комментарий
              </label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Напишите ваш комментарий..."
                disabled={isLoading}
                className="w-full min-h-[120px] resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-6 text-lg transition-all hover:scale-[1.02]"
            >
              {isLoading ? 'Отправка...' : 'Отправить комментарий'}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-heading font-semibold text-gray-900 mb-6">
            Комментарии ({comments.length})
          </h2>
          
          {isLoading && comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Загрузка комментариев...</p>
            </div>
          ) : comments.length === 0 ? (
            <Card className="p-12 text-center">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">Пока нет комментариев</p>
              <p className="text-gray-400 text-sm mt-2">Станьте первым, кто оставит комментарий!</p>
            </Card>
          ) : (
            comments.map((comment, index) => (
              <Card
                key={comment.id}
                className="p-6 shadow-md hover:shadow-lg transition-shadow animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{comment.author.name}</p>
                      <p className="text-xs text-gray-500">{formatDate()}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed pl-[52px]">
                  {comment.text}
                </p>
                
                <div className="flex items-center gap-4 pl-[52px]">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-2 transition-all hover:scale-110 ${
                      comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Icon name={comment.isLiked ? 'Heart' : 'Heart'} size={20} fill={comment.isLiked ? 'currentColor' : 'none'} />
                    <span className="font-medium">{comment.likes}</span>
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
