import React, { useState } from "react";
import {
  Star,
  StarHalf,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Award,
  Camera,
  Lightbulb,
  Mic,
  Video,
  Package,
  User,
  Calendar,
  MoreVertical,
  Flag,
  Reply,
  Heart,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Tipos
interface Review {
  id: string;
  clientName: string;
  clientCompany?: string;
  equipmentName: string;
  equipmentCategory: string;
  rating: number;
  title: string;
  comment: string;
  date: Date;
  helpful: number;
  verified: boolean;
  projectName?: string;
  reply?: {
    text: string;
    date: Date;
  };
  tags?: string[];
}

// Dados mockados
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    clientName: 'Carlos Henrique',
    clientCompany: 'Globo Filmes',
    equipmentName: 'Canon C300 Mark III',
    equipmentCategory: 'camera',
    rating: 5,
    title: 'Excelente qualidade de imagem!',
    comment: 'Câmera impecável! A qualidade 4K é incrível e o desempenho em baixa luz superou as expectativas. Equipamento veio em perfeitas condições e com todos os acessórios. Recomendo muito!',
    date: new Date(2026, 0, 8),
    helpful: 12,
    verified: true,
    projectName: 'Novela "Amor e Destino"',
    tags: ['Qualidade', 'Baixa luz', 'Completo'],
    reply: {
      text: 'Muito obrigado pelo feedback, Carlos! É sempre um prazer atender a Globo Filmes. Sucesso com a novela!',
      date: new Date(2026, 0, 9)
    }
  },
  {
    id: '2',
    clientName: 'Maria Santos',
    clientCompany: 'MS Produções',
    equipmentName: 'Kit LED Aputure 300D II',
    equipmentCategory: 'lighting',
    rating: 5,
    title: 'Iluminação profissional perfeita',
    comment: 'O kit de iluminação veio completo e funcionando perfeitamente. A potência dos LEDs é impressionante e a temperatura de cor é bem precisa. Atendimento da locadora foi excelente!',
    date: new Date(2026, 0, 5),
    helpful: 8,
    verified: true,
    projectName: 'Documentário "BH em Cores"',
    tags: ['Potência', 'Precisão', 'Atendimento']
  },
  {
    id: '3',
    clientName: 'Roberto Lima',
    clientCompany: 'Produtora XYZ',
    equipmentName: 'RED Komodo',
    equipmentCategory: 'camera',
    rating: 4,
    title: 'Ótima câmera, mas bateria curta',
    comment: 'A qualidade de imagem da RED é fantástica, sem dúvidas. O único ponto negativo foi a duração das baterias - precisamos de mais unidades para o dia de filmagem. Seria bom incluir mais baterias no kit.',
    date: new Date(2025, 11, 28),
    helpful: 15,
    verified: true,
    tags: ['Imagem', 'Bateria']
  },
  {
    id: '4',
    clientName: 'Ana Costa',
    equipmentName: 'DJI Inspire 2',
    equipmentCategory: 'drone',
    rating: 5,
    title: 'Drone incrível para produções aéreas',
    comment: 'Usamos para captar imagens aéreas no interior de Minas e o resultado foi espetacular. Equipamento chegou calibrado e pronto para voar. Super recomendo!',
    date: new Date(2025, 11, 20),
    helpful: 6,
    verified: true,
    projectName: 'Clipe "Sertanejo Raiz"',
    tags: ['Estabilidade', 'Calibrado']
  },
  {
    id: '5',
    clientName: 'Fernanda Oliveira',
    clientCompany: 'Festival BH',
    equipmentName: 'Kit Áudio Sennheiser',
    equipmentCategory: 'audio',
    rating: 4,
    title: 'Bom kit de áudio',
    comment: 'Áudio limpo e sem ruídos. Microfones funcionaram bem durante todo o evento. Ponto de melhoria: incluir mais receptores wireless.',
    date: new Date(2025, 11, 15),
    helpful: 4,
    verified: true,
    tags: ['Áudio limpo', 'Wireless']
  },
  {
    id: '6',
    clientName: 'Pedro Almeida',
    equipmentName: 'Gimbal DJI Ronin 2',
    equipmentCategory: 'grip',
    rating: 3,
    title: 'Bom equipamento, mas pesado',
    comment: 'O gimbal estabiliza muito bem, mas é bem pesado para uso prolongado. Tivemos que revezar operadores. A qualidade da estabilização é boa.',
    date: new Date(2025, 11, 10),
    helpful: 9,
    verified: true,
    tags: ['Estabilização', 'Pesado']
  },
];

