// auth.js — Auth guard para InOut Repair Center
// IMPORTANTE: NO declara supabase. El HTML que carga este archivo debe
// declarar supabase ANTES de cargar auth.js

(async function checkAuth() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      window.location.href = 'index.html';
      return;
    }

    const userId = localStorage.getItem('irc_user_id');
    if (!userId) {
      await supabase.auth.signOut();
      window.location.href = 'index.html';
      return;
    }

    const { data: empleado, error } = await supabase
      .from('empleados')
      .select('irc_rol, role')
      .eq('id', userId)
      .maybeSingle();

    if (error || !empleado) {
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = 'index.html';
      return;
    }

    if (!empleado.irc_rol && empleado.role !== 'superadmin') {
      await supabase.auth.signOut();
      localStorage.clear();
      alert('Tu acceso al sistema IRC ha sido revocado');
      window.location.href = 'index.html';
      return;
    }
  } catch (err) {
    console.error('Auth error:', err);
    window.location.href = 'index.html';
  }
})();

async function logout() {
  if (confirm('¿Cerrar sesión?')) {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = 'index.html';
  }
}

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    localStorage.clear();
    window.location.href = 'index.html';
  }
});
