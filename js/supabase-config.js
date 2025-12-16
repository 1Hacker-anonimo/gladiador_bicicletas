
// Configuração do Supabase
// Substitua URL_DO_SEU_PROJETO e CHAVE_ANONIMA pelos dados do seu projeto no Supabase
const SUPABASE_URL = 'https://vfgsvfjzmqomkoiuivqg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZ3N2Zmp6bXFvbWtvaXVpdnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MTQ4NzIsImV4cCI6MjA4MTQ5MDg3Mn0.4UKa9Fzn-_3ofOZ1rrXJRNy0gJN8NuL_P0EwYHB2r70';

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
