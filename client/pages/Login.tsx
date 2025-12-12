import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import Layout from "@/components/Layout";
import FacialCameraCapture from "@/components/FacialCameraCapture";
import { User, Lock, ArrowLeft, Mail, Eye, EyeOff, FileText, Upload, Camera, CheckCircle } from "lucide-react";

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true); // Padrão: lembrar
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Registration form state
  const [regForm, setRegForm] = useState({
    name: "",
    cpfCnpj: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [facialPhoto, setFacialPhoto] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password, rememberMe);
      if (success) {
        // Redirect based on user type
        if (email === "cabecadeefeitocine@gmail.com" || email === "admin@bilscinema.com" || email === "admin@locadora.com") {
          navigate("/painel-admin");
        } else if (email === "funcionario@empresa.com") {
          navigate("/painel-admin"); // Funcionários também vão para o painel admin para bater ponto
        } else if (email === "joao.silva@email.com") {
          navigate("/area-cliente");
        } else {
          navigate("/");
        }
      } else {
        setError("Email ou senha incorretos");
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (regForm.password !== regForm.confirmPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    if (!regForm.agreeToTerms) {
      setError("Você deve aceitar os termos de uso");
      setIsLoading(false);
      return;
    }

    // Mock registration - in real app this would be an API call
    try {
      // Simulate registration success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Auto login after registration
      const success = await login(regForm.email, regForm.password);
      if (success) {
        navigate("/area-cliente"); // New users go to client area
      } else {
        setError("Conta criada, mas erro ao fazer login automático");
      }
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-cinema-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Back to home button */}
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center text-cinema-yellow hover:text-cinema-yellow-dark transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ← Voltar ao início
            </Link>
          </div>

          {/* Demo credentials */}
          <div className="space-y-3">
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">
                <strong>Cliente:</strong> joao.silva@email.com | senha: 123456
              </p>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">
                <strong>Admin:</strong> cabecadeefeitocine@gmail.com | senha: admin123
              </p>
            </div>
          </div>

          <Card className="bg-cinema-dark-lighter border-cinema-gray">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">
                Acesse sua conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-cinema-gray">
                  <TabsTrigger 
                    value="login" 
                    className={`${activeTab === "login" ? "bg-cinema-yellow text-cinema-dark" : "text-white"}`}
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className={`${activeTab === "register" ? "bg-cinema-yellow text-cinema-dark" : "text-white"}`}
                  >
                    Cadastrar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-6 mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="login-email" className="text-white">
                        Email
                      </Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="login-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-cinema-gray border-cinema-gray-light text-white placeholder:text-gray-400 focus:border-cinema-yellow"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="login-password" className="text-white">
                        Senha
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 bg-cinema-gray border-cinema-gray-light text-white placeholder:text-gray-400 focus:border-cinema-yellow"
                          placeholder="Sua senha"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                        />
                        <Label htmlFor="remember" className="text-white text-sm">
                          Lembrar-me
                        </Label>
                      </div>
                      <Link to="#" className="text-cinema-yellow hover:text-cinema-yellow-dark text-sm">
                        Esqueceu a senha?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3"
                    >
                      {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-6 mt-6">
                  <form onSubmit={handleRegister} className="space-y-4">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="reg-name" className="text-white">
                        Nome Completo
                      </Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="reg-name"
                          type="text"
                          value={regForm.name}
                          onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                          className="pl-10 bg-cinema-gray border-cinema-gray-light text-white placeholder:text-gray-400 focus:border-cinema-yellow"
                          placeholder="Seu nome completo"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reg-cpf" className="text-white">
                        CPF ou CNPJ
                      </Label>
                      <div className="relative mt-1">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="reg-cpf"
                          type="text"
                          value={regForm.cpfCnpj}
                          onChange={(e) => setRegForm({...regForm, cpfCnpj: e.target.value})}
                          className="pl-10 bg-cinema-gray border-cinema-gray-light text-white placeholder:text-gray-400 focus:border-cinema-yellow"
                          placeholder="000.000.000-00 ou 00.000.000/0000-00"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reg-email" className="text-white">
                        Email
                      </Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="reg-email"
                          type="email"
                          value={regForm.email}
                          onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                          className="pl-10 bg-cinema-gray border-cinema-gray-light text-white placeholder:text-gray-400 focus:border-cinema-yellow"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reg-password" className="text-white">
                        Senha
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="reg-password"
                          type={showRegPassword ? "text" : "password"}
                          value={regForm.password}
                          onChange={(e) => setRegForm({...regForm, password: e.target.value})}
                          className="pl-10 pr-10 bg-cinema-gray border-cinema-gray-light text-white placeholder:text-gray-400 focus:border-cinema-yellow"
                          placeholder="Crie uma senha"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reg-confirm-password" className="text-white">
                        Confirmar Senha
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="reg-confirm-password"
                          type={showRegConfirmPassword ? "text" : "password"}
                          value={regForm.confirmPassword}
                          onChange={(e) => setRegForm({...regForm, confirmPassword: e.target.value})}
                          className="pl-10 pr-10 bg-cinema-gray border-cinema-gray-light text-white placeholder:text-gray-400 focus:border-cinema-yellow"
                          placeholder="Confirme sua senha"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Document upload section */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">Documentação Necessária</Label>
                        <p className="text-gray-400 text-sm mt-1">
                          Escolha uma das opções: RG Digital, CNH Digital ou PDF do Gov.br
                        </p>
                        <div className="mt-2 space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Escolher arquivo
                          </Button>
                          <p className="text-gray-500 text-xs">Nenhum arquivo escolhido</p>
                          <div className="text-xs text-gray-400 space-y-1">
                            <p>• RG Digital (aplicativo oficial)</p>
                            <p>• CNH Digital (aplicativo Carteira Digital de Trânsito)</p>
                            <p>• PDF do Gov.br (Menu → Dados → Exportar PDF)</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">Comprovante de Endereço</Label>
                        <p className="text-gray-400 text-sm mt-1">
                          Conta de luz, água, telefone ou extrato bancário (últimos 3 meses)
                        </p>
                        <div className="mt-2 space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Escolher arquivo
                          </Button>
                          <p className="text-gray-500 text-xs">Nenhum arquivo escolhido</p>
                        </div>
                      </div>
                    </div>

                    {/* Reconhecimento Facial */}
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Reconhecimento Facial
                      </Label>
                      <p className="text-gray-400 text-sm">
                        Tire uma selfie para verificação de identidade (obrigatório)
                      </p>
                      
                      {facialPhoto ? (
                        <div className="flex items-center gap-3 p-3 bg-green-900/30 rounded-lg border border-green-500/30">
                          <img 
                            src={facialPhoto} 
                            alt="Foto facial" 
                            className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
                          />
                          <div className="flex-1">
                            <p className="text-green-400 font-medium flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Foto capturada
                            </p>
                            <p className="text-gray-400 text-xs">Clique para refazer</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCamera(true)}
                            className="border-green-500 text-green-400"
                          >
                            Refazer
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => setShowCamera(true)}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Abrir Câmera para Selfie
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={regForm.agreeToTerms}
                        onCheckedChange={(checked) => setRegForm({...regForm, agreeToTerms: !!checked})}
                      />
                      <Label htmlFor="terms" className="text-white text-sm">
                        Li e concordo com os{" "}
                        <Link to="#" className="text-cinema-yellow hover:underline">
                          Termos de Uso
                        </Link>{" "}
                        e a{" "}
                        <Link to="#" className="text-cinema-yellow hover:underline">
                          Política de Privacidade
                        </Link>
                        .
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !facialPhoto}
                      className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold py-3 disabled:opacity-50"
                    >
                      {isLoading ? "Criando conta..." : !facialPhoto ? "📷 Tire a selfie primeiro" : "Criar Conta"}
                    </Button>
                  </form>

                  {/* Componente de Câmera */}
                  <FacialCameraCapture
                    isOpen={showCamera}
                    onCapture={(imageData) => {
                      setFacialPhoto(imageData);
                      setShowCamera(false);
                    }}
                    onClose={() => setShowCamera(false)}
                  />
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center">
                <Link to="#" className="text-cinema-yellow hover:text-cinema-yellow-dark text-sm">
                  Problemas para acessar? Entre em contato
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
