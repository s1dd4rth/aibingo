import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in .env.local and Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase client for real-time subscriptions
 * 
 * This client is configured to:
 * - Subscribe to database changes via Postgres CDC
 * - Handle WebSocket connections automatically
 * - Reconnect on disconnection
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        // Optimize for low-latency updates
        params: {
            eventsPerSecond: 10,
        },
    },
});

/**
 * Helper to subscribe to session changes
 * @param sessionId - The session ID to monitor
 * @param onUpdate - Callback when session data changes
 */
export function subscribeToSession(
    sessionId: string,
    onUpdate: (payload: any) => void
) {
    const channel = supabase
        .channel(`session:${sessionId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'Session',
                filter: `id=eq.${sessionId}`,
            },
            onUpdate
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

/**
 * Helper to subscribe to participant changes for a session
 * @param sessionId - The session ID to monitor participants for
 * @param onUpdate - Callback when participant data changes
 */
export function subscribeToParticipants(
    sessionId: string,
    onUpdate: (payload: any) => void
) {
    const channel = supabase
        .channel(`participants:${sessionId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'Participant',
                filter: `sessionId=eq.${sessionId}`,
            },
            onUpdate
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

/**
 * Helper to subscribe to ALL session changes for a facilitator
 * @param facilitatorEmail - The facilitator's email
 * @param onUpdate - Callback when session data changes
 */
export function subscribeToFacilitatorSessions(
    facilitatorEmail: string,
    onUpdate: (payload: any) => void
) {
    const channel = supabase
        .channel(`facilitator:${facilitatorEmail}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'Session',
                filter: `facilitatorEmail=eq.${facilitatorEmail}`,
            },
            onUpdate
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
