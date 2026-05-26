// auth.js — Auth guard para InOut Repair Center
const supabase = window.supabase.createClient(
  'https://raoxkjnwrccoxjcipfpv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhb3hram53cmNjb3hqY2lwZnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0MzEwNDIsImV4cCI6MjA0NzAwNzA0Mn0.sb_publishable__-K1pC4bOJHRf8JQ__OOzg_jqLxlGla'
);

(async function checkAuth() {
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
