import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { record, type, table } = await req.json();

    let toEmail = "";
    let emailSubject = "";
    let emailHtml = "";

    // 1. NUEVA CITA -> Correo al Cliente
    if (table === "appointments" && type === "INSERT") {
      // Buscamos el email del cliente y el nombre del servicio
      const { data: appointment } = await supabase
        .from('appointments')
        .select('*, profiles(email, full_name), services(name)')
        .eq('id', record.id)
        .single();

      if (appointment) {
        toEmail = appointment.profiles.email;
        emailSubject = "📅 ¡Tu cita en Kasim ha sido agendada!";
        emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #d4a373;">¡Hola, ${appointment.profiles.full_name}! 👋</h2>
            <p>Tu turno para <b>${appointment.services.name}</b> ha sido registrado.</p>
            <p><b>Fecha:</b> ${new Date(record.start_time).toLocaleString('es-AR')}</p>
            <p><b>Estado:</b> Pendiente de confirmación.</p>
            <p>Si elegiste transferencia, recuerda enviar tu comprobante para agilizar el proceso.</p>
            <br />
            <p>¡Te esperamos!</p>
          </div>
        `;
      }
    }

    // 2. NUEVO REGISTRO -> Correo de Bienvenida
    if (table === "profiles" && type === "INSERT") {
      toEmail = record.email;
      emailSubject = "✨ ¡Bienvenida a Kasim Cuida tu Belleza!";
      emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #d4a373;">¡Bienvenida, ${record.full_name || 'hermosa'}! ✨</h2>
          <p>Gracias por registrarte. Ya puedes empezar a agendar tus turnos online.</p>
          <br />
          <p>Equipo de Kasim.</p>
        </div>
      `;
    }

    if (toEmail && emailSubject) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Kasim App <onboarding@resend.dev>",
          to: [toEmail],
          subject: emailSubject,
          html: emailHtml,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
