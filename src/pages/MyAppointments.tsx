import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  MapPin, 
  Phone, 
  User, 
  LogOut,
  CalendarDays,
  History,
  MessageCircle,
  HelpCircle,
  X,
  Mail,
  Loader2
} from "lucide-react";
import { supabase, Appointment, Service } from "@/lib/supabase";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "", dni: "" });
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setSession(session);
    fetchData(session.user.id);
  };

  const fetchData = async (userId: string) => {
    console.log("fetchData called for user:", userId);
    setIsLoading(true);
    try {
      const { data: profData } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      console.log("Profile data fetched:", profData);
      setProfile(profData);
      if (profData) {
        setProfileForm({ 
          full_name: profData.full_name || "", 
          phone: profData.phone || "", 
          dni: profData.dni || "" 
        });
      }

      const { data: appData, error: appError } = await supabase
        .from('appointments')
        .select(`
          *,
          services:service_id(name),
          payments(id, status, payment_method, refund_evidence_url)
        `)
        .eq('client_id', userId)
        .order('start_time', { ascending: true });

      if (appError) throw appError;
      console.log("Appointments fetched:", appData?.length, appData);
      setAppointments(appData || []);
    } catch (error: any) {
      toast.error("Error al cargar tus datos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileForm)
        .eq('id', session.user.id);

      if (error) throw error;
      toast.success("Perfil actualizado");
      setIsProfileModalOpen(false);
      fetchData(session.user.id);
    } catch (error: any) {
      toast.error("Error al actualizar perfil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAction = async (appointmentId: string, action: string, serviceName: string, startTime: string) => {
    console.log("handleAction called:", { appointmentId, action, serviceName, startTime });
    
    try {
      const dateStr = format(new Date(startTime), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es });
      
      if (action === "confirm") {
        const appointment = appointments.find(a => a.id === appointmentId);
        const currentNotes = appointment?.notes || "";
        const newNotes = currentNotes.includes('Asistencia confirmada') 
          ? currentNotes 
          : `${currentNotes} | Asistencia confirmada por el cliente`.trim();

        const { error } = await supabase.from('appointments').update({ 
          status: 'confirmed',
          notes: newNotes 
        }).eq('id', appointmentId);

        if (error) throw error;
        toast.success("¡Asistencia confirmada! Te esperamos.");
        await fetchData(session.user.id);
        return;
      }

      if (action === "cancel") {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (!appointment) throw new Error("Cita no encontrada");

        const hasPayment = appointment.payments && appointment.payments.length > 0 && appointment.payments[0].status === 'verified';
        const newStatus = hasPayment ? 'pending_refund' : 'cancelled';
        
        console.log("Cancelling appointment:", { appointmentId, newStatus });

        // Optimistic update
        setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: newStatus } : a));

        const { error } = await supabase.from('appointments').update({ 
          status: newStatus,
          notes: `${appointment.notes || ''} | Cancelado por el cliente. ${hasPayment ? 'Reembolso pendiente.' : ''}`.trim()
        }).eq('id', appointmentId);

        if (error) {
          // Rollback on error
          fetchData(session.user.id);
          throw error;
        }
        
        toast.success(hasPayment ? "Turno cancelado. El administrador gestionará tu reembolso." : "Turno cancelado correctamente.");
        setCancellingId(null);
        await fetchData(session.user.id);
        return;
      }

      // WhatsApp for "change" action
      const whatsappUrl = `https://wa.me/5491127485584?text=${encodeURIComponent(`Hola! Quisiera solicitar un cambio de fecha para mi turno de ${serviceName} del día ${dateStr}.`)}`;
      window.open(whatsappUrl, '_blank');
    } catch (err: any) {
      console.error("Error in handleAction:", err);
      toast.error(err.message || "Error al procesar la solicitud");
    }
  };

  const upcoming = appointments.filter(a => new Date(a.start_time) >= new Date() && !['cancelled', 'completed', 'refunded', 'pending_refund'].includes(a.status));
  const past = appointments.filter(a => new Date(a.start_time) < new Date() || ['cancelled', 'completed', 'refunded', 'pending_refund'].includes(a.status));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'pending_confirmation': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'pending_refund': return 'text-purple-500 bg-purple-500/10 border-purple-200/20';
      case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'completed': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending_confirmation': return 'Pendiente Confirmación';
      case 'pending_refund': return 'Reembolso en Trámite';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Finalizado';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container pt-32 pb-20">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold">Mis Turnos</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                {profile?.full_name || session?.user.email}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-3"
            >
              <Button onClick={() => navigate("/")} variant="outline" className="rounded-full gap-2">
                <CalendarDays className="w-4 h-4" /> Nuevo Turno
              </Button>
              <Button onClick={() => supabase.auth.signOut()} variant="ghost" className="rounded-full gap-2 text-red-500">
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </Button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Appointments */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h2>Próximos Turnos</h2>
                </div>

                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map(i => (
                        <div key={i} className="h-40 rounded-3xl bg-muted animate-pulse" />
                      ))}
                    </div>
                  ) : upcoming.length > 0 ? (
                    <div className="grid gap-4">
                      {upcoming.map((app, index) => (
                        <motion.div
                          key={app.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group relative bg-card/40 backdrop-blur-sm border border-border/50 rounded-3xl p-6 hover:bg-card/60 transition-all duration-300 shadow-xl shadow-black/5"
                        >
                          <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(app.status)}`}>
                                  {getStatusLabel(app.status)}
                                </span>
                                {app.payments?.[0]?.payment_method === 'cash' || app.notes?.includes('Pago: cash') ? (
                                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20">
                                    Pago en efectivo
                                  </span>
                                ) : app.payments?.[0]?.payment_method === 'mercadopago' || app.notes?.includes('Pago: mercadopago') ? (
                                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                    Mercado Pago - {app.payments?.[0]?.status === 'verified' ? 'Pago Verificado' : 'Pago en Revisión'}
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                    Transferencia - {app.payments?.[0]?.status === 'verified' ? 'Pago Verificado' : 'Pago en Revisión'}
                                  </span>
                                )}
                              </div>
                              
                              <div>
                                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                  {app.services?.name}
                                </h3>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    {format(new Date(app.start_time), "EEEE d 'de' MMMM", { locale: es })}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary" />
                                    {format(new Date(app.start_time), "HH:mm")} hs
                                </div>
                              </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap md:flex-col justify-end gap-2">
                              {app.status === 'pending_confirmation' && (
                                <Button 
                                  onClick={() => handleAction(app.id, "confirm", app.services?.name, app.start_time)}
                                  size="sm" 
                                  className="rounded-xl gap-2 bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> Confirmar Asistencia
                                </Button>
                              )}
                              {cancellingId === app.id ? (
                                    <div className="flex flex-col gap-2 w-full animate-in fade-in slide-in-from-top-2 duration-300">
                                      <p className="text-[10px] text-red-500 font-bold text-center uppercase tracking-wider mb-1">¿Confirmas la cancelación?</p>
                                      <div className="flex gap-2">
                                        <Button 
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleAction(app.id, "cancel", app.services?.name, app.start_time);
                                          }}
                                          className="bg-red-500 hover:bg-red-600 text-white flex-1 rounded-xl"
                                          size="sm"
                                        >
                                          Sí, cancelar
                                        </Button>
                                        <Button 
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setCancellingId(null);
                                          }}
                                          variant="outline"
                                          className="flex-1 rounded-xl"
                                          size="sm"
                                        >
                                          No
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex gap-2">
                                      {!['cancelled', 'refunded', 'completed', 'pending_refund'].includes(app.status) && (
                                        <>
                                          <Button 
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              console.log("Change button clicked for:", app.id);
                                              handleAction(app.id, "change", app.services?.name, app.start_time);
                                            }}
                                            variant="outline" 
                                            size="sm" 
                                            className="rounded-xl gap-2 flex-1"
                                          >
                                            <Clock className="w-4 h-4" /> Cambiar
                                          </Button>
                                          <Button 
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              console.log("Cancel button clicked for:", app.id);
                                              setCancellingId(app.id);
                                            }}
                                            variant="outline" 
                                            size="sm" 
                                            className="rounded-xl gap-2 flex-1 text-red-500 hover:bg-red-50 border-red-100"
                                          >
                                            <XCircle className="w-4 h-4" /> Cancelar
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border"
                    >
                      <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                      <p className="text-muted-foreground">No tienes turnos pendientes</p>
                      <Button onClick={() => navigate("/")} variant="link" className="mt-2 text-primary">
                        Reservar un turno ahora
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* History Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-semibold opacity-60">
                  <History className="w-5 h-5" />
                  <h2>Historial</h2>
                </div>

                <div className="grid gap-3 opacity-60">
                  {past.slice(0, 5).map((app) => (
                    <div key={app.id} className="bg-card/20 border border-border/40 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{app.services?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(app.start_time), "d 'de' MMM, HH:mm", { locale: es })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-bold uppercase ${getStatusColor(app.status).split(' ')[0]}`}>
                          {getStatusLabel(app.status)}
                        </span>
                        {app.payments?.[0]?.refund_evidence_url ? (
                          <a 
                            href={`${supabase.storage.from('payment-evidence').getPublicUrl(app.payments[0].refund_evidence_url).data.publicUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-primary flex items-center gap-1 hover:underline font-bold"
                          >
                            <ExternalLink className="w-3 h-3" /> Ver Comprobante
                          </a>
                        ) : app.status === 'pending_refund' && (
                          <span className="text-[9px] text-muted-foreground italic text-right leading-tight">
                            A la espera del comprobante<br/>del administrador
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {past.length === 0 && !isLoading && (
                    <p className="text-sm text-muted-foreground italic text-center py-4">No hay historial disponible</p>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Profile & Info */}
            <div className="space-y-6">
              {/* Profile Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/5 border border-primary/10 rounded-3xl p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-primary/20">
                      {profile?.full_name?.[0] || session?.user.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{profile?.full_name || "Usuario Kasim"}</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">{profile?.role || "Cliente"}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-xl text-primary" onClick={() => setIsProfileModalOpen(true)}>
                    Editar
                  </Button>
                </div>

                <div className="space-y-3 pt-4 border-t border-primary/10">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>{profile?.phone || "No registrado"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <User className="w-4 h-4 text-primary" />
                    <span>DNI: {profile?.dni || "No registrado"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="truncate">{session?.user.email}</span>
                  </div>
                </div>
              </motion.div>

              {/* Edit Profile Modal */}
              <AnimatePresence>
                {isProfileModalOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-card border border-border shadow-2xl rounded-[40px] p-8 w-full max-w-md space-y-6"
                    >
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-display font-bold">Editar Perfil</h2>
                        <Button variant="ghost" size="icon" onClick={() => setIsProfileModalOpen(false)}>
                          <X className="w-5 h-5" />
                        </Button>
                      </div>

                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Nombre Completo</label>
                          <input 
                            value={profileForm.full_name} 
                            onChange={e => setProfileForm({...profileForm, full_name: e.target.value})} 
                            className="w-full px-4 py-3 rounded-2xl bg-muted border border-border outline-none focus:ring-2 focus:ring-primary/20"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Teléfono</label>
                          <input 
                            value={profileForm.phone} 
                            onChange={e => setProfileForm({...profileForm, phone: e.target.value})} 
                            className="w-full px-4 py-3 rounded-2xl bg-muted border border-border outline-none focus:ring-2 focus:ring-primary/20"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase ml-2">DNI</label>
                          <input 
                            value={profileForm.dni} 
                            onChange={e => setProfileForm({...profileForm, dni: e.target.value})} 
                            className="w-full px-4 py-3 rounded-2xl bg-muted border border-border outline-none focus:ring-2 focus:ring-primary/20"
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isSavingProfile} className="w-full py-6 rounded-2xl font-bold shadow-lg shadow-primary/20 mt-4">
                          {isSavingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Cambios"}
                        </Button>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Help Card */}
              <div className="bg-muted/30 border border-border rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 font-bold">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <h3>¿Necesitas ayuda?</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Si necesitas realizar cambios urgentes o tienes dudas sobre tu servicio, contáctanos directamente por WhatsApp.
                </p>
                <Button variant="outline" className="w-full rounded-xl gap-2 hover:bg-primary hover:text-white transition-all group" onClick={() => window.open('https://wa.me/5491127485584', '_blank')}>
                  <MessageCircle className="w-4 h-4 group-hover:animate-bounce" /> WhatsApp Soporte
                </Button>
              </div>

              {/* Location Card */}
              <div className="bg-muted/30 border border-border rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Ubicación</span>
                </div>
                <p className="text-sm font-medium">Libertad 844, CABA, Buenos Aires</p>
                <div className="aspect-video w-full rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.016!2d-58.381!3d-34.603!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzExLjUiUyA1OMKwMjInNTIuMiJX!5e0!3m2!1sen!2sar!4v1650000000000!5m2!1sen!2sar" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default MyAppointments;
