import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DemoResponse } from "@shared/api";
import { Video, Sparkles, Play } from "lucide-react";

export function Index() {
  const [demoData, setDemoData] = useState<DemoResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDemoData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/demo");
      const data: DemoResponse = await response.json();
      setDemoData(data);
    } catch (error) {
      console.error("Error fetching demo data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Fusion Starter
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            A production-ready full-stack React application template with integrated Express server, 
            featuring React Router 6 SPA mode, TypeScript, Vitest, Zod and modern tooling.
          </p>
          
          {/* Navigation Links */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/cabeca-efeito"
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              🎬 Cabeça de Efeito
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              API Demo
            </h2>
            <div className="space-y-4">
              <button
                onClick={fetchDemoData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? "Loading..." : "Fetch Demo Data"}
              </button>
              
              {demoData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Response:</h3>
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(demoData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Frontend Features
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• React 18 + TypeScript</li>
                <li>• React Router 6 (SPA)</li>
                <li>• TailwindCSS 3 + Radix UI</li>
                <li>• Vite for fast development</li>
                <li>• Vitest for testing</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Backend Features
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Express server</li>
                <li>• TypeScript throughout</li>
                <li>• CORS enabled</li>
                <li>• Shared types</li>
                <li>• Hot reload</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
