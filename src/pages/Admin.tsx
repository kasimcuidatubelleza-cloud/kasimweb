// Version: 1.0.1 - Fixed fetch joins
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Appointment, Service, BankAccount } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Calendar, Scissors, LogOut, CheckCircle2, XCircle, Clock, Plus, RefreshCw, 
  CreditCard, Banknote, Eye, X, User, Loader2, Search, Filter, 
  ChevronLeft, ChevronRight, History, CalendarDays, ExternalLink, Link as LinkIcon,
  Trash2, Edit3, Image as ImageIcon, DollarSign, Upload, Settings2, Save, MessageCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";

const imageMap: Record<string, string> = {
  "manicura-americana": "/842.jpg",
  "manicura-rusa": "/848.jpg",
  "manicura-japonesa": "/849.jpg",
  "pedicuría-completa": "/853.jpg",
  "alargamiento": "/866.jpg",
  "caping-gel": "/890.jpg",
  "perfilado-de-cejas": "/935.jpg",
  "masajes-relajantes": "/948.jpg",
};

const getServiceImage = (s: any) => {
  if (s.image_url) return s.image_url;
  const key = s.name.toLowerCase().replace(/ /g, '-');
  return imageMap[key] || '/842.jpg';
};

const daysLabels = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const Admin = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [serviceForm, setServiceForm] = useState({
    name: "", description: "", price: 0, duration_minutes: 30, deposit_amount: 0, image_url: "", image_position: "50% 50%", mercadopago_link: "", category: "general"
  });

  const [bankAccountForm, setBankAccountForm] = useState({
    bank_name: "", account_name: "", cbu: "", alias: "", cuit_cuil: "", is_active: true
  });
  const [isBankAccountModalOpen, setIsBankAccountModalOpen] = useState(false);
  const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | null>(null);

  const [uploadingRefundId, setUploadingRefundId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await checkUser();
      await fetchData();
    };
    init();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate("/login");
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: appData, error: appError } = await supabase
        .from('appointments')
        .select('*, services:service_id(*), profiles:client_id(*), payments(*)')
        .order('start_time', { ascending: false });
      
      if (appError) {
        console.error("Error fetching appointments:", appError);
        toast.error("Error al cargar citas: " + appError.message);
        throw appError;
      }
      setAppointments(appData || []);
      const { data: servData } = await supabase.from('services').select('*').order('name');
      setServices(servData || []);
      const { data: hourData } = await supabase.from('business_hours').select('*').order('day_of_week');
      setBusinessHours(hourData || []);
      const { data: bankData } = await supabase.from('bank_accounts').select('*').order('created_at');
      setBankAccounts(bankData || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHours = async () => {
    setIsSaving(true);
    try {
      for (const hour of businessHours) {
        // Also save the first block's start_time and end_time to keep backwards compatibility if anything relies on them
        const firstBlock = hour.blocks && hour.blocks.length > 0 ? hour.blocks[0] : null;
        const start_time = firstBlock ? `${firstBlock.start_time}:00` : "09:00:00";
        const end_time = firstBlock ? `${firstBlock.end_time}:00` : "18:00:00";

        const { error } = await supabase.from('business_hours').update({
          start_time,
          end_time,
          is_closed: hour.is_closed,
          blocks: hour.blocks || []
        }).eq('id', hour.id);
        if (error) throw error;
      }
      toast.success("Horarios actualizados correctamente");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalImageUrl = serviceForm.image_url;
      if (serviceImageFile) {
        const fileExt = serviceImageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('service-images').upload(fileName, serviceImageFile);
        if (uploadError) throw uploadError;
        finalImageUrl = `https://hhccprjmvnvpzeatbthi.supabase.co/storage/v1/object/public/service-images/${fileName}`;
      }
      const payload = { ...serviceForm, image_url: finalImageUrl };
      if (editingService) {
        const { error } = await supabase.from('services').update(payload).eq('id', editingService.id);
        if (error) throw error;
        toast.success("Servicio actualizado");
      } else {
        const { error } = await supabase.from('services').insert(payload);
        if (error) throw error;
        toast.success("Servicio creado");
      }
      setIsServiceModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingBankAccount) {
        const { error } = await supabase.from('bank_accounts').update(bankAccountForm).eq('id', editingBankAccount.id);
        if (error) throw error;
        toast.success("Cuenta actualizada");
      } else {
        const { error } = await supabase.from('bank_accounts').insert(bankAccountForm);
        if (error) throw error;
        toast.success("Cuenta creada");
      }
      setIsBankAccountModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const paginate = (items: any[]) => items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="bg-background border-b p-4 sticky top-0 z-20 shadow-sm">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white brand-name shadow-lg shadow-primary/20">K</div>
            <h1 className="text-xl brand-name text-primary">KASIM Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={fetchData} disabled={isLoading}><RefreshCw className={isLoading ? 'animate-spin' : ''} /></Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>Web</Button>
            <Button variant="destructive" size="sm" onClick={() => supabase.auth.signOut()}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Panel Administrativo</h1>
            <p className="text-muted-foreground text-sm">Gestiona agenda, servicios y horarios</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={() => setIsManualBookingOpen(true)} className="flex-1 rounded-2xl gap-2 shadow-lg bg-primary hover:bg-primary/90 py-6">
              <Plus className="w-4 h-4" /> Cita Manual
            </Button>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <div className="bg-background p-4 rounded-3xl border shadow-sm flex flex-col md:flex-row gap-4">
            <TabsList className="bg-muted p-1 rounded-2xl h-12 overflow-x-auto overflow-y-hidden">
              <TabsTrigger value="upcoming" className="rounded-xl px-6">Próximas</TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl px-6">Historial</TabsTrigger>
              <TabsTrigger value="services" className="rounded-xl px-6">Servicios</TabsTrigger>
              <TabsTrigger value="services_mikve" className="rounded-xl px-6">Servicios Mikve</TabsTrigger>
              <TabsTrigger value="bank_accounts" className="rounded-xl px-6">Cuentas</TabsTrigger>
              <TabsTrigger value="hours" className="rounded-xl px-6 gap-2"><Settings2 className="w-4 h-4" /> Horarios</TabsTrigger>
            </TabsList>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input placeholder="Buscar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 h-12 rounded-2xl bg-muted border-none outline-none" />
            </div>
          </div>

          {/* CITAS PROXIMAS */}
          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <h3 className="font-bold text-lg">Citas Generales</h3>
                </div>
                <AppointmentList 
                  apps={paginate(appointments.filter(a => ['pending', 'confirmed', 'pending_confirmation', 'pending_refund'].includes(a.status) && a.services?.category !== 'mikve'))} 
                  onUpdateStatus={() => fetchData()} 
                  onViewImage={setSelectedImage}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <h3 className="font-bold text-lg">Comunidad Judía (Mikve)</h3>
                </div>
                <AppointmentList 
                  apps={paginate(appointments.filter(a => ['pending', 'confirmed', 'pending_confirmation', 'pending_refund'].includes(a.status) && a.services?.category === 'mikve'))} 
                  onUpdateStatus={() => fetchData()} 
                  onViewImage={setSelectedImage}
                />
              </div>
            </div>
          </TabsContent>

          {/* HISTORIAL */}
          <TabsContent value="history">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <h3 className="font-bold text-lg">Historial General</h3>
                </div>
                <AppointmentList 
                  apps={paginate(appointments.filter(a => (a.status === 'completed' || a.status === 'cancelled') && a.services?.category !== 'mikve'))} 
                  onUpdateStatus={() => fetchData()} 
                  onViewImage={setSelectedImage}
                  isHistory={true}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <h3 className="font-bold text-lg">Historial Mikve</h3>
                </div>
                <AppointmentList 
                  apps={paginate(appointments.filter(a => (a.status === 'completed' || a.status === 'cancelled') && a.services?.category === 'mikve'))} 
                  onUpdateStatus={() => fetchData()} 
                  onViewImage={setSelectedImage}
                  isHistory={true}
                />
              </div>
            </div>
          </TabsContent>

          {/* SERVICIOS */}
          <TabsContent value="services">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Servicios Generales</h3>
              <Button size="sm" onClick={() => { setEditingService(null); setServiceImageFile(null); setServiceForm({ name: "", description: "", price: 0, duration_minutes: 30, deposit_amount: 0, image_url: "", image_position: "50% 50%", mercadopago_link: "", category: "general" }); setIsServiceModalOpen(true); }} className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Nuevo</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.filter(s => s.category !== 'mikve').map(s => (
                <div key={s.id} className="bg-background rounded-[32px] border flex flex-col h-full group overflow-hidden hover:shadow-lg transition-all">
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={getServiceImage(s)} 
                      alt={s.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      style={{ objectPosition: s.image_position || '50% 50%' }}
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{s.name}</h4>
                      <span className="font-bold text-primary">${s.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground flex-grow mb-4 line-clamp-2">{s.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg flex items-center gap-1"><Clock className="w-3 h-3" /> {s.duration_minutes} min</span>
                      <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg border border-primary/10 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Seña: ${s.deposit_amount}</span>
                      {s.mercadopago_link && <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">MP ✓</span>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl gap-1" onClick={() => { setEditingService(s); setServiceForm({ ...s, image_position: s.image_position || "50% 50%" } as any); setServiceImageFile(null); setIsServiceModalOpen(true); }}>
                        <Edit3 className="w-3 h-3" /> Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 rounded-xl" onClick={async () => { if (!confirm("¿Eliminar este servicio?")) return; const { error } = await supabase.from('services').delete().eq('id', s.id); if (!error) { toast.success("Eliminado"); fetchData(); } else toast.error("Tiene citas asociadas."); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* SERVICIOS MIKVE */}
          <TabsContent value="services_mikve">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Servicios Comunidad Judía (Mikve)</h3>
              <Button size="sm" onClick={() => { setEditingService(null); setServiceImageFile(null); setServiceForm({ name: "", description: "", price: 0, duration_minutes: 30, deposit_amount: 0, image_url: "", image_position: "50% 50%", mercadopago_link: "", category: "mikve" }); setIsServiceModalOpen(true); }} className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Nuevo Mikve</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.filter(s => s.category === 'mikve').map(s => (
                <div key={s.id} className="bg-background rounded-[32px] border flex flex-col h-full group overflow-hidden hover:shadow-lg transition-all border-purple-200">
                  <div className="h-40 overflow-hidden relative">
                    <div className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">Mikve</div>
                    <img 
                      src={getServiceImage(s)} 
                      alt={s.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      style={{ objectPosition: s.image_position || '50% 50%' }}
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{s.name}</h4>
                      <span className="font-bold text-primary">${s.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground flex-grow mb-4 line-clamp-2">{s.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg flex items-center gap-1"><Clock className="w-3 h-3" /> {s.duration_minutes} min</span>
                      <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg border border-primary/10 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Seña: ${s.deposit_amount}</span>
                      {s.mercadopago_link && <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">MP ✓</span>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl gap-1" onClick={() => { setEditingService(s); setServiceForm({ ...s, image_position: s.image_position || "50% 50%" } as any); setServiceImageFile(null); setIsServiceModalOpen(true); }}>
                        <Edit3 className="w-3 h-3" /> Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 rounded-xl" onClick={async () => { if (!confirm("¿Eliminar este servicio?")) return; const { error } = await supabase.from('services').delete().eq('id', s.id); if (!error) { toast.success("Eliminado"); fetchData(); } else toast.error("Tiene citas asociadas."); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* CUENTAS BANCARIAS */}
          <TabsContent value="bank_accounts">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Cuentas Bancarias (Transferencias)</h3>
              <Button size="sm" onClick={() => { setEditingBankAccount(null); setBankAccountForm({ bank_name: "", account_name: "", cbu: "", alias: "", cuit_cuil: "", is_active: true }); setIsBankAccountModalOpen(true); }} className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Nueva</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bankAccounts.map(b => (
                <div key={b.id} className="bg-background rounded-[32px] border p-6 flex flex-col group hover:shadow-lg transition-all relative overflow-hidden">
                  {!b.is_active && <div className="absolute top-4 right-4 text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">Inactiva</div>}
                  {b.is_active && <div className="absolute top-4 right-4 text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full font-bold">Activa</div>}
                  <h4 className="font-bold text-lg mb-1">{b.bank_name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{b.account_name}</p>
                  
                  <div className="space-y-1 mb-6 bg-muted/30 p-4 rounded-2xl">
                    <p className="text-xs font-bold">CBU: <span className="font-medium text-muted-foreground">{b.cbu}</span></p>
                    <p className="text-xs font-bold">Alias: <span className="font-medium text-muted-foreground">{b.alias || '-'}</span></p>
                    <p className="text-xs font-bold">CUIT/CUIL: <span className="font-medium text-muted-foreground">{b.cuit_cuil || '-'}</span></p>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl gap-1" onClick={() => { setEditingBankAccount(b); setBankAccountForm({ bank_name: b.bank_name, account_name: b.account_name, cbu: b.cbu, alias: b.alias || "", cuit_cuil: b.cuit_cuil || "", is_active: b.is_active }); setIsBankAccountModalOpen(true); }}>
                      <Edit3 className="w-3 h-3" /> Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 rounded-xl" onClick={async () => { if (!confirm("¿Eliminar esta cuenta?")) return; const { error } = await supabase.from('bank_accounts').delete().eq('id', b.id); if (!error) { toast.success("Eliminada"); fetchData(); } else toast.error("Error al eliminar."); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* HORARIOS */}
          <TabsContent value="hours">
            <div className="bg-background p-8 rounded-[40px] border shadow-sm space-y-8 max-w-4xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Semana Laboral</h3>
                  <p className="text-sm text-muted-foreground">Configura los bloques de tiempo disponibles para citas.</p>
                </div>
                <Button onClick={handleSaveHours} disabled={isSaving} className="rounded-xl gap-2 shadow-lg">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Horarios
                </Button>
              </div>

              <div className="space-y-4">
                {businessHours.map((hour, index) => (
                  <div key={hour.id} className={`flex flex-col p-6 rounded-3xl border transition-all ${hour.is_closed ? 'bg-muted/50 opacity-60' : 'bg-background hover:border-primary/30'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-muted/50 mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${hour.is_closed ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="font-bold text-lg">{daysLabels[hour.day_of_week]}</span>
                      </div>

                      <button 
                        onClick={() => {
                          const newHours = [...businessHours];
                          newHours[index].is_closed = !newHours[index].is_closed;
                          if (!newHours[index].is_closed && (!newHours[index].blocks || newHours[index].blocks.length === 0)) {
                            newHours[index].blocks = [{ start_time: "09:00", end_time: "18:00" }];
                          }
                          setBusinessHours(newHours);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${hour.is_closed ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'}`}
                      >
                        {hour.is_closed ? 'Abrir Día' : 'Cerrar Día'}
                      </button>
                    </div>

                    {!hour.is_closed && (
                      <div className="space-y-3">
                        <div className="flex flex-col gap-2">
                          {hour.blocks && hour.blocks.map((block: any, bIndex: number) => (
                            <div key={bIndex} className="flex items-center gap-2 bg-muted/20 p-2 rounded-2xl max-w-md">
                              <input 
                                type="time" 
                                value={block.start_time} 
                                onChange={e => {
                                  const newHours = [...businessHours];
                                  newHours[index].blocks[bIndex].start_time = e.target.value;
                                  setBusinessHours(newHours);
                                }}
                                className="p-2 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/20"
                              />
                              <span className="text-muted-foreground text-sm">a</span>
                              <input 
                                type="time" 
                                value={block.end_time} 
                                onChange={e => {
                                  const newHours = [...businessHours];
                                  newHours[index].blocks[bIndex].end_time = e.target.value;
                                  setBusinessHours(newHours);
                                }}
                                className="p-2 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/20"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newHours = [...businessHours];
                                  newHours[index].blocks.splice(bIndex, 1);
                                  setBusinessHours(newHours);
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl ml-auto transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const newHours = [...businessHours];
                            if (!newHours[index].blocks) {
                              newHours[index].blocks = [];
                            }
                            newHours[index].blocks.push({ start_time: "14:00", end_time: "18:00" });
                            setBusinessHours(newHours);
                          }}
                          className="rounded-xl gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Agregar bloque
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* MODAL IMAGEN AMPLIADA */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedImage(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative max-w-4xl max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"><X className="w-8 h-8" /></button>
              <img src={selectedImage} alt="Comprobante" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/10" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL SERVICIO COMPLETO */}
      <AnimatePresence>
        {isServiceModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-background w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border bg-muted/30 flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold flex items-center gap-3"><Scissors className="w-6 h-6 text-primary" /> {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
                <button onClick={() => setIsServiceModalOpen(false)} className="p-2 hover:bg-muted rounded-full"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSaveService} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Nombre del Servicio" value={serviceForm.name} onChange={v => setServiceForm({...serviceForm, name: v})} required />
                  <InputGroup label="Precio ($)" type="number" value={serviceForm.price} onChange={v => setServiceForm({...serviceForm, price: Number(v)})} required min="0" />
                  <InputGroup label="Duración (Minutos)" type="number" value={serviceForm.duration_minutes} onChange={v => setServiceForm({...serviceForm, duration_minutes: Number(v)})} required min="1" />
                  <InputGroup label="Seña Requerida ($)" type="number" value={serviceForm.deposit_amount} onChange={v => setServiceForm({...serviceForm, deposit_amount: Number(v)})} required min="0" />
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Descripción</label>
                    <textarea value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} className="w-full p-4 rounded-2xl bg-muted/50 border border-border h-24 outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                  </div>

                  {/* IMAGEN */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Imagen del Servicio</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-24 h-24 rounded-2xl bg-muted border border-border overflow-hidden flex items-center justify-center flex-shrink-0 bg-background">
                          {(serviceImageFile || serviceForm.image_url) ? (
                            <img 
                              src={serviceImageFile ? URL.createObjectURL(serviceImageFile) : serviceForm.image_url} 
                              className="w-full h-full object-cover" 
                              style={{ objectPosition: serviceForm.image_position || '50% 50%' }}
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                          )}
                        </div>
                        <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-[24px] cursor-pointer hover:bg-muted/50 transition-colors">
                          <Upload className="w-6 h-6 text-primary mb-1" />
                          <span className="text-xs font-bold text-muted-foreground">{serviceImageFile ? serviceImageFile.name : 'Subir desde PC'}</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => setServiceImageFile(e.target.files?.[0] || null)} />
                        </label>
                      </div>
                    </div>

                    {/* CONTROL DE ENCUADRE DE IMAGEN (SLIDERS Y VISTA PREVIA) */}
                    {(serviceImageFile || serviceForm.image_url) && (() => {
                      const [posX, posY] = (serviceForm.image_position || "50% 50%").split(" ");
                      const xVal = parseInt(posX) || 50;
                      const yVal = parseInt(posY) || 50;

                      return (
                        <div className="bg-muted/30 p-5 rounded-3xl border border-border space-y-4">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Encuadre / Vista Previa de la Tarjeta</p>
                          
                          {/* Vista previa en escala real */}
                          <div className="w-full h-40 rounded-2xl overflow-hidden relative border bg-muted">
                            <img 
                              src={serviceImageFile ? URL.createObjectURL(serviceImageFile) : (serviceForm.image_url || '/placeholder.svg')} 
                              alt="Vista previa" 
                              className="w-full h-full object-cover"
                              style={{ objectPosition: serviceForm.image_position || '50% 50%' }}
                            />
                            <div className="absolute inset-0 bg-black/5 border-2 border-primary/20 rounded-2xl pointer-events-none" />
                          </div>

                          {/* Sliders */}
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                <span>Ajuste Vertical (Arriba / Abajo)</span>
                                <span className="text-primary">{yVal}%</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={yVal} 
                                onChange={e => {
                                  const val = e.target.value;
                                  setServiceForm({
                                    ...serviceForm,
                                    image_position: `${xVal}% ${val}%`
                                  });
                                }}
                                className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                <span>Ajuste Horizontal (Izquierda / Derecha)</span>
                                <span className="text-primary">{xVal}%</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={xVal} 
                                onChange={e => {
                                  const val = e.target.value;
                                  setServiceForm({
                                    ...serviceForm,
                                    image_position: `${val}% ${yVal}%`
                                  });
                                }}
                                className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic text-center leading-normal">Desplaza los controles para ajustar exactamente qué parte de la foto se verá en las tarjetas.</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* MERCADO PAGO */}
                  <div className="md:col-span-2">
                    <InputGroup label="Link de Mercado Pago" value={serviceForm.mercadopago_link || ""} onChange={(v: string) => setServiceForm({...serviceForm, mercadopago_link: v})} />
                  </div>
                </div>
                <Button type="submit" disabled={isSaving} className="w-full py-7 rounded-[24px] text-lg font-bold gap-3 mt-4 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                  {isSaving ? <Loader2 className="animate-spin" /> : <Plus className="w-5 h-5" />}
                  {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setIsServiceModalOpen(false)} className="w-full rounded-2xl">Cancelar</Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL CUENTA BANCARIA */}
      <AnimatePresence>
        {isBankAccountModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-background w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border bg-muted/30 flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold flex items-center gap-3"><Banknote className="w-6 h-6 text-primary" /> {editingBankAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}</h2>
                <button onClick={() => setIsBankAccountModalOpen(false)} className="p-2 hover:bg-muted rounded-full"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSaveBankAccount} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
                <InputGroup label="Banco (Ej: Galicia, Mercado Pago)" value={bankAccountForm.bank_name} onChange={(v: string) => setBankAccountForm({...bankAccountForm, bank_name: v})} required />
                <InputGroup label="Nombre del Titular" value={bankAccountForm.account_name} onChange={(v: string) => setBankAccountForm({...bankAccountForm, account_name: v})} required />
                <InputGroup label="CBU / CVU" value={bankAccountForm.cbu} onChange={(v: string) => setBankAccountForm({...bankAccountForm, cbu: v})} required />
                <InputGroup label="Alias (Opcional)" value={bankAccountForm.alias} onChange={(v: string) => setBankAccountForm({...bankAccountForm, alias: v})} />
                <InputGroup label="CUIT / CUIL (Opcional)" value={bankAccountForm.cuit_cuil} onChange={(v: string) => setBankAccountForm({...bankAccountForm, cuit_cuil: v})} />
                
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="isActive" checked={bankAccountForm.is_active} onChange={(e) => setBankAccountForm({...bankAccountForm, is_active: e.target.checked})} className="w-4 h-4 rounded text-primary" />
                  <label htmlFor="isActive" className="text-sm font-bold">Cuenta Activa (Visible para clientes)</label>
                </div>

                <Button type="submit" disabled={isSaving} className="w-full py-7 rounded-[24px] text-lg font-bold gap-3 mt-6 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                  {editingBankAccount ? 'Guardar Cambios' : 'Crear Cuenta'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setIsBankAccountModalOpen(false)} className="w-full rounded-2xl">Cancelar</Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AppointmentList = ({ apps, onUpdateStatus, onViewImage, isHistory }: any) => {
  if (apps.length === 0) {
    return <div className="text-center py-20 bg-background rounded-3xl border-dashed border border-border text-muted-foreground">Sin citas.</div>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const hoy: any[] = [];
  const manana: any[] = [];
  const proximas: any[] = []; // O pasadas si es historial

  apps.forEach((app: any) => {
    const appDate = new Date(app.start_time);
    if (appDate >= today && appDate < tomorrow) {
      hoy.push(app);
    } else if (appDate >= tomorrow && appDate < dayAfterTomorrow) {
      manana.push(app);
    } else {
      proximas.push(app);
    }
  });

  const renderGroup = (title: string, groupApps: any[]) => {
    if (groupApps.length === 0) return null;
    return (
      <div className="mb-8">
        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-2 border-l-2 border-primary">{title}</h4>
        <div className="grid gap-4">
          {groupApps.map((app: any) => (
            <div key={app.id} className="bg-background p-6 rounded-[32px] border shadow-sm flex flex-col gap-4 border-l-4 border-l-primary/30 transition-all hover:shadow-md overflow-hidden relative">
              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${
                    app.status === 'confirmed' ? 'text-green-500 bg-green-50 border-green-200' :
                    app.status === 'pending_confirmation' ? 'text-amber-500 bg-amber-50 border-amber-200' :
                    app.status === 'pending_refund' ? 'text-purple-500 bg-purple-50 border-purple-200' :
                    'text-muted-foreground bg-muted border-border'
                  }`}>{app.status === 'pending_confirmation' ? 'Pendiente confirmación' : app.status === 'pending_refund' ? 'Reembolso pendiente' : app.status}</span>
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(app.start_time).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    {title === 'Otras Fechas' && ` - ${new Date(app.start_time).toLocaleDateString('es-AR')}`}
                  </span>
                </div>
                <h4 className="font-bold text-lg leading-tight">{app.services?.name}</h4>
                <div className="flex flex-col gap-1 bg-muted/20 p-3 rounded-2xl border border-border/50">
                  <p className="text-sm font-bold flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {app.profiles?.full_name || app.guest_name}</p>
                  {app.profiles && app.profiles.phone ? (() => {
                    const phoneClean = app.profiles.phone.replace(/[^0-9]/g, '');
                    const clientName = app.profiles.full_name || app.guest_name || 'Cliente';
                    const serviceName = app.services?.name || 'Servicio';
                    const dateString = new Date(app.start_time).toLocaleDateString('es-AR');
                    const timeString = new Date(app.start_time).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
                    
                    const msg = `Hola ${clientName}, te recordamos tu cita para *${serviceName}* el día *${dateString}* a las *${timeString} hs* en Kasim. ¡Te esperamos! 🤍`;
                    const waUrl = isHistory 
                      ? `https://wa.me/${phoneClean}` 
                      : `https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`;
                    
                    return (
                      <p className="text-[11px] text-muted-foreground font-medium ml-6 flex flex-wrap items-center gap-2">
                        TEL: 
                        <a 
                          href={waUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-primary hover:underline bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/10 transition-colors font-bold text-[10px]"
                        >
                          <MessageCircle className="w-3 h-3 text-green-500 fill-green-500/20" />
                          {app.profiles.phone}
                        </a> 
                        | DNI: {app.profiles.dni || 'S/D'}
                      </p>
                    );
                  })() : (
                    app.profiles && (
                      <p className="text-[11px] text-muted-foreground font-medium ml-6">
                        TEL: S/D | DNI: {app.profiles.dni || 'S/D'}
                      </p>
                    )
                  )}
                </div>
                {app.notes && <p className="text-[11px] text-muted-foreground italic px-3 py-2 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl">"{app.notes}"</p>}
                
                {/* Detalles de Pago */}
                {app.payments && app.payments.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {app.payments.map((p: any) => (
                      <div key={p.id} className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-tighter flex items-center gap-1 ${
                          p.payment_method === 'cash' ? 'text-green-600 bg-green-50 border-green-100' :
                          p.payment_method === 'mercadopago' ? 'text-blue-600 bg-blue-50 border-blue-100' :
                          'text-purple-600 bg-purple-50 border-purple-100'
                        }`}>
                          <DollarSign className="w-3 h-3" />
                          {p.payment_method === 'cash' ? 'EFECTIVO' : 
                          p.payment_method === 'mercadopago' ? 'MERCADO PAGO' : 'TRANSFERENCIA'} - {p.status}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-muted/60 border-border text-foreground tracking-tighter">
                          Abonó: ${p.amount} / Total: ${app.services?.price || 0}
                        </span>
                        
                        {(app.services?.price || 0) - p.amount > 0 ? (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-amber-50 border-amber-200 text-amber-600 tracking-tighter animate-pulse">
                            Debe: ${app.services.price - p.amount}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-600 tracking-tighter">
                            Total Pagado
                          </span>
                        )}
                        
                        {/* Comprobante de pago (cliente) */}
                        {p.evidence_url && (
                          <button 
                            type="button"
                            onClick={() => onViewImage(`https://hhccprjmvnvpzeatbthi.supabase.co/storage/v1/object/public/payment-evidence/${p.evidence_url}`)}
                            className="text-[10px] font-bold px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
                          >
                            <ImageIcon className="w-3 h-3" /> Ver Comprobante
                          </button>
                        )}

                        {/* Comprobante de reembolso (admin) */}
                        {p.refund_evidence_url && (
                          <button 
                            type="button"
                            onClick={() => onViewImage(`https://hhccprjmvnvpzeatbthi.supabase.co/storage/v1/object/public/payment-evidence/${p.refund_evidence_url}`)}
                            className="text-[10px] font-bold px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1"
                          >
                            <ImageIcon className="w-3 h-3" /> Ver Reembolso
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 w-full pt-4 border-t border-border">
                {app.status === 'pending_confirmation' && (
                  <Button size="sm" className="rounded-xl px-4 flex-1 bg-primary text-white" onClick={async () => {
                    await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', app.id);
                    toast.success("Cita confirmada");
                    onUpdateStatus();
                  }}>Confirmar</Button>
                )}
                
                {app.payments?.some((p: any) => p.status === 'pending_verification') && (
                  <Button size="sm" className="rounded-xl px-4 flex-1 bg-blue-500 text-white" onClick={async () => {
                    await supabase.from('payments').update({ status: 'verified' }).eq('appointment_id', app.id);
                    toast.success("Pago verificado");
                    onUpdateStatus();
                  }}>Verificar Pago</Button>
                )}

                {app.status === 'pending_refund' && (
                    <div className="flex flex-col gap-2 w-full flex-1">
                      <input 
                        type="file" 
                        id={`refund-${app.id}`} 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          try {
                            const fileName = `refund-${app.id}-${Date.now()}.jpg`;
                            const { error: uploadError } = await supabase.storage
                              .from('payment-evidence')
                              .upload(fileName, file);
                            
                            if (uploadError) throw uploadError;

                            const { error: updateError } = await supabase
                              .from('payments')
                              .update({ refund_evidence_url: fileName, status: 'refunded' })
                              .eq('appointment_id', app.id);
                            
                            if (updateError) throw updateError;

                            await supabase.from('appointments').update({ status: 'refunded' }).eq('id', app.id);
                            
                            toast.success("Reembolso procesado");
                            onUpdateStatus();
                          } catch (err: any) {
                            toast.error("Error: " + err.message);
                          }
                        }}
                      />
                      <Button 
                        size="sm" 
                        className="rounded-xl px-4 bg-purple-500 text-white w-full" 
                        onClick={() => document.getElementById(`refund-${app.id}`)?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Reembolsar
                      </Button>
                    </div>
                  )}

                {app.status !== 'completed' && app.status !== 'cancelled' && (
                  <Button size="sm" variant="outline" className="rounded-xl px-4 flex-1" onClick={async () => {
                    await supabase.from('appointments').update({ status: 'completed' }).eq('id', app.id);
                    onUpdateStatus();
                  }}>Completada</Button>
                )}
                
                {app.status !== 'cancelled' && (
                  <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 rounded-xl px-3" onClick={async () => {
                    if (!confirm("¿Cancelar esta cita? Si ya fue pagada, pasará a estado de reembolso.")) return;
                    const hasPayment = app.payments && app.payments.length > 0 && app.payments[0].status === 'verified';
                    const newStatus = hasPayment ? 'pending_refund' : 'cancelled';
                    await supabase.from('appointments').update({ status: newStatus }).eq('id', app.id);
                    onUpdateStatus();
                  }}><XCircle className="w-5 h-5" /></Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {renderGroup("Citas para Hoy", hoy)}
      {renderGroup("Citas de Mañana", manana)}
      {renderGroup("Otras Fechas", proximas)}
    </div>
  );
};

const InputGroup = ({ label, value, onChange, type = "text", required = false, min }: any) => {
  const displayValue = type === "number" && value === 0 ? "" : value;

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type} 
        required={required} 
        value={displayValue} 
        min={min}
        onKeyDown={type === "number" ? (e) => {
          if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
            e.preventDefault();
          }
        } : undefined}
        onChange={e => {
          const val = e.target.value;
          if (type === "number" && Number(val) < 0) {
            return;
          }
          onChange(val);
        }} 
        className="w-full p-4 rounded-2xl bg-muted/50 border border-border outline-none focus:ring-2 focus:ring-primary/20 text-sm" 
      />
    </div>
  );
};

export default Admin;
