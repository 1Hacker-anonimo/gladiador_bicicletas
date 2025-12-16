
// dashboard.js - Lógica do Painel Administrativo

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initVisualSettings();
    initLinksSettings();
    initIdentitySettings();
    initAdminConfig();
});

// --- TABS ---
function initTabs() {
    const mainHeaderTitle = document.getElementById('page-title');
    const menuItems = document.querySelectorAll('.menu-item[data-target]');

    // Mobile toggle could be added here

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));

            // Add active
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // Update Title
            mainHeaderTitle.textContent = item.innerText.trim();
        });
    });
}

// --- SHARED UTILS ---
function showSuccess(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.style.opacity = '1';
        setTimeout(() => { el.style.opacity = '0'; }, 3000);
    }
}

// --- VISUAL SETTINGS ---
async function initVisualSettings() {
    const form = document.getElementById('visual-form');
    const colorInput = document.getElementById('bg-color');
    const colorText = document.getElementById('bg-color-text');
    const imgInput = document.getElementById('bg-image-url');
    const preview = document.getElementById('bg-preview');

    // Sync color inputs
    colorInput.addEventListener('input', (e) => colorText.value = e.target.value);
    colorText.addEventListener('input', (e) => colorInput.value = e.target.value);

    // Preview Image Update
    imgInput.addEventListener('input', (e) => {
        if (e.target.value) {
            preview.style.backgroundImage = `url('${e.target.value}')`;
        } else {
            preview.style.backgroundImage = 'none';
        }
    });

    // Load Data
    try {
        const { data, error } = await supabase
            .from('site_config')
            .select('bg_color, bg_image')
            .single(); // Assumes only one row

        if (data) {
            if (data.bg_color) {
                colorInput.value = data.bg_color;
                colorText.value = data.bg_color;
            }
            if (data.bg_image) {
                imgInput.value = data.bg_image;
                preview.style.backgroundImage = `url('${data.bg_image}')`;
            }
        }
    } catch (err) {
        console.error('Erro ao carregar configurações visuais:', err);
    }

    // Save Data
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updates = {
            bg_color: colorInput.value,
            bg_image: imgInput.value,
            updated_at: new Date()
        };

        const { error } = await supabase
            .from('site_config')
            .update(updates)
            .eq('id', 1); // Always update row 1

        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            showSuccess('visual-msg');
        }
    });
}

// --- LINKS SETTINGS ---
async function initLinksSettings() {
    const listContainer = document.getElementById('links-list');
    const form = document.getElementById('links-form');

    // Load Links
    async function loadLinks() {
        const { data, error } = await supabase
            .from('links')
            .select('*')
            .order('id', { ascending: true }); // Simple ordering

        if (error) {
            listContainer.innerHTML = '<p class="error">Erro ao carregar links.</p>';
            return;
        }

        if (!data || data.length === 0) {
            listContainer.innerHTML = '<p>Nenhum link encontrado. Crie os links no banco de dados primeiro.</p>';
            return;
        }

        renderLinks(data);
    }

    function renderLinks(links) {
        listContainer.innerHTML = '';
        links.forEach(link => {
            const item = document.createElement('div');
            item.className = 'link-item';
            item.innerHTML = `
                <div style="flex: 1;">
                    <label style="font-size: 0.8rem; margin-bottom: 4px; display:block;">${link.label} (${link.icon_class})</label>
                    <input type="text" name="url_${link.id}" value="${link.url || ''}" placeholder="https://..." data-id="${link.id}">
                </div>
                <div style="width: 100px; text-align: center;">
                    <label style="font-size: 0.8rem; margin-bottom: 4px; display:block;">Ativo?</label>
                    <input type="checkbox" name="active_${link.id}" ${link.is_active ? 'checked' : ''} style="width: 20px; height: 20px;">
                </div>
            `;
            listContainer.appendChild(item);
        });
    }

    // Save Links
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputs = listContainer.querySelectorAll('input[type="text"]');
        const checkboxes = listContainer.querySelectorAll('input[type="checkbox"]');

        let updates = [];

        inputs.forEach(input => {
            const id = input.getAttribute('data-id');
            // Find corresponding checkbox
            const active = listContainer.querySelector(`input[name="active_${id}"]`).checked;

            updates.push({
                id: parseInt(id),
                url: input.value,
                is_active: active
            });
        });

        // Upsert/Update items
        const { error } = await supabase
            .from('links')
            .upsert(updates);

        if (error) {
            alert('Erro ao salvar links: ' + error.message);
        } else {
            showSuccess('links-msg');
        }
    });

    loadLinks();
}

// --- IDENTITY SETTINGS ---
async function initIdentitySettings() {
    const form = document.getElementById('identity-form');
    const logoInput = document.getElementById('logo-url');
    const logoPreview = document.getElementById('logo-preview');
    const nameInput = document.getElementById('brand-name');
    const descInput = document.getElementById('brand-desc');

    // Preview Logo
    logoInput.addEventListener('input', (e) => {
        if (e.target.value) {
            logoPreview.src = e.target.value;
        } else {
            logoPreview.src = '';
        }
    });

    // Load Data
    try {
        const { data, error } = await supabase
            .from('site_config')
            .select('brand_name, brand_desc, profile_image_url')
            .single();

        if (data) {
            if (data.brand_name) nameInput.value = data.brand_name;
            if (data.brand_desc) descInput.value = data.brand_desc;
            if (data.profile_image_url) {
                logoInput.value = data.profile_image_url;
                logoPreview.src = data.profile_image_url;
            }
        }
    } catch (err) { }

    // Save Data
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updates = {
            brand_name: nameInput.value,
            brand_desc: descInput.value,
            profile_image_url: logoInput.value,
            updated_at: new Date()
        };

        const { error } = await supabase
            .from('site_config')
            .update(updates)
            .eq('id', 1);

        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            showSuccess('identity-msg');
        }
    });
}

// --- ADMIN CONFIG (LOCALSTORAGE) ---
function initAdminConfig() {
    const sidebarColor = document.getElementById('admin-sidebar-color');
    const accentColor = document.getElementById('admin-accent-color');
    const form = document.getElementById('admin-config-form');
    const resetBtn = document.getElementById('reset-theme');

    // Load from LocalStorage
    const savedTheme = JSON.parse(localStorage.getItem('admin_theme'));
    if (savedTheme) {
        document.documentElement.style.setProperty('--admin-sidebar-bg', savedTheme.sidebar);
        document.documentElement.style.setProperty('--admin-accent', savedTheme.accent);
        sidebarColor.value = savedTheme.sidebar;
        accentColor.value = savedTheme.accent;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const theme = {
            sidebar: sidebarColor.value,
            accent: accentColor.value
        };

        document.documentElement.style.setProperty('--admin-sidebar-bg', theme.sidebar);
        document.documentElement.style.setProperty('--admin-accent', theme.accent);

        localStorage.setItem('admin_theme', JSON.stringify(theme));
        alert('Tema atualizado!');
    });

    resetBtn.addEventListener('click', () => {
        localStorage.removeItem('admin_theme');
        location.reload();
    });
}
