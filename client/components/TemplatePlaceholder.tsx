import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Search,
  Package,
  Eye,
  Star,
  Heart,
  ExternalLink,
  Gift,
  Crown,
  Sparkles,
  Layout,
  Zap,
  Brush,
} from "lucide-react";

const TemplatePlaceholder: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const templates = [
    {
      id: "1",
      name: "CinemaLux Pro",
      description:
        "Template premium para locadoras de equipamentos de cinema profissional",
      category: "E-commerce",
      previewImage: "/placeholder.svg",
      downloads: 2543,
      rating: 4.8,
      totalRatings: 127,
      featured: true,
      new: false,
      trending: true,
      fileSize: "45.2 MB",
      difficulty: "intermediate",
    },
    {
      id: "2",
      name: "VideoRent Simple",
      description: "Template minimalista para pequenas locadoras",
      category: "Landing Page",
      previewImage: "/placeholder.svg",
      downloads: 1876,
      rating: 4.3,
      totalRatings: 89,
      featured: false,
      new: true,
      trending: false,
      fileSize: "12.8 MB",
      difficulty: "beginner",
    },
    {
      id: "3",
      name: "EventPro Studios",
      description:
        "Template completo para locadoras de equipamentos para eventos",
      category: "E-commerce",
      previewImage: "/placeholder.svg",
      downloads: 3721,
      rating: 4.9,
      totalRatings: 203,
      featured: true,
      new: false,
      trending: true,
      fileSize: "67.4 MB",
      difficulty: "advanced",
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-400 bg-green-400/20";
      case "intermediate":
        return "text-yellow-400 bg-yellow-400/20";
      case "advanced":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`}
      />
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <Package className="w-6 h-6 mr-2 text-cinema-yellow" />
            Templates Gratuitos
          </h2>
          <p className="text-gray-400">
            Baixe templates prontos e gratuitos da rede para sua locadora
          </p>
        </div>
        <Button className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark">
          <Gift className="w-4 h-4 mr-2" />
          Contribuir Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-cinema-dark border-cinema-gray-light text-white"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-cinema-gray-light text-gray-400"
          >
            Categoria
          </Button>
          <Button
            variant="outline"
            className="border-cinema-gray-light text-gray-400"
          >
            Dificuldade
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className="border-cinema-yellow text-cinema-yellow"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          {templates.length} templates encontrados
        </Badge>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="bg-cinema-dark border-cinema-gray-light hover:border-cinema-yellow transition-colors group"
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={template.previewImage}
                alt={template.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Template Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {template.featured && (
                  <Badge className="bg-yellow-500 text-black text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Destaque
                  </Badge>
                )}
                {template.new && (
                  <Badge className="bg-green-500 text-white text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Novo
                  </Badge>
                )}
                {template.trending && (
                  <Badge className="bg-red-500 text-white text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                  <Heart className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-medium text-sm line-clamp-1">
                  {template.name}
                </h3>
                <div className="flex items-center space-x-1">
                  {renderStars(template.rating)}
                  <span className="text-xs text-gray-400 ml-1">
                    ({template.totalRatings})
                  </span>
                </div>
              </div>

              <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                {template.description}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <Download className="w-3 h-3 mr-1" />
                    {template.downloads.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Difficulty and Size */}
              <div className="flex items-center justify-between mb-4">
                <Badge
                  className={`text-xs ${getDifficultyColor(template.difficulty)}`}
                >
                  {template.difficulty === "beginner"
                    ? "Iniciante"
                    : template.difficulty === "intermediate"
                      ? "Intermediário"
                      : "Avançado"}
                </Badge>
                <span className="text-xs text-gray-400">
                  {template.fileSize}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Download className="w-3 h-3 mr-2" />
                  Baixar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-cinema-gray-light text-gray-400 hover:text-white"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-cinema-dark border-cinema-gray-light hover:border-cinema-yellow transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Layout className="w-12 h-12 text-cinema-yellow mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">Template Clássico</h4>
            <p className="text-gray-400 text-sm mb-4">
              Design elegante e profissional para locadoras tradicionais
            </p>
            <Button
              size="sm"
              className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
            >
              <Download className="w-3 h-3 mr-2" />
              Baixar
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light hover:border-cinema-yellow transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">Template Moderno</h4>
            <p className="text-gray-400 text-sm mb-4">
              Interface moderna com animações e gradientes
            </p>
            <Button
              size="sm"
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              <Download className="w-3 h-3 mr-2" />
              Baixar
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-cinema-dark border-cinema-gray-light hover:border-cinema-yellow transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Brush className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">Template Criativo</h4>
            <p className="text-gray-400 text-sm mb-4">
              Design arrojado para empresas inovadoras
            </p>
            <Button
              size="sm"
              className="bg-purple-500 text-white hover:bg-purple-600"
            >
              <Download className="w-3 h-3 mr-2" />
              Baixar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TemplatePlaceholder;
