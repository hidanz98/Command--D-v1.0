import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCategories,
  type Category,
  type Subcategory,
} from "@/context/CategoryContext";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Settings,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Eye,
  EyeOff,
  FolderPlus,
  Folder,
  Tag,
} from "lucide-react";

export const CategoryManager: React.FC = () => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    reorderCategories,
    reorderSubcategories,
  } = useCategories();
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<{
    category: Category;
    subcategory: Subcategory;
  } | null>(null);
  const [selectedCategoryForSub, setSelectedCategoryForSub] =
    useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<"manage" | "organize">("manage");

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    showInEcommerce: true,
  });

  const [newSubcategory, setNewSubcategory] = useState({
    name: "",
    description: "",
    showInEcommerce: true,
  });

  const handleAddCategory = () => {
    if (!newCategory.name) return;

    addCategory({
      name: newCategory.name,
      description: newCategory.description,
      order: categories.length + 1,
      showInEcommerce: newCategory.showInEcommerce,
      subcategories: [],
    });

    setNewCategory({ name: "", description: "", showInEcommerce: true });
    setShowAddCategoryModal(false);

    // Show success message
    alert(
      `✅ Categoria "${newCategory.name}" criada com sucesso!\nEla já está disponível em todo o sistema.`,
    );
  };

  const handleAddSubcategory = () => {
    if (!newSubcategory.name || !selectedCategoryForSub) return;

    addSubcategory(selectedCategoryForSub.id, {
      name: newSubcategory.name,
      description: newSubcategory.description,
      order: selectedCategoryForSub.subcategories.length + 1,
      showInEcommerce: newSubcategory.showInEcommerce,
    });

    setNewSubcategory({ name: "", description: "", showInEcommerce: true });
    setShowAddSubcategoryModal(false);

    // Show success message
    alert(
      `✅ Subcategoria "${newSubcategory.name}" criada com sucesso!\nEla já está disponível na categoria "${selectedCategoryForSub.name}".`,
    );

    setSelectedCategoryForSub(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    deleteCategory(categoryId);
  };

  const handleDeleteSubcategory = (
    categoryId: string,
    subcategoryId: string,
  ) => {
    deleteSubcategory(categoryId, subcategoryId);
  };

  const handleEditCategory = (updatedCategory: Category) => {
    updateCategory(updatedCategory.id, updatedCategory);
    setEditingCategory(null);
  };

  const handleEditSubcategory = (
    categoryId: string,
    updatedSubcategory: Subcategory,
  ) => {
    updateSubcategory(categoryId, updatedSubcategory.id, updatedSubcategory);
    setEditingSubcategory(null);
  };

  const moveCategoryUp = (categoryId: string) => {
    reorderCategories(categoryId, "up");
  };

  const moveCategoryDown = (categoryId: string) => {
    reorderCategories(categoryId, "down");
  };

  const toggleCategoryEcommerce = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      updateCategory(categoryId, {
        showInEcommerce: !category.showInEcommerce,
      });
    }
  };

  const toggleSubcategoryEcommerce = (
    categoryId: string,
    subcategoryId: string,
  ) => {
    const category = categories.find((cat) => cat.id === categoryId);
    const subcategory = category?.subcategories.find(
      (sub) => sub.id === subcategoryId,
    );
    if (subcategory) {
      updateSubcategory(categoryId, subcategoryId, {
        showInEcommerce: !subcategory.showInEcommerce,
      });
    }
  };

  const moveSubcategoryUp = (categoryId: string, subcategoryId: string) => {
    reorderSubcategories(categoryId, subcategoryId, "up");
  };

  const moveSubcategoryDown = (categoryId: string, subcategoryId: string) => {
    reorderSubcategories(categoryId, subcategoryId, "down");
  };

  return (
    <div className="h-full bg-cinema-dark-lighter">
      {/* Header */}
      <div className="p-4 border-b border-cinema-gray-light">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">
              Gestão de Categorias
            </h2>
            <p className="text-gray-400 text-sm">
              Gerencie categorias e subcategorias do e-commerce
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowAddCategoryModal(true)}
              className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
            <Button
              onClick={() => setShowAddSubcategoryModal(true)}
              variant="outline"
              className="text-cinema-yellow border-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
            >
              <Tag className="w-4 h-4 mr-2" />
              Nova Subcategoria
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          <Button
            variant={activeTab === "manage" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("manage")}
            className={
              activeTab === "manage"
                ? "bg-cinema-yellow text-cinema-dark"
                : "text-gray-300 border-cinema-gray-light hover:border-cinema-yellow hover:text-cinema-yellow"
            }
          >
            <Folder className="w-4 h-4 mr-2" />
            Gerenciar
          </Button>
          <Button
            variant={activeTab === "organize" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("organize")}
            className={
              activeTab === "organize"
                ? "bg-cinema-yellow text-cinema-dark"
                : "text-gray-300 border-cinema-gray-light hover:border-cinema-yellow hover:text-cinema-yellow"
            }
          >
            <Settings className="w-4 h-4 mr-2" />
            Organizar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div
        className="p-4 overflow-y-auto"
        style={{ height: "calc(100% - 140px)" }}
      >
        {activeTab === "manage" ? (
          <div className="space-y-4">
            {categories
              .sort((a, b) => a.order - b.order)
              .map((category) => (
                <Card
                  key={category.id}
                  className="bg-cinema-dark border-cinema-gray-light"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Folder className="w-5 h-5 text-cinema-yellow" />
                        <div>
                          <CardTitle className="text-white text-base">
                            {category.name}
                          </CardTitle>
                          {category.description && (
                            <p className="text-gray-400 text-sm mt-1">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleCategoryEcommerce(category.id)}
                            className={`h-6 px-2 ${category.showInEcommerce ? "text-green-400" : "text-gray-400"}`}
                          >
                            {category.showInEcommerce ? (
                              <Eye className="w-3 h-3" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                          </Button>
                          <span className="text-xs text-gray-400">
                            {category.showInEcommerce ? "Visível" : "Oculto"}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCategory(category)}
                          className="h-6 px-2 text-cinema-yellow border-cinema-yellow"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="h-6 px-2 text-red-400 border-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {category.subcategories.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">
                          Subcategorias:
                        </h4>
                        {category.subcategories
                          .sort((a, b) => a.order - b.order)
                          .map((subcategory, subIndex) => (
                            <div
                              key={subcategory.id}
                              className="flex items-center justify-between bg-cinema-dark-lighter p-3 rounded border border-cinema-gray-light/30"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex flex-col space-y-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      moveSubcategoryUp(
                                        category.id,
                                        subcategory.id,
                                      )
                                    }
                                    disabled={subIndex === 0}
                                    className="h-5 w-5 p-0 text-gray-400 border-gray-400 disabled:opacity-30"
                                  >
                                    <ArrowUp className="w-2 h-2" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      moveSubcategoryDown(
                                        category.id,
                                        subcategory.id,
                                      )
                                    }
                                    disabled={
                                      subIndex ===
                                      category.subcategories.length - 1
                                    }
                                    className="h-5 w-5 p-0 text-gray-400 border-gray-400 disabled:opacity-30"
                                  >
                                    <ArrowDown className="w-2 h-2" />
                                  </Button>
                                </div>
                                <Tag className="w-4 h-4 text-gray-400" />
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-white text-sm font-medium">
                                      {subcategory.name}
                                    </span>
                                    <span className="text-xs text-gray-500 bg-cinema-gray px-2 py-1 rounded">
                                      #{subcategory.order}
                                    </span>
                                  </div>
                                  {subcategory.description && (
                                    <p className="text-gray-500 text-xs mt-1">
                                      {subcategory.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    toggleSubcategoryEcommerce(
                                      category.id,
                                      subcategory.id,
                                    )
                                  }
                                  className={`h-6 px-2 ${subcategory.showInEcommerce ? "text-green-400" : "text-gray-400"}`}
                                >
                                  {subcategory.showInEcommerce ? (
                                    <Eye className="w-3 h-3" />
                                  ) : (
                                    <EyeOff className="w-3 h-3" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setEditingSubcategory({
                                      category,
                                      subcategory,
                                    })
                                  }
                                  className="h-6 px-2 text-cinema-yellow border-cinema-yellow"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleDeleteSubcategory(
                                      category.id,
                                      subcategory.id,
                                    )
                                  }
                                  className="h-6 px-2 text-red-400 border-red-400"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">
                        Nenhuma subcategoria criada
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Categories Order */}
            <div className="bg-cinema-dark border border-cinema-gray-light rounded-lg p-4">
              <h3 className="text-white font-medium mb-4">
                Ordem das Categorias no E-commerce
              </h3>
              <div className="space-y-2">
                {categories
                  .sort((a, b) => a.order - b.order)
                  .map((category, index) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between bg-cinema-dark-lighter p-3 rounded border border-cinema-gray-light/30"
                    >
                      <div className="flex items-center space-x-3">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">
                          {index + 1}.
                        </span>
                        <Folder className="w-4 h-4 text-cinema-yellow" />
                        <span className="text-white">{category.name}</span>
                        <div className="flex items-center space-x-1">
                          {category.showInEcommerce ? (
                            <Eye className="w-3 h-3 text-green-400" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-gray-400" />
                          )}
                          <span className="text-xs text-gray-400">
                            {category.showInEcommerce ? "Visível" : "Oculto"}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveCategoryUp(category.id)}
                          disabled={index === 0}
                          className="h-6 px-2 text-gray-400 border-gray-400 disabled:opacity-50"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveCategoryDown(category.id)}
                          disabled={index === categories.length - 1}
                          className="h-6 px-2 text-gray-400 border-gray-400 disabled:opacity-50"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Subcategories Order */}
            {categories
              .filter((cat) => cat.subcategories.length > 0)
              .map((category) => (
                <div
                  key={`organize-${category.id}`}
                  className="bg-cinema-dark border border-cinema-gray-light rounded-lg p-4"
                >
                  <h3 className="text-white font-medium mb-4 flex items-center">
                    <Folder className="w-4 h-4 text-cinema-yellow mr-2" />
                    Ordem das Subcategorias - {category.name}
                  </h3>
                  <div className="space-y-2">
                    {category.subcategories
                      .sort((a, b) => a.order - b.order)
                      .map((subcategory, subIndex) => (
                        <div
                          key={subcategory.id}
                          className="flex items-center justify-between bg-cinema-dark-lighter p-3 rounded border border-cinema-gray-light/30"
                        >
                          <div className="flex items-center space-x-3">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <span className="text-white font-medium">
                              {subIndex + 1}.
                            </span>
                            <Tag className="w-4 h-4 text-cinema-yellow" />
                            <span className="text-white">
                              {subcategory.name}
                            </span>
                            <div className="flex items-center space-x-1">
                              {subcategory.showInEcommerce ? (
                                <Eye className="w-3 h-3 text-green-400" />
                              ) : (
                                <EyeOff className="w-3 h-3 text-gray-400" />
                              )}
                              <span className="text-xs text-gray-400">
                                {subcategory.showInEcommerce
                                  ? "Visível"
                                  : "Oculto"}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                moveSubcategoryUp(category.id, subcategory.id)
                              }
                              disabled={subIndex === 0}
                              className="h-6 px-2 text-gray-400 border-gray-400 disabled:opacity-50"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                moveSubcategoryDown(category.id, subcategory.id)
                              }
                              disabled={
                                subIndex === category.subcategories.length - 1
                              }
                              className="h-6 px-2 text-gray-400 border-gray-400 disabled:opacity-50"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Nova Categoria</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddCategoryModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white">Nome da Categoria</Label>
                <Input
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  placeholder="Ex: Câmeras, Lentes, Áudio..."
                  required
                />
              </div>
              <div>
                <Label className="text-white">Descrição (Opcional)</Label>
                <Input
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  placeholder="Breve descrição da categoria"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newCategory.showInEcommerce}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      showInEcommerce: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label className="text-white">Mostrar no E-commerce</Label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleAddCategory}
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Criar Categoria
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="flex-1 text-gray-400 border-gray-400 hover:text-white hover:border-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {showAddSubcategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Nova Subcategoria
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddSubcategoryModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white">Categoria Principal</Label>
                <select
                  value={selectedCategoryForSub?.id || ""}
                  onChange={(e) =>
                    setSelectedCategoryForSub(
                      categories.find((cat) => cat.id === e.target.value) ||
                        null,
                    )
                  }
                  className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-white">Nome da Subcategoria</Label>
                <Input
                  value={newSubcategory.name}
                  onChange={(e) =>
                    setNewSubcategory({
                      ...newSubcategory,
                      name: e.target.value,
                    })
                  }
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  placeholder="Ex: Câmeras de Cinema, Lentes Prime..."
                  required
                />
              </div>
              <div>
                <Label className="text-white">Descrição (Opcional)</Label>
                <Input
                  value={newSubcategory.description}
                  onChange={(e) =>
                    setNewSubcategory({
                      ...newSubcategory,
                      description: e.target.value,
                    })
                  }
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  placeholder="Breve descrição da subcategoria"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newSubcategory.showInEcommerce}
                  onChange={(e) =>
                    setNewSubcategory({
                      ...newSubcategory,
                      showInEcommerce: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label className="text-white">Mostrar no E-commerce</Label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleAddSubcategory}
                  disabled={!selectedCategoryForSub}
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Criar Subcategoria
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddSubcategoryModal(false)}
                  className="flex-1 text-gray-400 border-gray-400 hover:text-white hover:border-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Editar Categoria</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingCategory(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white">Nome da Categoria</Label>
                <Input
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                    })
                  }
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-white">Descrição</Label>
                <Input
                  value={editingCategory.description || ""}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value,
                    })
                  }
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingCategory.showInEcommerce}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      showInEcommerce: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label className="text-white">Mostrar no E-commerce</Label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => handleEditCategory(editingCategory)}
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 text-gray-400 border-gray-400 hover:text-white hover:border-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subcategory Modal */}
      {editingSubcategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Editar Subcategoria
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSubcategory(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white">
                  Categoria: {editingSubcategory.category.name}
                </Label>
              </div>
              <div>
                <Label className="text-white">Nome da Subcategoria</Label>
                <Input
                  value={editingSubcategory.subcategory.name}
                  onChange={(e) =>
                    setEditingSubcategory({
                      ...editingSubcategory,
                      subcategory: {
                        ...editingSubcategory.subcategory,
                        name: e.target.value,
                      },
                    })
                  }
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-white">Descrição</Label>
                <Input
                  value={editingSubcategory.subcategory.description || ""}
                  onChange={(e) =>
                    setEditingSubcategory({
                      ...editingSubcategory,
                      subcategory: {
                        ...editingSubcategory.subcategory,
                        description: e.target.value,
                      },
                    })
                  }
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingSubcategory.subcategory.showInEcommerce}
                  onChange={(e) =>
                    setEditingSubcategory({
                      ...editingSubcategory,
                      subcategory: {
                        ...editingSubcategory.subcategory,
                        showInEcommerce: e.target.checked,
                      },
                    })
                  }
                  className="rounded"
                />
                <Label className="text-white">Mostrar no E-commerce</Label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() =>
                    handleEditSubcategory(
                      editingSubcategory.category.id,
                      editingSubcategory.subcategory,
                    )
                  }
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingSubcategory(null)}
                  className="flex-1 text-gray-400 border-gray-400 hover:text-white hover:border-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
