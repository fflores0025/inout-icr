// auth.js — Auth guard para InOut Repair Center
// Asume que supabase ya está declarado en el HTML que incluye este script

(async function checkAuth() {
  // Verificar que supabase existe
  if (typeof supabase === 'undefined') {
    console.error('Supabase no está disponible. Incluye el SDK antes de auth.js');
    return;
  }

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

  // SuperAdmin SIEMPRE tiene acceso
  if (!empleado.irc_rol && empleado.role !== 'superadmin') {
    await supabase.auth.signOut();
    localStorage.clear();
    alert('Tu acceso al sistema IRC ha sido revocado');
    window.location.href = 'index.html';
    return;
  }
})();

async function logout() {
  if (typeof supabase === 'undefined') {
    console.error('Supabase no disponible');
    return;
  }
  
  if (confirm('¿Cerrar sesión?')) {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = 'index.html';
  }
}

// Escuchar cambios de sesión solo si supabase está disponible
if (typeof supabase !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      localStorage.clear();
      window.location.href = 'index.html';
    }
  });
}
