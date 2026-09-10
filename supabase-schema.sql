-- =============================================
-- Facility Email Marketing - Schema Supabase
-- =============================================
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- Tabela de campanhas de email
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  banner_url TEXT,
  image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  youtube_url TEXT,
  whatsapp_number TEXT,
  include_unsubscribe BOOLEAN DEFAULT true,
  total_recipients INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de tracking individual
CREATE TABLE IF NOT EXISTS email_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  opened BOOLEAN DEFAULT false,
  opened_at TIMESTAMPTZ,
  open_count INTEGER DEFAULT 0,
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMPTZ,
  click_count INTEGER DEFAULT 0,
  clicked_url TEXT,
  unsubscribed BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- View de estatisticas por campanha
CREATE OR REPLACE VIEW campaign_stats AS
SELECT
  c.id AS campaign_id,
  c.subject,
  c.sent_at,
  c.total_recipients,
  COUNT(t.id) AS total_tracks,
  COUNT(t.id) FILTER (WHERE t.opened = true) AS opens,
  COUNT(DISTINCT t.id) FILTER (WHERE t.opened = true) AS unique_opens,
  COUNT(t.id) FILTER (WHERE t.clicked = true) AS clicks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.clicked = true) AS unique_clicks,
  COUNT(t.id) FILTER (WHERE t.unsubscribed = true) AS unsubscribes
FROM email_campaigns c
LEFT JOIN email_tracks t ON t.campaign_id = c.id
GROUP BY c.id, c.subject, c.sent_at, c.total_recipients
ORDER BY c.sent_at DESC;

-- Habilitar RLS (Row Level Security)
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies para service_role (acesso total via API server)
CREATE POLICY "Service role can do everything on email_campaigns"
  ON email_campaigns FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on email_tracks"
  ON email_tracks FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on user_settings"
  ON user_settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_email_tracks_campaign ON email_tracks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_tracks_email ON email_tracks(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent ON email_campaigns(sent_at DESC);

-- Tabela de configuracoes do usuario (SMTP)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  smtp_host TEXT,
  smtp_port TEXT DEFAULT '465',
  smtp_user TEXT,
  smtp_password TEXT,
  smtp_from_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
