// Follow Deno's ES module conventions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      // Supabase API URL - env var exposed by default when deployed to Supabase
      Deno.env.get("SUPABASE_URL") ?? "",
      // Supabase API ANON KEY - env var exposed by default when deployed to Supabase
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      // Create client with Auth context of the user that called the function
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the current authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse the request URL to get query parameters
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate") || 
      new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
    const endDate = url.searchParams.get("endDate") || new Date().toISOString();

    // Fetch dashboard metrics
    const { data: metricsData, error: metricsError } = await supabaseClient
      .from("dashboard_metrics")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1);

    if (metricsError) {
      console.error("Error fetching metrics:", metricsError);
      throw metricsError;
    }

    // Fetch recent activities
    const { data: activitiesData, error: activitiesError } = await supabaseClient
      .from("dashboard_activities")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(10);

    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError);
      throw activitiesError;
    }

    // Fetch active alerts
    const { data: alertsData, error: alertsError } = await supabaseClient
      .from("dashboard_alerts")
      .select("*")
      .eq("is_active", true)
      .order("timestamp", { ascending: false });

    if (alertsError) {
      console.error("Error fetching alerts:", alertsError);
      throw alertsError;
    }

    // Fetch procurement data
    const { data: requisitionsData, error: requisitionsError } = await supabaseClient
      .from("requisitions")
      .select("id, status, created_at, total_amount")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (requisitionsError) {
      console.error("Error fetching requisitions:", requisitionsError);
      throw requisitionsError;
    }

    // Fetch purchase orders data
    const { data: purchaseOrdersData, error: purchaseOrdersError } = await supabaseClient
      .from("purchase_orders")
      .select("id, status, created_at, total_amount")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (purchaseOrdersError) {
      console.error("Error fetching purchase orders:", purchaseOrdersError);
      throw purchaseOrdersError;
    }

    // Process and aggregate the data
    // This is a simplified example - in a real application, you would perform more complex aggregations
    const dashboardData = {
      metrics: metricsData?.[0] || null,
      activities: activitiesData || [],
      alerts: alertsData || [],
      procurement: {
        requisitions: requisitionsData || [],
        purchaseOrders: purchaseOrdersData || []
      }
    };

    // Return the dashboard data
    return new Response(
      JSON.stringify(dashboardData),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});