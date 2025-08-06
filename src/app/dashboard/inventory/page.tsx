'use client';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, Plus, Camera, Calendar, Activity, AlertCircle, CheckCircle, Upload, X, Search, Filter, History, Trash2, MoreVertical, Edit } from 'lucide-react';
import { getPlants, addPlant, deletePlant, diagnosePlant, updatePlant, deleteDiagnosis, Plant, Diagnosis } from '@/lib/plant';
import { getSession } from '@/lib/auth';
import { formatMessage } from '@/lib/formatter';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const PlantInventoryPage = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlant, setNewPlant] = useState({ name: '', description: '' });
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<Diagnosis | null>(null);
  const [showDiagnosisDialog, setShowDiagnosisDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showHistory, setShowHistory] = useState(false);
  const [historyPlant, setHistoryPlant] = useState<Plant | null>(null);
  
  // Edit plant states
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [editPlantData, setEditPlantData] = useState({ name: '', description: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch plants on component mount
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        const session = await getSession();
        if (!session || !session.token) {
          throw new Error('Session tidak ditemukan. Silakan login ulang.');
        }
        const data = await getPlants(session.token);
        setPlants(data);
        setError(null);
      } catch (err) {
        setError('Gagal memuat data tanaman. Silakan coba lagi.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  // Check if diagnosis result is healthy
  const isHealthyDiagnosis = (result: string | undefined) => {
    if (!result) return false;
    return result.toLowerCase().includes('healthy') || result.toLowerCase().includes('sehat') || result.toLowerCase().includes('normal');
  };

  // Get latest diagnosis for a plant
  const getLatestDiagnosis = (plant: { diagnosis: { checked_at: string; result: string; confidence: number; notes?: string; photo_url?: string }[] }) => {
    if (!plant.diagnosis || plant.diagnosis.length === 0) return null;
    return plant.diagnosis.sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime())[0];
  };

  // Get status badge for plant
  const getPlantStatusBadge = (plant: { diagnosis: { result: string; confidence: number; checked_at: string }[] }) => {
    const latest = getLatestDiagnosis(plant);
    if (!latest) return null;

    const isHealthy = isHealthyDiagnosis(latest.result);

    return {
      text: isHealthy ? 'Sehat' : 'Perlu Perhatian',
      color: isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
      result: latest.result,
      confidence: latest.confidence,
    };
  };

  // Filter plants based on search and status
  const filteredPlants = useMemo(() => {
    let filtered = plants;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((plant) => plant.name.toLowerCase().includes(searchTerm.toLowerCase()) || plant.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((plant) => {
        const latest = getLatestDiagnosis(plant);
        if (!latest) return false;

        const isHealthy = isHealthyDiagnosis(latest.result);
        return filterStatus === 'healthy' ? isHealthy : !isHealthy;
      });
    }

    return filtered;
  }, [plants, searchTerm, filterStatus]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalPlants = plants.length;
    const healthyPlants = plants.filter((plant) => {
      const latest = getLatestDiagnosis(plant);
      return latest && isHealthyDiagnosis(latest.result);
    }).length;
    const needsAttention = plants.filter((plant) => {
      const latest = getLatestDiagnosis(plant);
      return latest && !isHealthyDiagnosis(latest.result);
    }).length;

    return { totalPlants, healthyPlants, needsAttention };
  }, [plants]);

  // Add new plant
  const handleAddPlant = async () => {
    if (!newPlant.name.trim()) return;

    try {
      const session = await getSession();
      if (!session || !session.token) {
        throw new Error('Session tidak ditemukan. Silakan login ulang.');
      }
      const plant = await addPlant(session.token, {
        name: newPlant.name,
        description: newPlant.description,
      });

      setPlants([...plants, plant]);
      setNewPlant({ name: '', description: '' });
      setShowAddForm(false);
    } catch (err) {
      setError('Gagal menambahkan tanaman');
      console.error(err);
    }
  };

  // Edit plant
  const handleEditPlant = async () => {
    if (!editingPlant || !editPlantData.name.trim()) return;

    try {
      const session = await getSession();
      if (!session || !session.token) {
        throw new Error('Session tidak ditemukan. Silakan login ulang.');
      }
      
      const updatedPlant = await updatePlant(session.token, editingPlant.id, {
        name: editPlantData.name,
        description: editPlantData.description,
      });

      setPlants(plants.map(plant => 
        plant.id === editingPlant.id 
          ? { ...plant, name: updatedPlant.name, description: updatedPlant.description }
          : plant
      ));
      
      setShowEditForm(false);
      setEditingPlant(null);
      setEditPlantData({ name: '', description: '' });
    } catch (err) {
      setError('Gagal mengupdate tanaman');
      console.error(err);
    }
  };

  // Open edit form
  const openEditForm = (plant: Plant) => {
    setEditingPlant(plant);
    setEditPlantData({ name: plant.name, description: plant.description });
    setShowEditForm(true);
  };

  // Handle file selection for diagnosis
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle diagnosis submission
  const handleDiagnosis = async () => {
    if (!selectedPlant || !selectedFile) return;

    try {
      setIsDiagnosing(true);
      const session = await getSession();
      if (!session || !session.token) {
        throw new Error('Session tidak ditemukan. Silakan login ulang.');
      }
      const diagnosis = await diagnosePlant(session.token, selectedPlant.id, selectedFile);

      // Update plants state with new diagnosis
      setPlants(
        plants.map((plant) => {
          if (plant.id === selectedPlant.id) {
            return {
              ...plant,
              diagnosis: [diagnosis, ...plant.diagnosis],
            };
          }
          return plant;
        })
      );

      // Set the diagnosis result
      setDiagnosisResult(diagnosis);
      setShowResultDialog(true);
    } catch (err) {
      setError('Gagal melakukan diagnosis');
      console.error(err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Handle delete plant
  const handleDeletePlant = async (plantId: string) => {
    try {
      const session = await getSession();
      if (!session || !session.token) {
        throw new Error('Session tidak ditemukan. Silakan login ulang.');
      }
      await deletePlant(session.token, plantId);
      setPlants(plants.filter((plant) => plant.id !== plantId));
    } catch (err) {
      setError('Gagal menghapus tanaman');
      console.error(err);
    }
  };

  // Handle delete diagnosis
  const handleDeleteDiagnosis = async (diagnosisId: string) => {
    if (!historyPlant) return;

    try {
      const session = await getSession();
      if (!session || !session.token) {
        throw new Error('Session tidak ditemukan. Silakan login ulang.');
      }
      
      await deleteDiagnosis(session.token, historyPlant.id, diagnosisId);
      
      // Update plants state
      setPlants(plants.map(plant => 
        plant.id === historyPlant.id 
          ? { ...plant, diagnosis: plant.diagnosis.filter(d => d.id !== diagnosisId) }
          : plant
      ));
      
      // Update history plant
      setHistoryPlant({
        ...historyPlant,
        diagnosis: historyPlant.diagnosis.filter(d => d.id !== diagnosisId)
      });
      
    } catch (err) {
      setError('Gagal menghapus diagnosis');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const toggleNoteExpand = (id: string) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Memuat Tanaman Anda...</p>
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
      {/* Header Tanaman Saya */}
      <div className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tanaman Saya</h1>
                <p className="text-sm text-gray-600">Kelola tanaman Anda</p>
              </div>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Tanaman
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tanaman</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPlants}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tanaman Sehat</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.healthyPlants}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Perlu Perhatian</p>
                  <p className="text-2xl font-bold text-red-600">{stats.needsAttention}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Cari nama tanaman..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="healthy">Sehat</SelectItem>
                  <SelectItem value="needs_attention">Perlu Perhatian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Plants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant) => {
            const latestDiagnosis = getLatestDiagnosis(plant);
            const statusBadge = getPlantStatusBadge(plant);

            return (
              <Card key={plant.id} className="bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 mb-1">{plant.name}</CardTitle>
                      <CardDescription className="text-sm text-gray-600">{plant.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Leaf className="h-5 w-5 text-green-600" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0">
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => openEditForm(plant)}
                            className="cursor-pointer focus:bg-gray-100"
                          >
                            <Edit className="h-4 w-4 mr-2 text-gray-600" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setHistoryPlant(plant);
                              setShowHistory(true);
                            }}
                            className="cursor-pointer focus:bg-gray-100"
                            disabled={plant.diagnosis.length === 0}
                          >
                            <History className="h-4 w-4 mr-2 text-gray-600" />
                            <span>Riwayat</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeletePlant(plant.id)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span>Hapus</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {latestDiagnosis ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        {statusBadge ? <Badge className={`${statusBadge.color} text-xs`}>{statusBadge.text}</Badge> : null}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-800 mb-1">{statusBadge ? statusBadge.result : ''}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDateShort(latestDiagnosis.checked_at)}
                          </div>
                          <div className="text-xs text-gray-500">Confidence: {Math.round(latestDiagnosis.confidence * 100)}%</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Total diagnosis: {plant.diagnosis.length}</span>
                        <div className="flex items-center">
                          <Activity className="h-3 w-3 mr-1" />
                          <span>Aktif</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Camera className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">Belum ada diagnosis</p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full hover:bg-green-50 hover:border-green-200"
                          onClick={() => {
                            setSelectedPlant(plant);
                            setShowDiagnosisDialog(true);
                          }}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Diagnosis
                        </Button>
                      </AlertDialogTrigger>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPlants.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{plants.length === 0 ? 'Belum ada tanaman' : 'Tidak ada tanaman yang cocok'}</h3>
            <p className="text-gray-500 mb-4">{plants.length === 0 ? 'Mulai tambahkan tanaman pertama Anda' : 'Coba ubah kata kunci pencarian atau filter'}</p>
            {plants.length === 0 && (
              <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Tanaman
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Plant Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Tambah Tanaman Baru</h3>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tanaman</label>
                <Input value={newPlant.name} onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })} placeholder="Masukkan nama tanaman" className="w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <Textarea value={newPlant.description} onChange={(e) => setNewPlant({ ...newPlant, description: e.target.value })} placeholder="Deskripsi tanaman (opsional)" className="w-full" rows={3} />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setNewPlant({ name: '', description: '' });
                  setError(null);
                }}
              >
                Batal
              </Button>
              <Button onClick={handleAddPlant} disabled={!newPlant.name.trim()} className="bg-green-600 hover:bg-green-700 text-white">
                Tambah
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plant Form Modal */}
      {showEditForm && editingPlant && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Tanaman</h3>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tanaman</label>
                <Input 
                  value={editPlantData.name} 
                  onChange={(e) => setEditPlantData({ ...editPlantData, name: e.target.value })} 
                  placeholder="Masukkan nama tanaman" 
                  className="w-full" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <Textarea 
                  value={editPlantData.description} 
                  onChange={(e) => setEditPlantData({ ...editPlantData, description: e.target.value })} 
                  placeholder="Deskripsi tanaman (opsional)" 
                  className="w-full" 
                  rows={3} 
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingPlant(null);
                  setEditPlantData({ name: '', description: '' });
                  setError(null);
                }}
              >
                Batal
              </Button>
              <Button 
                onClick={handleEditPlant} 
                disabled={!editPlantData.name.trim()} 
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis Dialog */}
      {showDiagnosisDialog && selectedPlant && (
        <AlertDialog
          open={showDiagnosisDialog}
          onOpenChange={(open) => {
            if (!isDiagnosing) {
              setShowDiagnosisDialog(open);
              if (!open) {
                setSelectedFile(null);
                setSelectedPlant(null);
              }
            }
          }}
        >
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Diagnosis Tanaman</AlertDialogTitle>
              <AlertDialogDescription>Upload 1 daun dari tanaman {selectedPlant.name} untuk diagnosis</AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {selectedFile ? (
                  <div className="space-y-2">
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    <p className="text-sm text-gray-600 truncate">{selectedFile.name}</p>
                    {!isDiagnosing && (
                      <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                        <X className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                    )}
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Pilih foto daun</p>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    <Button variant="outline" className="mt-2" onClick={() => fileInputRef.current?.click()} disabled={isDiagnosing}>
                      Upload Foto
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDiagnosing}>Batal</AlertDialogCancel>
              <Button
                onClick={async (e) => {
                  e.preventDefault();
                  await handleDiagnosis();
                  setShowDiagnosisDialog(false);
                }}
                disabled={!selectedFile || isDiagnosing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isDiagnosing ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </div>
                ) : (
                  'Diagnosis'
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      {/* Diagnosis Result Dialog */}
      {showResultDialog && diagnosisResult && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Hasil Diagnosis</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowResultDialog(false);
                  setShowDiagnosisDialog(false);
                  setSelectedFile(null);
                  setSelectedPlant(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <Badge className={`${isHealthyDiagnosis(diagnosisResult.result) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs`}>{isHealthyDiagnosis(diagnosisResult.result) ? 'Sehat' : 'Perlu Perhatian'}</Badge>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-800 mb-1">{diagnosisResult.result}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Confidence: {Math.round(diagnosisResult.confidence * 100)}%</span>
                  <span>{formatDate(diagnosisResult.checked_at)}</span>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <img src={`${diagnosisResult.photo_url}`} alt="Hasil diagnosis" className="w-full h-48 object-contain bg-gray-100" />
              </div>

              {diagnosisResult.notes && (
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Catatan:</h4>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="text-sm text-gray-600 whitespace-pre-line">{formatMessage(diagnosisResult.notes)}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={() => {
                  setShowResultDialog(false);
                  setShowDiagnosisDialog(false);
                  setSelectedFile(null);
                  setSelectedPlant(null);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && historyPlant && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Riwayat Diagnosis - {historyPlant.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {historyPlant.diagnosis
                .sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime())
                .map((diagnosis, index) => {
                  const isHealthy = isHealthyDiagnosis(diagnosis.result);

                  return (
                    <div key={diagnosis.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          <img src={`${diagnosis.photo_url}`} alt={`Diagnosis ${index + 1}`} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{diagnosis.result}</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={`${isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs`}>{isHealthy ? 'Sehat' : 'Perlu Perhatian'}</Badge>
                              <button onClick={() => handleDeleteDiagnosis(diagnosis.id)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Hapus diagnosis">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Confidence: {Math.round(diagnosis.confidence * 100)}%</span>
                            <span className="text-sm text-gray-500">{formatDate(diagnosis.checked_at)}</span>
                          </div>

                          {diagnosis.notes && (
                            <div className="mt-2">
                              <div className={`text-sm text-gray-600 transition-all duration-300 ${expandedNotes[diagnosis.id] ? '' : 'line-clamp-2'}`}>{formatMessage(diagnosis.notes)}</div>
                              {diagnosis.notes.length > 100 && (
                                <button onClick={() => toggleNoteExpand(diagnosis.id)} className="text-xs text-gray-500 hover:underline mt-1">
                                  {expandedNotes[diagnosis.id] ? 'Sembunyikan' : 'Lihat Lengkap'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantInventoryPage;