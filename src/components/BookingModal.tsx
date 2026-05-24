import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Send, Loader2, LogIn, UserPlus, CreditCard, Banknote, Upload, ArrowRight, Percent, ExternalLink, User, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Service, supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

interface BookingModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ service, isOpen, onClose }: BookingModalProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null); 
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'mercadopago'>('cash');
  const [paymentType, setPaymentType] = useState<'full' | 'deposit'>('full');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState<'datetime' | 'payment'>('datetime');
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
    });

    fetchBusinessHours();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (service) {
      setPaymentType('full');
    }
  }, [service]);

  const fetchBusinessHours = async () => {
    const { data } = await supabase.from('business_hours').select('*');
    if (data) setBusinessHours(data);
    const { data: bankData } = await supabase.from('bank_accounts').select('*').eq('is_active', true);
    if (bankData) setBankAccounts(bankData);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data) {
      setName(data.full_name || "");
      setDni(data.dni || "");
      setPhone(data.phone || "");
    }
  };

  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);

  useEffect(() => {
    if (selectedDate) fetchOccupiedSlots();
  }, [selectedDate]);

  const fetchOccupiedSlots = async () => {
    const startOfDay = new Date(selectedDate + 'T00:00:00').toISOString();
    const endOfDay = new Date(selectedDate + 'T23:59:59').toISOString();

    const { data } = await supabase
      .from('appointments')
      .select('start_time')
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay)
      .not('status', 'in', '("cancelled", "refunded", "pending_refund")');

    if (data) {
      const times = data.map(app => format(new Date(app.start_time), 'HH:mm'));
      setOccupiedSlots(times);
    }
  };

  // Generar Horarios Dinámicos
  const availableSlots = useMemo(() => {
    if (!selectedDate || businessHours.length === 0) return [];
    
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 (Dom) a 6 (Sab)
    
    const dayConfig = businessHours.find(h => h.day_of_week === dayOfWeek);
    
    if (!dayConfig || dayConfig.is_closed) return [];

    const slots = [];
    let current = parseInt(dayConfig.start_time.split(':')[0]);
    const end = parseInt(dayConfig.end_time.split(':')[0]);

    for (let i = current; i < end; i++) {
      const time = `${i.toString().padStart(2, '0')}:00`;
      if (!occupiedSlots.includes(time)) {
        slots.push(time);
      }
    }
    return slots;
  }, [selectedDate, businessHours, occupiedSlots]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("¡Bienvenida!");
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { full_name: name, dni, phone, email } }
        });
        if (error) throw error;
        toast.success("Cuenta creada.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    let emailToUse = email;
    if (!emailToUse) {
      const inputEmail = window.prompt("Email:");
      if (!inputEmail) return;
      emailToUse = inputEmail;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(emailToUse, { redirectTo: `${window.location.origin}/login` });
    if (error) toast.error(error.message);
    else toast.success("Enlace enviado.");
  };

  const handleBooking = async () => {
    if (!service || !selectedDate || !selectedTime || !session) return;
    setIsLoading(true);
    try {
      // Aseguramos que el perfil existe en la tabla profiles para evitar error de FK
      const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', session.user.id).maybeSingle();
      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: session.user.id,
          full_name: name || session.user.user_metadata?.full_name || session.user.email,
          phone: phone || session.user.user_metadata?.phone,
          dni: dni || session.user.user_metadata?.dni,
          role: 'client'
        });
      }

      const startTime = new Date(`${selectedDate}T${selectedTime}:00`);
      
      if (paymentMethod !== 'cash' && !evidenceFile) {
        throw new Error("Por favor, sube el comprobante de pago para continuar.");
      }

      let evidenceUrl = null;
      if (evidenceFile) {
        const fileName = `${Date.now()}-${evidenceFile.name}`;
        await supabase.storage.from('payment-evidence').upload(fileName, evidenceFile);
        evidenceUrl = fileName;
      }

      const notesDetails = paymentType === 'full' 
        ? `Pago: ${paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'Transferencia'} (Total Completo - $${service.price})`
        : `Pago: ${paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'Transferencia'} (Seña de $${service.deposit_amount}). Debe: $${service.price - service.deposit_amount}`;

      const { data: appointment, error: appError } = await supabase.from('appointments').insert({
        client_id: session.user.id,
        service_id: service.id,
        start_time: startTime.toISOString(),
        status: 'pending_confirmation',
        notes: notesDetails
      }).select().single();
      if (appError) throw appError;

      const amountToPay = paymentType === 'full' ? service.price : service.deposit_amount;
      await supabase.from('payments').insert({
        appointment_id: appointment.id,
        amount: amountToPay,
        payment_method: paymentMethod,
        status: paymentMethod === 'cash' ? 'verified' : 'pending_verification',
        evidence_url: evidenceUrl
      });

      toast.success("¡Turno reservado con éxito!");
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="bg-background w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl border border-border"
          >
            <div className="relative p-8 border-b border-border bg-muted/30 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-display font-bold text-primary">Agendar Turno</h2>
                <p className="text-xs text-muted-foreground">{service?.name}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {!session ? (
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="flex bg-muted p-1.5 rounded-2xl">
                    <button type="button" onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${authMode === 'login' ? 'bg-background shadow-lg text-primary' : 'text-muted-foreground'}`}>Entrar</button>
                    <button type="button" onClick={() => setAuthMode('register')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${authMode === 'register' ? 'bg-background shadow-lg text-primary' : 'text-muted-foreground'}`}>Registrarse</button>
                  </div>
                  {authMode === 'register' && (
                    <div className="space-y-3">
                      <input placeholder="Nombre Completo" value={name} onChange={e => setName(e.target.value)} required className="w-full p-4 rounded-2xl bg-muted/50 border border-border outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                      <input placeholder="DNI" value={dni} onChange={e => setDni(e.target.value)} required className="w-full p-4 rounded-2xl bg-muted/50 border border-border outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                      <input placeholder="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full p-4 rounded-2xl bg-muted/50 border border-border outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                  )}
                  <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-4 rounded-2xl bg-muted/50 border border-border outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                  <div className="space-y-2">
                    <input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-4 rounded-2xl bg-muted/50 border border-border outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    {authMode === 'login' && <button type="button" onClick={handleForgotPassword} className="text-xs text-primary hover:underline font-bold float-right">¿Olvidaste tu contraseña?</button>}
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full py-7 rounded-[24px] text-lg font-bold shadow-xl mt-4">
                    {isLoading ? <Loader2 className="animate-spin" /> : (authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta')}
                  </Button>
                </form>
              ) : (
                <div className="space-y-8">
                  <div className="bg-primary/5 p-4 rounded-3xl flex justify-between items-center border border-primary/10">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-primary" />
                      <span className="font-bold text-xs truncate max-w-[150px]">{name || session.user.email}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()} className="text-red-400">Salir</Button>
                  </div>

                  {bookingStep === 'datetime' ? (
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fecha</label>
                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={today} className="w-full p-5 rounded-3xl bg-muted/50 border border-border text-lg font-medium outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Horarios Disponibles</label>
                        {availableSlots.length > 0 ? (
                          <div className="grid grid-cols-4 gap-3">
                            {availableSlots.map(t => (
                              <button key={t} onClick={() => setSelectedTime(t)} className={`py-4 rounded-2xl text-sm font-bold border transition-all ${selectedTime === t ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-muted/30 border-transparent hover:bg-muted'}`}>{t}</button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 bg-muted/30 rounded-[32px] text-center space-y-2 border border-dashed border-border">
                            <AlertCircle className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                            <p className="text-sm text-muted-foreground font-medium">No hay turnos para este día.</p>
                          </div>
                        )}
                      </div>
                      
                      <Button onClick={() => setBookingStep('payment')} disabled={!selectedDate || !selectedTime} className="w-full py-8 rounded-[32px] text-lg font-bold gap-3 shadow-2xl">Siguiente Paso <ArrowRight className="w-5 h-5" /></Button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Selección de Tipo de Pago (Seña vs Completo) */}
                      {service && service.deposit_amount > 0 && service.deposit_amount < service.price && (
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Modalidad de Reserva</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setPaymentType('deposit')}
                              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                                paymentType === 'deposit' 
                                  ? 'border-primary bg-primary/5 shadow-lg scale-105' 
                                  : 'border-border grayscale'
                              }`}
                            >
                              <span className={`text-sm font-bold ${paymentType === 'deposit' ? 'text-primary' : 'text-muted-foreground'}`}>Pagar Seña</span>
                              <span className="text-xs text-muted-foreground">${service.deposit_amount}</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => setPaymentType('full')}
                              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                                paymentType === 'full' 
                                  ? 'border-primary bg-primary/5 shadow-lg scale-105' 
                                  : 'border-border grayscale'
                              }`}
                            >
                              <span className={`text-sm font-bold ${paymentType === 'full' ? 'text-primary' : 'text-muted-foreground'}`}>Pago Completo</span>
                              <span className="text-xs text-muted-foreground">${service.price}</span>
                            </button>
                          </div>
                          
                          {/* Info de saldo pendiente */}
                          {paymentType === 'deposit' ? (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 p-4 rounded-2xl font-medium mt-2">
                              Abonarás <strong>${service.deposit_amount}</strong> hoy para reservar tu turno. El saldo restante de <strong>${service.price - service.deposit_amount}</strong> lo pagarás en el salón el día de tu cita.
                            </p>
                          ) : (
                            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl font-medium mt-2">
                              Abonarás el total de <strong>${service.price}</strong> hoy. No tendrás saldos pendientes de pago el día de tu cita.
                            </p>
                          )}
                        </div>
                      )}

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Método de Pago</label>
                        <div className="grid grid-cols-3 gap-3">
                          <PaymentBtn active={paymentMethod === 'cash'} icon={<Banknote />} label="Efectivo" onClick={() => setPaymentMethod('cash')} />
                          <PaymentBtn active={paymentMethod === 'transfer'} icon={<CreditCard />} label="Transf." onClick={() => setPaymentMethod('transfer')} />
                          <PaymentBtn active={paymentMethod === 'mercadopago'} icon={<ImageIcon className="w-5 h-5" />} label="MP" onClick={() => setPaymentMethod('mercadopago')} />
                        </div>
                      </div>
                      
                      {paymentMethod !== 'cash' && (
                        <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/20 space-y-4">
                          {paymentMethod === 'transfer' && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Datos de la Cuenta</p>
                              <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto pr-2">
                                {bankAccounts.length === 0 && <p className="text-xs text-muted-foreground">No hay cuentas disponibles.</p>}
                                {bankAccounts.map(account => (
                                  <div key={account.id} className="bg-background/50 p-4 rounded-2xl border border-border">
                                    <p className="text-xs font-bold text-primary mb-1">{account.bank_name}</p>
                                    <p className="text-xs font-medium">Titular: <span className="font-bold">{account.account_name}</span></p>
                                    <p className="text-xs font-medium">CBU/CVU: <span className="font-bold select-all">{account.cbu}</span></p>
                                    {account.alias && <p className="text-xs font-medium">Alias: <span className="font-bold select-all">{account.alias}</span></p>}
                                    {account.cuit_cuil && <p className="text-xs font-medium">CUIT/CUIL: <span className="font-bold select-all">{account.cuit_cuil}</span></p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Subir Comprobante</p>
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/30 rounded-[24px] cursor-pointer hover:bg-primary/5 transition-colors">
                              <Upload className="w-6 h-6 text-primary mb-2" />
                              <span className="text-xs font-bold text-muted-foreground">{evidenceFile ? evidenceFile.name : 'Click para subir imagen'}</span>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={e => setEvidenceFile(e.target.files?.[0] || null)} 
                              />
                            </label>
                          </div>
                          
                          {paymentMethod === 'mercadopago' && service?.mercadopago_link && (
                            <Button onClick={() => window.open(service.mercadopago_link!, '_blank')} className="w-full py-6 rounded-2xl bg-[#009EE3] text-white font-bold gap-2">Pagar con Mercado Pago <ExternalLink className="w-4 h-4" /></Button>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => setBookingStep('datetime')} className="px-6 py-8 rounded-[32px] border">Atrás</Button>
                        <Button onClick={handleBooking} disabled={isLoading} className="flex-1 py-8 rounded-[32px] text-lg font-bold shadow-2xl">Confirmar Turno</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PaymentBtn = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`p-5 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${active ? 'border-primary bg-primary/5 scale-105 shadow-lg' : 'border-border grayscale'}`}>
    <div className={active ? 'text-primary' : 'text-muted-foreground'}>{icon}</div>
    <span className={`text-[10px] font-bold uppercase ${active ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
  </button>
);

export default BookingModal;
