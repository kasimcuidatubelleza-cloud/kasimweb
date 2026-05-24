import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MapPin, Phone, User, LogOut, CalendarDays, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

const allNavLinks = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Contacto", href: "/#contacto" },
  { label: "בכבוד וצניעות", href: "/mikve" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isMikve = location.pathname === '/mikve';
  const navLinks = isMikve ? [{ label: "בכבוד וצניעות", href: "/mikve" }] : allNavLinks;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center">
            <img src="/logo.jpeg" alt="Kasim Cuida tu Belleza" className="h-10 md:h-12 object-contain" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            
            {session ? (
              <div className="flex items-center gap-4 border-l border-border pl-8">
                <Link to="/mis-turnos" className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-all">
                  <CalendarDays className="w-4 h-4" />
                  Mis Turnos
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1.5 rounded-full bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-primary/20">
                      {profile?.full_name?.[0] || session.user.email?.[0].toUpperCase()}
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-background border border-border shadow-2xl rounded-2xl p-2 min-w-[200px]">
                      <div className="px-4 py-3 border-b border-border mb-1">
                        <p className="text-xs font-bold text-primary uppercase tracking-tighter">Sesión iniciada</p>
                        <p className="text-sm font-medium truncate">{profile?.full_name || session.user.email}</p>
                      </div>
                      <button onClick={() => navigate("/mis-turnos")} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                        <User className="w-4 h-4" /> Perfil
                      </button>
                      <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Button onClick={() => navigate("/login")} variant="outline" className="rounded-full px-6">
                Iniciar Sesión
              </Button>
            )}
          </nav>

          {/* Mobile menu btn */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl bg-muted"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border shadow-2xl"
          >
            <nav className="container py-6 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 px-4 rounded-xl text-lg font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 space-y-3">
                {session ? (
                  <>
                    <Button onClick={() => { navigate("/mis-turnos"); setIsOpen(false); }} className="w-full py-6 rounded-2xl gap-2">
                      <CalendarDays className="w-5 h-5" /> Mis Turnos
                    </Button>
                    <Button onClick={handleSignOut} variant="ghost" className="w-full py-6 rounded-2xl text-red-500 gap-2">
                      <LogOut className="w-5 h-5" /> Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => { navigate("/login"); setIsOpen(false); }} className="w-full py-6 rounded-2xl">
                    Iniciar Sesión
                  </Button>
                )}
                
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground px-4">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>Libertad 844, CABA</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground px-4">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>(+54) 11-2748-5584</span>
                  </div>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
