import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

import { Trash2, Edit2, Plus } from "lucide-react";

interface Item {
  id: number;
  name: string;
  quantity: number;
  price: number;
}


// Use Vite env or relative API path so it works both locally and in production
// ImportMeta typing can vary; cast to any to avoid build issues if types aren't set
const API_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || '/api/croche';

async function fetchItems(): Promise<Item[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function createItem(data: Omit<Item, 'id'>): Promise<Item> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function updateItem(id: number, data: Omit<Item, 'id'>): Promise<Item> {
  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function deleteItem(id: number): Promise<void> {
  const res = await fetch(API_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error(await res.text());
}




export default function Home() {
  const [formData, setFormData] = useState({ name: "", quantity: "", price: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (err: any) {
      setItems([]);
      alert('Erro ao carregar materiais: ' + (err?.message || err));
    }
    setIsLoading(false);
  };

  // Load items on mount
  React.useEffect(() => {
    loadItems();
  }, []);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.price) {
      alert("Por favor, preencha todos os campos");
      return;
    }
    setIsPending(true);
    const data = {
      name: formData.name,
      quantity: parseInt(formData.quantity),
      price: Math.round(parseFloat(formData.price) * 100),
    };
    try {
      if (editingId) {
        await updateItem(editingId, data);
      } else {
        await createItem(data);
      }
      setFormData({ name: "", quantity: "", price: "" });
      setEditingId(null);
      setShowForm(false);
      await loadItems();
    } catch (error: any) {
      alert("Erro ao salvar material: " + (error?.message || error));
    }
    setIsPending(false);
  };

  const handleEdit = (item: Item) => {
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      price: (item.price / 100).toString(),
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este item?")) {
      setIsPending(true);
      try {
        await deleteItem(id);
        await loadItems();
      } catch (error: any) {
        alert("Erro ao deletar material: " + (error?.message || error));
      }
      setIsPending(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", quantity: "", price: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const totalValue = items.reduce((sum: number, item: Item) => sum + (item.price / 100) * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-900 mb-2">
            🧶 Gerenciamento de Crochê
          </h1>
          <p className="text-gray-600">Organize seus materiais e controle seus gastos</p>
        </div>

        {/* Resumo */}
        <Card className="mb-8 p-6 bg-white shadow-lg border-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Total de Itens</p>
              <p className="text-3xl font-bold text-purple-600">{items.length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Quantidade Total</p>
              <p className="text-3xl font-bold text-pink-600">
                {items.reduce((sum: number, item: Item) => sum + item.quantity, 0)}
              </p>
            </div>
            <div className="text-center col-span-2 md:col-span-1">
              <p className="text-gray-600 text-sm mb-1">Valor Total</p>
              <p className="text-3xl font-bold text-green-600">
                R$ {totalValue.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>
        </Card>

        {/* Botão Adicionar */}
        {!showForm && (
          <div className="mb-8 flex justify-center">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg flex items-center gap-2"
            >
              <Plus size={24} />
              Adicionar Material
            </Button>
          </div>
        )}

        {/* Formulário */}
        {showForm && (
          <Card className="mb-8 p-6 bg-white shadow-lg border-0">
            <h2 className="text-2xl font-bold text-purple-900 mb-6">
              {editingId ? "Editar Material" : "Novo Material"}
            </h2>
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome do Material
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Estambre Rosa, Agulha Nº 4, etc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantidade
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preço (R$)
                  </label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {editingId ? "Atualizar" : "Adicionar"}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-lg font-semibold"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Lista de Itens */}
        <div>
          {isLoading ? (
            <Card className="p-12 bg-white shadow-lg border-0 text-center">
              <p className="text-gray-500 text-lg">Carregando materiais...</p>
            </Card>
          ) : items.length === 0 ? (
            <Card className="p-12 bg-white shadow-lg border-0 text-center">
              <p className="text-gray-500 text-lg">Nenhum material adicionado ainda.</p>
              <p className="text-gray-400">Clique em "Adicionar Material" para começar!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {items.map((item: Item) => (
                <Card
                  key={item.id}
                  className="p-4 md:p-6 bg-white shadow-lg border-0 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-purple-900 mb-2">
                        {item.name}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Quantidade</p>
                          <p className="text-xl font-semibold text-pink-600">{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Preço Unitário</p>
                          <p className="text-xl font-semibold text-green-600">
                            R$ {(item.price / 100).toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600">Valor Total</p>
                          <p className="text-xl font-semibold text-blue-600">
                            R$ {((item.price / 100) * item.quantity).toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 md:flex-col">
                      <Button
                        onClick={() => handleEdit(item)}
                        className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                      >
                        <Edit2 size={18} />
                        <span className="hidden md:inline">Editar</span>
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                        <span className="hidden md:inline">Deletar</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

