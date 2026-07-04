const SUPABASE_URL = "https://gbrzudblpuhioxblenof.supabase.co";
const SUPABASE_KEY = "sb_publishable_Wu-AVUP8iBX3ToKRlqx8CA_hD_DWJ88";

let supabase = null;

// Wait for Supabase library to load and initialize the client
function initializeSupabaseClient() {
    if (supabase) return; // Already initialized
    
    if (typeof window.supabase === 'undefined') {
        console.warn('Supabase library not loaded yet, retrying...');
        setTimeout(initializeSupabaseClient, 100);
        return;
    }
    
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase client initialized successfully');
    } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        setTimeout(initializeSupabaseClient, 100);
    }
}

// Try to initialize immediately
initializeSupabaseClient();

// Also try when the page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSupabaseClient);
} else {
    initializeSupabaseClient();
}