// Estatísticas de avaliação
const RATING_STATS = {
  average: 4.3,
  total: 127,
  distribution: [
    { stars: 5, count: 78, percentage: 61 },
    { stars: 4, count: 32, percentage: 25 },
    { stars: 3, count: 12, percentage: 10 },
    { stars: 2, count: 4, percentage: 3 },
    { stars: 1, count: 1, percentage: 1 },
  ],
  nps: 72,
  recommendRate: 94,
};

export default function Avaliacoes() {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  // Filtrar avaliações
  const filteredReviews = reviews
    .filter(r => {
      const matchesSearch = !searchTerm || 
        r.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || 
        r.equipmentCategory === filter ||
        (filter === '5stars' && r.rating === 5) ||
        (filter === 'low' && r.rating <= 3);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return b.date.getTime() - a.date.getTime();
      if (sortBy === 'helpful') return b.helpful - a.helpful;
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return 0;
    });

  // Renderizar estrelas
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className={cn(sizeClass, "fill-amber-400 text-amber-400")} />);
      } else if (i - 0.5 <= rating) {
        stars.push(<StarHalf key={i} className={cn(sizeClass, "fill-amber-400 text-amber-400")} />);
      } else {
        stars.push(<Star key={i} className={cn(sizeClass, "text-slate-600")} />);
      }
    }
    return stars;
  };

  // Ícone da categoria
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'camera': return <Camera className="h-4 w-4" />;
      case 'lighting': return <Lightbulb className="h-4 w-4" />;
      case 'drone': return <Video className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  // Marcar como útil
  const markHelpful = (id: string) => {
    setReviews(prev => prev.map(r => 
      r.id === id ? { ...r, helpful: r.helpful + 1 } : r
    ));
  };

  // Responder avaliação
  const submitReply = () => {
    if (!selectedReview || !replyText.trim()) return;
    
    setReviews(prev => prev.map(r => 
      r.id === selectedReview.id 
        ? { ...r, reply: { text: replyText, date: new Date() } } 
        : r
    ));
    setShowReplyModal(false);
    setReplyText('');
    setSelectedReview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl">
                <Star className="h-6 w-6 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Avaliações</h1>
                <p className="text-sm text-slate-400">Feedback dos clientes sobre equipamentos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-400 text-lg px-3 py-1">
                <Star className="h-4 w-4 fill-amber-400 mr-1" />
                {RATING_STATS.average}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-amber-950/50 to-yellow-950/50 border-amber-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Média Geral</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-3xl font-bold text-amber-400">{RATING_STATS.average}</p>
                    <div className="flex">{renderStars(RATING_STATS.average, 'sm')}</div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{RATING_STATS.total} avaliações</p>
                </div>
                <Star className="h-10 w-10 text-amber-400/30 fill-amber-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-950/50 to-emerald-950/50 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Taxa de Recomendação</p>
                  <p className="text-3xl font-bold text-green-400">{RATING_STATS.recommendRate}%</p>
                  <p className="text-xs text-slate-500 mt-1">recomendariam</p>
                </div>
                <ThumbsUp className="h-10 w-10 text-green-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-950/50 to-cyan-950/50 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">NPS Score</p>
                  <p className="text-3xl font-bold text-blue-400">{RATING_STATS.nps}</p>
                  <p className="text-xs text-slate-500 mt-1">Net Promoter Score</p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-950/50 to-violet-950/50 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">5 Estrelas</p>
                  <p className="text-3xl font-bold text-purple-400">{RATING_STATS.distribution[0].percentage}%</p>
                  <p className="text-xs text-slate-500 mt-1">{RATING_STATS.distribution[0].count} avaliações</p>
                </div>
                <Award className="h-10 w-10 text-purple-400/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição de Notas */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>Distribuição de Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RATING_STATS.distribution.map(item => (
                <div key={item.stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm">{item.stars}</span>
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                  <Progress value={item.percentage} className="flex-1 h-3" />
                  <span className="text-sm text-slate-400 w-16 text-right">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar avaliações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="5stars">5 Estrelas</SelectItem>
              <SelectItem value="low">3 ou menos</SelectItem>
              <SelectItem value="camera">Câmeras</SelectItem>
              <SelectItem value="lighting">Iluminação</SelectItem>
              <SelectItem value="audio">Áudio</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="helpful">Mais úteis</SelectItem>
              <SelectItem value="highest">Maior nota</SelectItem>
              <SelectItem value="lowest">Menor nota</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Avaliações */}
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <Card key={review.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                      {review.clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Conteúdo */}
                  <div className="flex-1">
                    {/* Cabeçalho */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.clientName}</span>
                          {review.verified && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                        {review.clientCompany && (
                          <p className="text-xs text-slate-400">{review.clientCompany}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <p className="text-xs text-slate-500 mt-1">
                          {review.date.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {/* Equipamento */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className={cn(
                        "p-1 rounded",
                        review.equipmentCategory === 'camera' ? 'bg-blue-500/20 text-blue-400' :
                        review.equipmentCategory === 'lighting' ? 'bg-amber-500/20 text-amber-400' :
                        review.equipmentCategory === 'audio' ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'
                      )}>
                        {getCategoryIcon(review.equipmentCategory)}
                      </div>
                      <span className="text-sm text-slate-300">{review.equipmentName}</span>
                      {review.projectName && (
                        <Badge variant="outline" className="text-xs">
                          🎬 {review.projectName}
                        </Badge>
                      )}
                    </div>

                    {/* Título e Comentário */}
                    <h3 className="font-medium mt-3">{review.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{review.comment}</p>

                    {/* Tags */}
                    {review.tags && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {review.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-slate-700/50">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Resposta */}
                    {review.reply && (
                      <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border-l-2 border-cyan-500">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                            Resposta da Locadora
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {review.reply.date.toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{review.reply.text}</p>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex items-center gap-4 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-slate-200"
                        onClick={() => markHelpful(review.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Útil ({review.helpful})
                      </Button>
                      {!review.reply && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-cyan-400"
                          onClick={() => {
                            setSelectedReview(review);
                            setShowReplyModal(true);
                          }}
                        >
                          <Reply className="h-4 w-4 mr-1" />
                          Responder
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem>
                            <Flag className="h-4 w-4 mr-2" /> Reportar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Modal de Resposta */}
      <Dialog open={showReplyModal} onOpenChange={setShowReplyModal}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle>Responder Avaliação</DialogTitle>
            <DialogDescription>
              Responda ao feedback de {selectedReview?.clientName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">{selectedReview && renderStars(selectedReview.rating, 'sm')}</div>
                <span className="text-sm font-medium">{selectedReview?.title}</span>
              </div>
              <p className="text-sm text-slate-400">{selectedReview?.comment}</p>
            </div>

            <div>
              <Textarea
                placeholder="Digite sua resposta..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="bg-slate-800 border-slate-700 min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyModal(false)} className="border-slate-600">
              Cancelar
            </Button>
            <Button onClick={submitReply} className="bg-cyan-600 hover:bg-cyan-700">
              <Send className="h-4 w-4 mr-2" />
              Enviar Resposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

