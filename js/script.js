
document.addEventListener('DOMContentLoaded', async () => {
    console.log('O Valdim Bicicletaria - Inicializando...');

    // Se o supabase não estiver definido (erro no config ou script não carregou)
    if (typeof supabase === 'undefined') {
        console.error('Supabase não inicializado. Verifique js/supabase-config.js');
        document.querySelector('.links-nav').innerHTML = '<p style="color:white; text-align:center;">Erro ao carregar sistema.</p>';
        return;
    }

    try {
        await loadSiteIdentity();
        await loadLinks();
    } catch (error) {
        console.error("Erro fatal:", error);
    }
});

async function loadSiteIdentity() {
    const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .single();

    if (error) {
        console.warn('Usando valores padrão (Config não encontrada ou erro):', error);
        // Fallback or leave basic HTML
        document.getElementById('site-brand-name').textContent = 'O Valdim Bicicletaria';
        document.getElementById('site-brand-desc').textContent = 'Seu próximo pedal começa aqui.';
        return;
    }

    if (data) {
        // Textos
        if (data.brand_name) {
            document.getElementById('site-brand-name').textContent = data.brand_name;
            document.getElementById('footer-year-name').textContent = data.brand_name;
            document.title = data.brand_name;
        }
        if (data.brand_desc) document.getElementById('site-brand-desc').textContent = data.brand_desc;

        // Logo
        if (data.profile_image_url) {
            document.getElementById('site-logo').src = data.profile_image_url;
        }

        // Background
        const bgEl = document.getElementById('site-bg-image');
        if (data.bg_image) {
            bgEl.style.backgroundImage = `url('${data.bg_image}')`;
        }
        if (data.bg_color) {
            // Se imagem falhar ou não tiver, usa cor.
            // Mas bg-image tem prioridade no CSS se definido.
            // Podemos colocar no backgroundColor do container pai ou overlay
            bgEl.style.backgroundColor = data.bg_color;
        }
    }
}

async function loadLinks() {
    const navContainer = document.getElementById('site-links-nav');

    const { data: links, error } = await supabase
        .from('links')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true }); // Pode usar uma coluna 'order_index' se criar

    if (error) {
        console.error('Erro ao buscar links:', error);
        navContainer.innerHTML = '<p style="color:white; text-align:center;">Não foi possível carregar os contatos.</p>';
        return;
    }

    if (!links || links.length === 0) {
        navContainer.innerHTML = '<p style="color:white; text-align:center;">Nenhum link disponível no momento.</p>';
        return;
    }

    // Limpa container
    navContainer.innerHTML = '';

    // Renderiza links
    links.forEach(link => {
        // Determina a classe do botão (ex: primary se for Contato/WhatsApp?)
        // Logica simples: se tiver class 'btn-primary' no DB ou se for o primeiro
        // O user pode não ter coluna 'type', vamos assumir 'btn-secondary' padrão, 
        // ou adicionar lógica baseada no link (WhatsApp = primary).

        let btnClass = 'btn-secondary';
        if (link.url.includes('wa.me') || link.url.includes('whatsapp')) {
            btnClass = 'btn-primary';
        }

        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.className = `btn ${btnClass}`;
        a.setAttribute('aria-label', link.label);

        a.innerHTML = `
            <i class="${link.icon_class || 'fas fa-link'}"></i>
            <span>${link.label}</span>
        `;

        navContainer.appendChild(a);
    });

    // Inicia animação
    startButtonAnimation();
}

function startButtonAnimation() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach((btn, index) => {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(10px)';
        btn.style.transition = 'all 0.4s ease';

        setTimeout(() => {
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
        }, 300 + (index * 100));
    });

    // Efeito de clique
    buttons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'translateY(0)';
            }, 100);
        });
    });
}
