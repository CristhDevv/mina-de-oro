-- Create landing_sessions table to track user sessions on landing pages
CREATE TABLE IF NOT EXISTS public.landing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    slug TEXT NOT NULL,
    fingerprint TEXT,
    ip TEXT,
    country TEXT,
    city TEXT,
    device TEXT,
    screen TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    user_agent TEXT,
    is_returning BOOLEAN DEFAULT false,
    load_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create landing_events table to track interactions within a session
CREATE TABLE IF NOT EXISTS public.landing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL REFERENCES public.landing_sessions(session_id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    event_type TEXT NOT NULL,
    element TEXT,
    section TEXT,
    metadata JSONB,
    time_on_page_ms INTEGER,
    scroll_pct INTEGER,
    x INTEGER,
    y INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices for performance optimization
CREATE INDEX IF NOT EXISTS idx_landing_sessions_session_id ON public.landing_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_landing_sessions_slug ON public.landing_sessions(slug);
CREATE INDEX IF NOT EXISTS idx_landing_sessions_created_at ON public.landing_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_landing_events_session_id ON public.landing_events(session_id);
CREATE INDEX IF NOT EXISTS idx_landing_events_slug ON public.landing_events(slug);
CREATE INDEX IF NOT EXISTS idx_landing_events_event_type ON public.landing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_landing_events_created_at ON public.landing_events(created_at);

-- RLS Configuration
-- We enable RLS to allow public inserts but restrict selection (reads) to admin users only.
ALTER TABLE public.landing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_events ENABLE ROW LEVEL SECURITY;

-- Policies for landing_sessions
CREATE POLICY "Public anonymous insert" ON public.landing_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin only select" ON public.landing_sessions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Policies for landing_events
CREATE POLICY "Public anonymous insert" ON public.landing_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin only select" ON public.landing_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
