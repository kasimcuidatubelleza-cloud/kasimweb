import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2 } from "lucide-react";

const Login = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (!user) throw new Error("No se pudo obtener el usuario");

        // Verificar el rol del usuario para redireccionar
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .maybeSingle();

        toast.success(`¡Bienvenida, ${profile?.full_name || 'Kasim'}!`);
        
        if (profile?.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/mis-turnos");
        }
      } else {
        const { data: { user }, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, dni, phone, email }
          }
        });
        
        if (error) throw error;
        if (!user) throw new Error("Error al registrarse");
        
        // El signUp crea el perfil automáticamente o nosotros lo insertamos?
        // En BookingModal lo insertamos nosotros si no existe
        const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: user.id,
            full_name: name,
            phone: phone,
            dni: dni,
            role: 'client'
          });
        }
        
        toast.success("Cuenta creada exitosamente. Iniciando sesión...");
        navigate("/mis-turnos");
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(authMode === 'login' 
        ? "Error al iniciar sesión: " + (err.message === "Invalid login credentials" ? "Credenciales inválidas" : err.message)
        : "Error al registrarse: " + err.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    let emailToUse = email;
    
    if (!emailToUse) {
      const inputEmail = window.prompt("Ingresa tu correo electrónico para recibir el enlace de recuperación:");
      if (!inputEmail) return;
      emailToUse = inputEmail;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(emailToUse, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) toast.error(error.message);
    else toast.success(`Se ha enviado un enlace de recuperación a: ${emailToUse}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-background rounded-3xl shadow-2xl border border-border p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl brand-name uppercase tracking-widest text-primary">KASIM</h1>
          <p className="text-muted-foreground mt-2">{authMode === 'login' ? 'Iniciá sesión para gestionar tus turnos.' : 'Crea tu cuenta para agendar turnos'}</p>
        </div>

        <div className="flex bg-muted p-1.5 rounded-2xl mb-6">
          <button type="button" onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${authMode === 'login' ? 'bg-background shadow-lg text-primary' : 'text-muted-foreground'}`}>Entrar</button>
          <button type="button" onClick={() => setAuthMode('register')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${authMode === 'register' ? 'bg-background shadow-lg text-primary' : 'text-muted-foreground'}`}>Registrarse</button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'register' && (
            <>
              <div className="space-y-2">
                <input placeholder="Nombre Completo" value={name} onChange={e => setName(e.target.value)} required className="w-full p-4 rounded-2xl bg-muted border border-border outline-none focus:ring-2 focus:ring-primary/40 text-sm transition-all" />
              </div>
              <div className="space-y-2">
                <input placeholder="DNI" value={dni} onChange={e => setDni(e.target.value)} required className="w-full p-4 rounded-2xl bg-muted border border-border outline-none focus:ring-2 focus:ring-primary/40 text-sm transition-all" />
              </div>
              <div className="space-y-2">
                <input placeholder="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full p-4 rounded-2xl bg-muted border border-border outline-none focus:ring-2 focus:ring-primary/40 text-sm transition-all" />
              </div>
            </>
          )}

          <div className="space-y-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-2xl bg-muted border border-border outline-none focus:ring-2 focus:ring-primary/40 text-sm transition-all"
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-2">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-2xl bg-muted border border-border outline-none focus:ring-2 focus:ring-primary/40 text-sm transition-all"
              placeholder="Contraseña (Mín. 6 caracteres)"
            />
          </div>

          {authMode === 'login' && (
            <div className="flex justify-end pt-2">
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="text-xs text-primary hover:underline font-bold"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-7 rounded-[24px] text-lg font-bold gap-2 mt-4 shadow-xl shadow-primary/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (authMode === 'login' ? "Iniciar Sesión" : "Crear Cuenta")}
          </Button>
        </form>

      </motion.div>
    </div>
  );
};

export default Login;
