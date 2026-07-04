const SUPABASE_URL = "https://gbrzudblpuhioxblenof.supabase.co";
const SUPABASE_KEY = "sb_publishable_Wu-AVUP8iBX3ToKRlqx8CA_hD_DWJ88";

// Ensure we expose a global client that other scripts can reliably use.
// Many browsers/embedding environments expose the supabase-js library as
// `window.supabase` (which contains createClient). We'll wait for that
// library to load, then create a client and attach it to window.supabase
// (so existing code that references `supabase` continues to work) and
// also to window.supabaseClient for clarity.

(function initializeSupabaseClient() {
    // Avoid redeclaration if already initialized
    try {
        if (window.supabase && window.supabase.from && typeof window.supabase === 'object' && typeof window.supabase.from === 'function') {
            // It's already a client instance (maybe created earlier). Mirror to supabaseClient and return.
            window.supabaseClient = window.supabase;
            console.log('Supabase client already available on window.supabase');
            return;
        }
    } catch (err) {
        // ignore and proceed to initialization
    }

    function tryInit(attempt = 0) {
        try {
            // The CDN library exposes a `createClient` function on window.supabase.
            if (window.supabase && typeof window.supabase.createClient === 'function') {
                const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

                // Attach the created client to globals so other scripts can use it.
                // Overwrite window.supabase (which previously held the library namespace)
                // with the actual client instance so existing checks for `supabase` succeed.
                window.supabase = client;
                window.supabaseClient = client;

                console.log('Supabase client initialized successfully');
                return;
            }

            // If we've retried many times, log a clearer message so debugging is easier.
            if (attempt > 100) {
                console.warn('Supabase library not detected after multiple attempts. Is the CDN script blocked or failing to load?');
                // Keep retrying but with slower backoff
                setTimeout(() => tryInit(attempt + 1), 250);
                return;
            }

            // Retry shortly
            setTimeout(() => tryInit(attempt + 1), 100);
        } catch (err) {
            console.error('Failed to initialize Supabase client:', err);
            // Retry after a short delay
            setTimeout(() => tryInit(attempt + 1), 200);
        }
    }

    // Start attempts immediately
    tryInit(0);

    // Also try again once the DOM is ready (some environments load scripts differently)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => tryInit(0));
    } else {
        tryInit(0);
    }
})();
