import Layout from "./Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description: string;
  suggestion: string;
}

export default function PlaceholderPage({
  title,
  description,
  suggestion,
}: PlaceholderPageProps) {
  return (
    <Layout>
      <section className="py-24 min-h-[60vh] flex items-center">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {title}
            </h1>
            <p className="text-xl text-gray-400 mb-8">{description}</p>
            <div className="bg-cinema-gray/50 backdrop-blur-sm rounded-lg p-6 border border-cinema-gray-light mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <MessageCircle className="w-5 h-5 text-cinema-yellow" />
                <span className="text-cinema-yellow font-semibold">
                  Em Desenvolvimento
                </span>
              </div>
              <p className="text-gray-300">{suggestion}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button
                  size="lg"
                  className="bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark font-semibold"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
              </Link>
              <Link to="/equipamentos">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                >
                  Ver Equipamentos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
