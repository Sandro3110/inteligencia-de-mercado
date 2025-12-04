import { router, publicProcedure } from '../trpc';
import { getSupabaseClient } from '../helpers/supabase';

export const statusQualificacaoRouter = router({
  list: publicProcedure.query(async () => {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('dim_status_qualificacao')
      .select('*')
      .order('ordem', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar status de qualificação: ${error.message}`);
    }

    return data || [];
  }),
});
