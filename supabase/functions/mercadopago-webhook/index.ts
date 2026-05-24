import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const body = await req.json();
    console.log("Mercado Pago Webhook received:", body);

    // Mercado Pago envía notificaciones de diferentes tipos. Buscamos 'payment'
    if (body.type === "payment" || body.action === "payment.created") {
      const paymentId = body.data?.id || body.resource?.split('/').pop();
      
      // Aquí podrías validar contra la API de Mercado Pago usando tu ACCESS_TOKEN
      // Por ahora, si recibimos el aviso, buscamos la cita pendiente y la confirmamos
      // Nota: Para una integración perfecta, el link de pago debe llevar el ID de la cita en 'external_reference'
      
      const externalReference = body.external_reference; // Suponiendo que lo pasamos en el link

      if (externalReference) {
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'confirmed', payment_status: 'paid' })
          .eq('id', externalReference);
          
        if (error) console.error("Error updating appointment:", error);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
});
