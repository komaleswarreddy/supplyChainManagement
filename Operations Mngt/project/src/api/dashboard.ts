import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabase';
import { DashboardData } from '@/hooks/useDashboardData';

interface DashboardParams {
  startDate: string;
  endDate: string;
}

// Function to fetch dashboard data from Supabase
export const fetchDashboardData = async (params: DashboardParams): Promise<DashboardData | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    // First try to fetch from the dashboard-metrics edge function
    const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke(
      'dashboard-metrics',
      {
        method: 'GET',
        params: {
          startDate: params.startDate,
          endDate: params.endDate
        }
      }
    );

    if (!edgeFunctionError && edgeFunctionData) {
      // Transform the data from the edge function to match our DashboardData interface
      // This would be implemented based on the actual response structure
      return null; // Placeholder - would return transformed data
    }

    // If edge function fails or isn't available, fall back to direct queries
    // Fetch dashboard metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (metricsError) {
      console.error('Error fetching dashboard metrics:', metricsError);
      return null;
    }

    // Fetch recent activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('dashboard_activities')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (activitiesError) {
      console.error('Error fetching dashboard activities:', activitiesError);
      return null;
    }

    // Fetch alerts
    const { data: alertsData, error: alertsError } = await supabase
      .from('dashboard_alerts')
      .select('*')
      .eq('is_active', true)
      .order('timestamp', { ascending: false });

    if (alertsError) {
      console.error('Error fetching dashboard alerts:', alertsError);
      return null;
    }

    // Transform the data to match our DashboardData interface
    // This would be implemented based on your actual database schema
    return null; // Placeholder - would return transformed data
  } catch (error) {
    console.error('Error in dashboard data fetch:', error);
    return null;
  }
};