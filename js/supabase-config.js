
// Configuração do Supabase
// Substitua URL_DO_SEU_PROJETO e CHAVE_ANONIMA pelos dados do seu projeto no Supabase
const SUPABASE_URL = 'INSERT_YOUR_SUPABASE_URL_HERE';
const SUPABASE_KEY = 'INSERT_YOUR_SUPABASE_ANON_KEY_HERE';

// Inicializa o cliente Supabase se a biblioteca estiver carregada
let supabase;

if (typeof createClient !== 'undefined') {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error('Biblioteca do Supabase não carregada. Certifique-se de incluir o script do CDN.');
}

// Exporta para uso em módulos se necessário, ou mantém global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase };
}
