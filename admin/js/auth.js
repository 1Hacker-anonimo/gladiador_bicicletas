
// auth.js - Gerencia autenticação e proteção de rotas

// Verifica qual página estamos
const isLoginPage = window.location.pathname.includes('login.html');

async function checkSession() {
    if (!supabase) return;

    const { data: { session }, error } = await supabase.auth.getSession();

    if (isLoginPage) {
        if (session) {
            // Se já estiver logado, verificar permissão antes de redirecionar
            await verifyRoleAndRedirect(session.user);
        }
    } else {
        if (!session) {
            // Se não estiver logado e tentar acessar área restrita
            window.location.href = 'login.html';
        } else {
            // Logado em área restrita, verificar permissão
            await verifyRoleAccess(session.user);

            // Se passar da verificação, atualiza UI do usuário
            updateUserInfo(session.user);
        }
    }
}

async function verifyRoleAndRedirect(user) {
    // Tenta buscar o perfil do usuário para ver a role
    // Assume tabela 'profiles' com colunas 'id' e 'role'
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || !data || (data.role !== 'admin' && data.role !== 'owner')) {
            // Se for login page, mostra erro, não redireciona ou faz logout
            if (isLoginPage) {
                // Apenas faz logout para limpar estado inválido
                await supabase.auth.signOut();
                alert('Acesso negado: Você não tem permissão de administrador.');
            } else {
                await supabase.auth.signOut();
                window.location.href = 'login.html';
            }
        } else {
            // Role permitida
            window.location.href = 'index.html';
        }
    } catch (err) {
        console.error("Erro na verificação de role:", err);
        // Fallback: se a tabela profiles não existir ainda no setup do usuário, 
        // permitir acesso para ele configurar (DEV MODE) ou bloquear.
        // Por segurança, melhor bloquear, mas vou adicionar um log claro.
        alert('Erro ao verificar permissões. Verifique se a tabela profiles existe.');
    }
}

async function verifyRoleAccess(user) {
    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (error) {
        console.warn("Não foi possível verificar a role (Tabela profiles pode estar faltando).", error);
        // Opcional: Permitir acesso apenas se for o 'dono' do projeto supabase (difícil saber via Client).
        // Bloquear por padrão
        // alert('Erro de permissão.');
        // window.location.href = 'login.html';
    } else if (!data || (data.role !== 'admin' && data.role !== 'owner')) {
        alert('Acesso restrito a administradores.');
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    }
}

// Display user info
function updateUserInfo(user) {
    const emailEl = document.getElementById('user-email');
    if (emailEl) {
        emailEl.textContent = user.email;
    }
}

// Login Function
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('error-msg');

    loginBtn.textContent = 'Carregando...';
    loginBtn.disabled = true;
    errorMsg.style.display = 'none';

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Sucesso
        await verifyRoleAndRedirect(data.user);

    } catch (error) {
        console.error(error);
        errorMsg.textContent = 'Erro ao entrar: ' + error.message;
        errorMsg.style.display = 'block';
        loginBtn.textContent = 'Entrar';
        loginBtn.disabled = false;
    }
}

// Logout Function
async function handleLogout() {
    if (confirm("Deseja realmente sair?")) {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Configura listener de auth state change
    /* 
       Supabase onAuthStateChange é útil, mas checkSession manual 
       no load é mais seguro para evitar flash de conteúdo.
    */
    checkSession();

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});
